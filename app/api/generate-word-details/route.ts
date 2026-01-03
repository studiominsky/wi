import { NextResponse, type NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ ok: true, route: "generate-word-details" });
}

export async function POST(req: NextRequest) {
  const { wordText, nativeLanguage, options, isNativePhrase } =
    await req.json();
  const languageName = "German";

  if (!wordText || !nativeLanguage || !options) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const isPhrase = wordText.trim().includes(" ");
  const isNativePhraseMode = !!isNativePhrase;
  const PRONOUN_ORDER = "ich, du, er/sie/es, wir, ihr, sie";

  const sourceLang = isNativePhraseMode ? nativeLanguage : languageName;
  const targetLang = isNativePhraseMode ? languageName : nativeLanguage;

  const instruction = isNativePhraseMode
    ? `Translate the input from ${sourceLang} into ${targetLang}. The input is a sentence or phrase.`
    : isPhrase
    ? `The input is a phrase or sentence in ${sourceLang}. Provide a detailed explanation of its meaning and context in the grammar field.`
    : `The input is a word in ${sourceLang}. Determine if it is a noun, verb, or other part of speech and provide relevant grammatical details.`;

  const requestedKeys = [
    isNativePhraseMode ? `- "original_phrase_language": ("${sourceLang}")` : "",
    `- "category": (A single string classifying the input for filtering. Must be one of: "Noun", "Verb", "Adjective", "Adverb", "Preposition", "Conjunction", "Phrase/Sentence", or "Other".)`,
    `- "translation": (A string translating the text into ${targetLang})`,
    !isNativePhraseMode && !isPhrase && options.gender_verb_forms
      ? `- "gender": (Grammatical gender if noun and applicable, e.g., Masculine/Feminine/Neuter, otherwise null.)`
      : "",
    !isNativePhraseMode && !isPhrase && options.gender_verb_forms
      ? `- "verb_forms": (Object with key verb forms like infinitive, past tense, present participle if verb and applicable, otherwise null.)`
      : "",
    !isNativePhraseMode && !isPhrase
      ? `- "full_conjugation_table": (Full verb conjugation. CRITICAL: Use these EXACT German keys: "Präsens", "Perfekt", "Präteritum", "Futur I", "Plusquamperfekt". Structure as JSON object where keys are Tense names and values are an object where keys are Pronouns (${PRONOUN_ORDER}). Otherwise null.)`
      : "",
    !isNativePhraseMode && !isPhrase
      ? `- "passive_forms": (Object containing passive voice forms. Use these EXACT German keys: "Präsens", "Perfekt", "Präteritum", "Futur I", "Plusquamperfekt". Only if applicable and the word is a verb. Otherwise null.)`
      : "",
    !isNativePhraseMode && !isPhrase && options.detailed_grammar_tables
      ? `- "noun_declension_table": (Structured JSON showing the word's declension. CRITICAL: Use keys "Singular" and "Plural". Each should contain "Nominativ", "Akkusativ", "Dativ", "Genitiv". Otherwise null.)`
      : "",
    !isNativePhraseMode && !isPhrase && options.detailed_grammar_tables
      ? `- "adjective_declension_example": (Structured JSON providing an example of an adjective modifying the noun. Otherwise null.)`
      : "",
    options.grammar
      ? `- "grammar": (A concise grammar explanation. Use <b>text</b> tags instead of ** for bolding. Must be fully in ${nativeLanguage}.)`
      : "",
    (options.examples ?? 0) > 0
      ? `- "examples": (Array of ${options.examples} example sentences using the phrase/word.)`
      : "",
    options.synonyms
      ? `- "synonyms_antonyms": (Object with arrays "synonyms" and "antonyms". If no synonyms or antonyms exist, return null.)`
      : "",
    options.phrases
      ? `- "phrases": (Array of common phrases or idioms related to the word/phrase.)`
      : "",
  ].filter(Boolean);

  const system = [
    `You are a language learning assistant.`,
    `For the input "${wordText}", ${instruction}`,
    `If the input "${wordText}" is not recognizable, respond ONLY with: {"error": "Word not recognized"}.`,
    `Native language: ${nativeLanguage}. Learning language: ${languageName}.`,
    `CRITICAL: All explanations in "grammar" MUST use <b>tags</b> for bolding. Never use **.`,
    `CRITICAL: Use German tense names: Präsens, Perfekt, Präteritum, Futur I, Plusquamperfekt.`,
    `CRITICAL: For noun declension, the order of cases must be: Nominativ, Akkusativ, Dativ, Genitiv.`,
    `Do not include any text outside the JSON object. Ensure the JSON is valid.`,
  ].join("\n");

  try {
    const r = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-2.0-flash"),
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Respond with the JSON object only." },
      ],
      temperature: 0.3,
      maxOutputTokens: 3000,
    });

    const raw = r.text?.trim() || "";
    const codeFence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const bodyStr = codeFence ? codeFence[1].trim() : raw;

    const aiData = JSON.parse(bodyStr);

    if (aiData.error === "Word not recognized") {
      return NextResponse.json(
        {
          error: `Word or phrase "${wordText}" not recognized.`,
          code: "WORD_NOT_RECOGNIZED",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      translation: aiData.translation,
      aiData: aiData,
    });
  } catch (aiError: any) {
    return NextResponse.json(
      { error: "AI returned invalid data or failed", details: aiError.message },
      { status: 502 }
    );
  }
}
