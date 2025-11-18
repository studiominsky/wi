import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import QuickRecallClient from "./quick-reacll-client";

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
      .select("id, word, translation")
      .eq("user_id", userId)
      .eq("language_id", germanLangId);

    wordData = result.data || [];
    wordError = result.error;
  }

  const { data: translationData, error: translationError } = await supabase
    .from("user_translations")
    .select("id, word, translation")
    .eq("user_id", userId);

  if (wordError || translationError) {
    console.error("Error fetching game data:", {
      words: wordError,
      translations: translationError,
    });
    return null;
  }

  const entries: Array<{
    source: string;
    target: string;
    direction: "G-N" | "N-G";
  }> = [];

  (wordData || []).forEach((e) => {
    if (e.word && e.translation) {
      entries.push({
        source: e.word,
        target: e.translation,
        direction: "G-N",
      });
    }
  });

  (translationData || []).forEach((e) => {
    if (e.word && e.translation) {
      entries.push({
        source: e.word,
        target: e.translation,
        direction: "N-G",
      });
    }
  });

  return entries;
}

export default async function QuickRecallPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/games/quick-recall");
  }

  const gameData = await fetchGameData(user.id);

  if (!gameData || gameData.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4">
        <h1 className="text-3xl font-grotesk md:text-4xl">
          Quick Recall Challenge
        </h1>
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

  return <QuickRecallClient initialData={gameData} />;
}
