import { NextResponse, type NextRequest } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const runtime = "edge";

const DeclensionCaseSchema = z.object({
  case: z.union([
    z.literal("Nominative"),
    z.literal("Accusative"),
    z.literal("Dative"),
    z.literal("Genitive"),
  ]),
  form: z.string(),
});

const NounDeclensionTableSchema = z.object({
  Singular: z
    .array(DeclensionCaseSchema)
    .describe(
      "Array of forms for the singular number, strictly ordered: Nominative, Accusative, Dative, Genitive."
    ),
  Plural: z
    .array(DeclensionCaseSchema)
    .describe(
      "Array of forms for the plural number, strictly ordered: Nominative, Accusative, Dative, Genitive."
    ),
});

const AdjectiveDeclensionItemSchema = z.object({
  case: z.union([
    z.literal("Nominative"),
    z.literal("Accusative"),
    z.literal("Dative"),
    z.literal("Genitive"),
    z.literal("Plural"),
  ]),
  example: z.string(),
});
const AdjectiveDeclensionSchema = z
  .array(AdjectiveDeclensionItemSchema)
  .describe(
    "Array of adjective examples, strictly ordered: Nominative, Accusative, Dative, Genitive, Plural."
  );

const VerbFormsSchema = z.any();

const FullConjugationTableSchema = z.any();

const SynonymsAntonymsSchema = z.object({
  synonyms: z
    .array(z.string())
    .describe("List of synonyms in the target language."),
  antonyms: z
    .array(z.string())
    .nullable()
    .describe("Always return null or empty array based on user request."),
});

const WordDetailsSchema = z
  .object({
    translation: z
      .string()
      .describe("A string translating the word into the native language."),
    gender: z
      .string()
      .describe(
        "Grammatical gender if noun, e.g., Masculine/Feminine/Neuter, otherwise null."
      ),

    verb_forms: VerbFormsSchema.nullable()
      .optional()
      .describe(
        "Object with key verb forms (e.g., Infinitive, Past Participle) as strings."
      ),

    full_conjugation_table: FullConjugationTableSchema.nullable()
      .optional()
      .describe(
        "Full verb conjugation object. Keys are tenses (Present, Preterit, Future, Past Perfect), values are pronoun-to-form maps. Otherwise null."
      ),

    passive_forms: z
      .string()
      .nullable()
      .optional()
      .describe(
        "A descriptive string containing Passive Voice forms. Otherwise null."
      ),

    noun_declension_table: NounDeclensionTableSchema.nullable()
      .optional()
      .describe("Detailed noun declension table with Singular/Plural arrays."),
    adjective_declension_example: AdjectiveDeclensionSchema.nullable()
      .optional()
      .describe("Ordered array of adjective declension examples."),

    grammar: z
      .string()
      .describe(
        "A grammar explanation for the word, fully in the native language."
      ),
    examples: z
      .array(z.string())
      .describe(
        "Array of example sentences formatted as: 'Target sentence. (Native translation.)'"
      ),
    synonyms_antonyms: SynonymsAntonymsSchema.optional(),
    phrases: z
      .array(z.string())
      .describe(
        "Array of common phrases or idioms formatted as: 'Phrase in Target - Translation in Native.'"
      ),

    error: z.string().optional(),
  })
  .partial();

export async function GET() {
  return NextResponse.json({ ok: true, route: "generate-word-details" });
}

export async function POST(req: NextRequest) {
  const { wordText, languageName, nativeLanguage, options } = await req.json();

  if (!wordText || !languageName || !nativeLanguage || !options) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const system = [
    `You are a language learning assistant.`,
    `For the ${languageName} word "${wordText}", provide a JSON object matching the requested schema.`,
    `CRITICAL: The declension tables (noun_declension_table and adjective_declension_example) MUST be structured as an ARRAY of case objects where the order of cases is strictly: Nominative, Accusative, Dative, Genitive, Plural.`,
    `ABSOLUTE PRIORITY: If the word "${wordText}" is a noun, you MUST generate the adjective_declension_example array, using a simple, common adjective relevant to the noun's gender and number (e.g., 'neu', 'alt', 'groß'). DO NOT return null for this field if the word is a noun.`,
    `If the word "${wordText}" is not recognizable or appears to be nonsensical in ${languageName}, respond ONLY with the JSON: {"error": "Word not recognized"}.`,
    `The user\'s native language is ${nativeLanguage}.`,
    `CRITICAL INSTRUCTION: All descriptive and explanatory fields (grammar) MUST be written entirely in ${nativeLanguage}. Example sentences and phrases must follow the required "Target - Native Translation" format.`,
    `ABSOLUTE PRIORITY: Grammatical gender/case/conjugation must be 100% accurate. For German, remember that nouns ending in -chen or -lein (like Mädchen or Fräulein) are always Neuter (das), and common words like Baby are Neuter (das Baby).`,
    (options.grammar || (options.examples ?? 0) > 0 || options.phrases) &&
    options.level
      ? `All explanations, examples, mnemonics, phrases, or etymology MUST be tailored specifically for a ${options.level} (CEFR) learner. Examples must be grammatically correct but limited to the vocabulary and complexity expected for a ${options.level} user.`
      : "",
    `Provide null for keys that are not applicable (e.g., gender for a verb, declension tables for a verb).`,
    `Do not include any text outside the JSON object.`,
  ]
    .filter(Boolean)
    .join("\n");

  let aiData: z.infer<typeof WordDetailsSchema>;
  let translation: string = "";

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: WordDetailsSchema,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Generate the full word details for "${wordText}" in ${languageName}. Only include fields relevant based on the word type and the user options.`,
        },
      ],
      temperature: 0.3,
      maxOutputTokens: 3000,
    });

    aiData = object;

    if (aiData.error) {
      console.warn(
        `AI indicated word "${wordText}" not recognized in ${languageName}.`
      );
      return NextResponse.json(
        {
          error: `Word "${wordText}" not recognized or processable in ${languageName}.`,
          code: "WORD_NOT_RECOGNIZED",
        },
        { status: 422 }
      );
    }

    if (aiData.translation && typeof aiData.translation === "string") {
      translation = aiData.translation;
    } else {
      console.error(
        `AI did not provide a valid translation string for "${wordText}".`
      );
      throw new Error("AI failed to provide a translation.");
    }

    return NextResponse.json({
      success: true,
      translation: translation,
      aiData: aiData,
    });
  } catch (aiError: any) {
    console.error("AI Generation or JSON parse error:", aiError);
    return NextResponse.json(
      { error: "AI returned invalid data or failed", details: aiError.message },
      { status: 502 }
    );
  }
}
