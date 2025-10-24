import { NextResponse, type NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  return NextResponse.json({ ok: true, route: "generate-word-details" });
}

export async function POST(req: NextRequest) {
  const { wordId, wordText, languageName, options, userId } = await req.json();

  if (!wordId || !wordText || !languageName || !options || !userId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const system = [
    `You are a language learning assistant.`,
    `For the ${languageName} word "${wordText}", provide only a JSON object matching the requested keys.`,

    `All explanations and examples should be tailored for a ${options.level} (CEFR) learner.`,

    options.grammar
      ? `- "grammar": (A string containing a concise grammar explanation for the word. For example, explain its type, conjugation pattern, or any relevant rules.)`
      : ``,
    (options.examples ?? 0) > 0 ? `- "examples" (${options.examples})` : ``,
    options.difficulty ? `- "difficulty" (Easy|Medium|Hard)` : ``,
    options.synonyms
      ? `- "synonyms_antonyms" with arrays "synonyms" and "antonyms"`
      : ``,
    `No text outside JSON.`,
  ]
    .filter(Boolean)
    .join("\n");

  let aiData: any;

  try {
    const r = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini-2024-07-18"),
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Respond with the JSON object only." },
      ],
      temperature: 0.3,
      maxOutputTokens: 600,
    });

    const raw = r.text?.trim() || "";
    const codeFence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const bodyStr = codeFence ? codeFence[1].trim() : raw;

    aiData = JSON.parse(bodyStr);
  } catch (aiError: any) {
    console.error("AI Generation or JSON parse error:", aiError);
    return NextResponse.json(
      { error: "AI returned invalid data", details: aiError.message },
      { status: 502 }
    );
  }

  try {
    const { error: updateError } = await supabaseAdmin
      .from("user_words")
      .update({ ai_data: aiData })
      .eq("id", wordId)
      .eq("user_id", userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, aiData });
  } catch (dbError: any) {
    console.error("Supabase update error:", dbError);
    return NextResponse.json(
      { error: "Failed to save AI data to database", details: dbError.message },
      { status: 500 }
    );
  }
}
