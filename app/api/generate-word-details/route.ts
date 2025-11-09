import { NextResponse, type NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ ok: true, route: "generate-word-details" });
}

export async function POST(req: NextRequest) {
  const { wordText, nativeLanguage, options } = await req.json();
  const languageName = "German";

  if (!wordText || !nativeLanguage || !options) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const isPhrase = wordText.trim().includes(" ");

  const PRONOUN_ORDER = "ich, du, er/sie/es, wir, ihr, sie";

  const requestedKeys = [
    `- "category": (A single string classifying the input for filtering. Must be one of: "Noun", "Verb", "Adjective", "Adverb", "Preposition", "Conjunction", "Phrase/Sentence", or "Other".)`,
    `- "translation": (A string translating the word or phrase into ${nativeLanguage})`,

    !isPhrase && options.gender_verb_forms
      ? `- "gender": (Grammatical gender if noun and applicable, e.g., Masculine/Feminine/Neuter, otherwise null. Must be in ${languageName} or English.)`
      : "",
    !isPhrase && options.gender_verb_forms
      ? `- "verb_forms": (Object with key verb forms like infinitive, past tense, present participle if verb and applicable, otherwise null. Keys and values must be in ${languageName} or English.)`
      : "",

    !isPhrase
      ? `- "full_conjugation_table": (Full verb conjugation, including **Present**, **Preterit/Simple Past**, **Perfect**, **Future**, and **Past Perfect** tenses. Structure this as a JSON object where keys are the Tense names and values are an object/map where keys are **Pronouns (${PRONOUN_ORDER})** and values are the conjugated forms. Otherwise null.)`
      : "",

    !isPhrase
      ? `- "passive_forms": (A detailed description in ${nativeLanguage} of the **Active Voice** forms for the **Present Passive**, **Preterit Passive**, and **Perfect Passive**. Only if the word is a verb. Otherwise null.)`
      : "",

    !isPhrase && options.detailed_grammar_tables
      ? `- "noun_declension_table": (A detailed structured JSON object showing the word's declension. CRITICAL: Use this EXACT structure with keys in this EXACT order:
{
  "Singular": {
    "Nominative": "der/die/das + word",
    "Accusative": "den/die/das + word",
    "Dative": "dem/der/dem + word",
    "Genitive": "des/der/des + word"
  },
  "Plural": {
    "Nominative": "die + word",
    "Accusative": "die + word",
    "Dative": "den + word",
    "Genitive": "der + word"
  }
}
Only if the word is a noun and the language supports declension. Otherwise null.)`
      : "",
    !isPhrase && options.detailed_grammar_tables
      ? `- "adjective_declension_example": (A structured JSON object providing an example of an adjective modifying the noun. CRITICAL: Use this EXACT structure with keys in this EXACT order:
{
  "Nominative": "article + adjective + noun",
  "Accusative": "article + adjective + noun",
  "Dative": "article + adjective + noun",
  "Genitive": "article + adjective + noun",
  "Plural": "article + adjective + noun"
}
Use a common adjective (e.g., "schöne" for "Frau"). Only if applicable. Otherwise null.)`
      : "",

    options.grammar
      ? `- "grammar": (A concise grammar/usage explanation for the word or phrase. Must be fully in ${nativeLanguage}.)`
      : "",

    (options.examples ?? 0) > 0
      ? `- "examples": (Array of ${options.examples} example sentences using the word or phrase. Each array item must be a single string formatted as: "Target language sentence. (${nativeLanguage} translation.)")`
      : "",

    options.synonyms
      ? `- "synonyms_antonyms": (Object with arrays "synonyms" and "antonyms". The words in the arrays must be in ${languageName}. If the input is a phrase, provide equivalent phrases/expressions instead of single words.)`
      : "",

    options.phrases
      ? `- "phrases": (Array of common phrases or idioms using the word or equivalent phrases/expressions. Each item must be a single string formatted as: "Phrase in ${languageName} - Translation in ${nativeLanguage}")`
      : "",
  ].filter(Boolean);

  const system = [
    `You are a language learning assistant.`,
    `For the ${languageName} input "${wordText}", provide only a JSON object matching the requested keys.`,
    isPhrase
      ? `The input is a phrase or sentence. Treat it as such. Provide a detailed explanation of its meaning and context in the grammar field.`
      : `The input is a word. Determine if it is a noun, verb, or other part of speech and provide relevant grammatical details.`,
    `If the input "${wordText}" is not recognizable or appears to be nonsensical in ${languageName}, respond ONLY with the JSON: {"error": "Word not recognized"}.`,
    `The user's native language is ${nativeLanguage}.`,
    `CRITICAL INSTRUCTION: All descriptive and explanatory fields (grammar) MUST be written entirely in ${nativeLanguage}. Example sentences and phrases must follow the required "Target - Native Translation" format.`,
    `CRITICAL INSTRUCTION: First and foremost, you MUST classify the input "${wordText}" and provide the result in the mandatory "category" field.`,
    `ABSOLUTE PRIORITY: Grammatical gender/case/conjugation must be 100% accurate. For German, remember that nouns ending in -chen or -lein are always Neuter (das), and common words like Baby are Neuter (das Baby).`,
    `CRITICAL FOR CASE TABLES AND VERB CONJUGATION: You MUST follow the exact key names, order, and structure specified in the requested keys above.`,
    `ABSOLUTE PRIORITY: If "${wordText}" is a verb, you MUST provide data for **Present**, **Preterit**, **Perfect**, **Future**, and **Past Perfect** tenses in "full_conjugation_table". DO NOT return null for these tenses.`,
    (options.grammar || (options.examples ?? 0) > 0 || options.phrases) &&
    options.level
      ? `All explanations, examples, phrases MUST be tailored specifically for a ${options.level} (CEFR) learner. Examples must be grammatically correct but limited to the vocabulary and complexity expected for a ${options.level} user.`
      : "",
    `Requested keys:`,
    ...requestedKeys,
    `Provide null for keys that are not applicable (e.g., gender for a phrase, noun_declension_table for a phrase/verb, or for any field that was explicitly excluded from the request).`,
    `Do not include any text outside the JSON object. Ensure the JSON is valid.`,
  ]
    .filter(Boolean)
    .join("\n");

  let aiData: any;
  let translation: string = "";
  let bodyStr = "";

  try {
    const r = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-2.5-flash"),
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Respond with the JSON object only." },
      ],
      temperature: 0.3,
      maxOutputTokens: 3000,
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
          error: `Word or phrase "${wordText}" not recognized or processable in ${languageName}.`,
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
          error: `Word or phrase "${wordText}" not recognized or processable in ${languageName}.`,
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
