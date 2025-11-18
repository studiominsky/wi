import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MemoryCardsClient from "./memory-cards-client";

async function fetchGameData(userId: string) {
  const supabase = await createClient();

  const GERMAN_LANGUAGE_NAME = "German";
  const { data: germanLang } = await supabase
    .from("user_languages")
    .select("id")
    .eq("user_id", userId)
    .eq("language_name", GERMAN_LANGUAGE_NAME)
    .single();

  const germanLangId = germanLang?.id;

  let wordData = [] as any[];
  let wordError = null as any;

  if (germanLangId) {
    const result = await supabase
      .from("user_words")
      .select("id, word, translation, ai_data")
      .eq("user_id", userId)
      .eq("language_id", germanLangId);

    wordData = result.data || [];
    wordError = result.error;
  }

  const { data: translationData, error: translationError } = await supabase
    .from("user_translations")
    .select("id, word, translation, ai_data")
    .eq("user_id", userId); // CORRECTED column name

  if (wordError || translationError) {
    console.error("Error fetching game data:", {
      words: wordError,
      translations: translationError,
    });
    return null;
  }

  const allEntries = [
    ...(wordData || []).map((e) => {
      let example = "No example available. (e.g., Sie mag Äpfel.)";
      try {
        const aiData =
          typeof e.ai_data === "string" ? JSON.parse(e.ai_data) : e.ai_data;
        if (aiData?.examples?.length > 0) {
          // Use the first example, stripping the translation part if present
          const firstExample = (aiData.examples[0] || "").split("(")[0].trim();
          if (firstExample) example = firstExample;
        }
      } catch {}

      return {
        id: `word-${e.id}`,
        german: e.word,
        native: e.translation,
        example: example,
      };
    }),
    ...(translationData || []).map((e) => {
      let example =
        "No example available. (e.g., I'm going running tomorrow morning.)";
      try {
        const aiData =
          typeof e.ai_data === "string" ? JSON.parse(e.ai_data) : e.ai_data;
        if (aiData?.examples?.length > 0) {
          // Use the first example
          const firstExample = (aiData.examples[0] || "").split("(")[0].trim();
          if (firstExample) example = firstExample;
        }
      } catch {}

      return {
        id: `trans-${e.id}`,
        german: e.translation,
        native: e.word,
        example: example,
      };
    }),
  ];

  const filteredEntries = allEntries.filter((e) => e.german && e.native);

  return filteredEntries;
}

export default async function MemoryCardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/games/memory-cards");
  }

  const gameData = await fetchGameData(user.id);

  if (!gameData || gameData.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4">
        <h1 className="text-3xl font-grotesk md:text-4xl">Memory Cards</h1>
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="mt-4 text-xl font-semibold">No Vocabulary Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please add words to your{" "}
            <Link href="/inventory" className="text-primary hover:underline">
              Inventory
            </Link>{" "}
            or{" "}
            <Link href="/translations" className="text-primary hover:underline">
              Translations
            </Link>{" "}
            to play.
          </p>
        </div>
      </div>
    );
  }

  return <MemoryCardsClient initialData={gameData} />;
}
