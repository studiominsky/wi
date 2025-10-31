import { NextResponse, type NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const runtime = "edge";

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

  const requestedKeys = [
    `- "translation": (A string translating the word into ${nativeLanguage})`,

    options.gender_verb_forms
      ? `- "gender": (Grammatical gender if noun and applicable, e.g., Masculine/Feminine/Neuter, otherwise null. Must be in ${languageName} or English.)`
      : "",
    options.gender_verb_forms
      ? `- "verb_forms": (Object with key verb forms like infinitive, past tense, present participle if verb and applicable, otherwise null. Keys and values must be in ${languageName} or English.)`
      : "",

    `- "full_conjugation_table": (Full verb conjugation, including all common tenses and moods (e.g., Present, Past, Perfect, Future, Subjunctive, Passive) in a structured JSON object, only if the word is a verb. The object should use keys for tenses/moods (e.g., "Present Tense") and values as an object/array containing the conjugated forms. Otherwise null.)`,

    options.detailed_grammar_tables
      ? `- "noun_declension_table": (A detailed structured JSON object showing the word's declension for Singular and Plural. Must include the cases: **Nominative, Accusative, Dative, Genitive** in that specific order, with definite articles (e.g., der/die/das). Only if the word is a noun and the language supports declension. Otherwise null.)`
      : "",
    options.detailed_grammar_tables
      ? `- "adjective_declension_example": (A structured JSON object providing an example of an adjective modifying the noun in all cases: **Nominative, Accusative, Dative, Genitive, Plural**. Use a common adjective (e.g., "schöne Frau" for "Frau"). Structure this as a table/object showing the adjective + noun combination for all cases/articles. Only if applicable. Otherwise null.)`
      : "",

    options.grammar
      ? `- "grammar": (A concise grammar explanation for the word. Must be fully in ${nativeLanguage}.)`
      : "",

    (options.examples ?? 0) > 0
      ? `- "examples": (Array of ${options.examples} example sentences. Each array item must be a single string formatted as: "Target language sentence. (${nativeLanguage} translation.)")`
      : "",

    options.synonyms
      ? `- "synonyms_antonyms": (Object with arrays "synonyms" and "antonyms". The words in the arrays must be in ${languageName}.)`
      : "",

    options.mnemonic
      ? `- "mnemonic": (A short, helpful memory aid string. Must be fully in ${nativeLanguage}.)`
      : "",

    options.phrases
      ? `- "phrases": (Array of common phrases or idioms using the word. Each item must be a single string formatted as: "Phrase in ${languageName} - Translation in ${nativeLanguage}")`
      : "",

    options.etymology
      ? `- "etymology": (A brief string explaining the word's origin. Must be fully in ${nativeLanguage}.)`
      : "",
  ].filter(Boolean);

  const system = [
    `You are a language learning assistant.`,
    `For the ${languageName} word "${wordText}", provide only a JSON object matching the requested keys.`,
    `If the word "${wordText}" is not recognizable or appears to be nonsensical in ${languageName}, respond ONLY with the JSON: {"error": "Word not recognized"}.`,
    `The user's native language is ${nativeLanguage}.`,
    `CRITICAL INSTRUCTION: All descriptive and explanatory fields (grammar, mnemonic, etymology) MUST be written entirely in ${nativeLanguage}. Example sentences and phrases must follow the required "Target - Native Translation" format.`,
    (options.grammar ||
      (options.examples ?? 0) > 0 ||
      options.mnemonic ||
      options.phrases ||
      options.etymology) &&
    options.level
      ? `All explanations, examples, mnemonics, phrases, or etymology MUST be tailored specifically for a ${options.level} (CEFR) learner. Examples must be grammatically correct but limited to the vocabulary and complexity expected for a ${options.level} user.`
      : "",
    `Requested keys:`,
    ...requestedKeys,
    `Provide null for keys that are not applicable (e.g., gender for a verb, noun_declension_table for a verb).`,
    `Do not include any text outside the JSON object. Ensure the JSON is valid.`,
  ]
    .filter(Boolean)
    .join("\n");

  let aiData: any;
  let translation: string = "";
  let bodyStr = "";

  try {
    const r = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini-2024-07-18"),
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Respond with the JSON object only." },
      ],
      temperature: 0.3,
      maxOutputTokens: 1500,
    });

    const raw = r.text?.trim() || "";
    const codeFence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    bodyStr = codeFence ? codeFence[1].trim() : raw;

    aiData = JSON.parse(bodyStr);

    if (aiData.error && aiData.error === "Word not recognized") {
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
    console.error("Raw AI response attempt:", bodyStr);
    if (bodyStr.includes('"error": "Word not recognized"')) {
      console.warn(
        `AI indicated word "${wordText}" not recognized (parsing failed).`
      );
      return NextResponse.json(
        {
          error: `Word "${wordText}" not recognized or processable in ${languageName}.`,
          code: "WORD_NOT_RECOGNIZED",
        },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: "AI returned invalid data or failed", details: aiError.message },
      { status: 502 }
    );
  }
}
