import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ArticleGuesserClient from "./article-guesser-client";
import Link from "next/link";

interface ArticleGameEntry {
  id: string | number;
  word: string;
  translation: string;
  gender: "Masculine" | "Feminine" | "Neuter";
}

async function fetchArticleGameData(
  userId: string
): Promise<ArticleGameEntry[] | null> {
  const supabase = await createClient();

  const GERMAN_LANGUAGE_NAME = "German";
  const { data: germanLang } = await supabase
    .from("user_languages")
    .select("id")
    .eq("user_id", userId)
    .eq("language_name", GERMAN_LANGUAGE_NAME)
    .single();

  const germanLangId = germanLang?.id;

  if (!germanLangId) return [];

  const { data: words, error } = await supabase
    .from("user_words")
    .select("id, word, translation, ai_data")
    .eq("user_id", userId)
    .eq("language_id", germanLangId);

  if (error) {
    console.error("Error fetching article game data:", error);
    return null;
  }

  const entries: ArticleGameEntry[] = (words || [])
    .map((e) => {
      let gender: "Masculine" | "Feminine" | "Neuter" | null = null;
      try {
        const aiData =
          typeof e.ai_data === "string" ? JSON.parse(e.ai_data) : e.ai_data;
        const normalizedGender = aiData?.gender
          ?.toLowerCase()
          .replace(/\s/g, "");
        if (normalizedGender === "masculine" || normalizedGender === "der") {
          gender = "Masculine";
        } else if (
          normalizedGender === "feminine" ||
          normalizedGender === "die"
        ) {
          gender = "Feminine";
        } else if (
          normalizedGender === "neuter" ||
          normalizedGender === "das"
        ) {
          gender = "Neuter";
        }
      } catch {}

      if (gender) {
        return {
          id: e.id,
          word: e.word,
          translation: e.translation,
          gender: gender,
        } as ArticleGameEntry;
      }
      return null;
    })
    .filter((e): e is ArticleGameEntry => e !== null);

  return entries;
}

export default async function ArticleGuesserPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/games/article-guesser");
  }

  const gameData = await fetchArticleGameData(user.id);

  if (!gameData || gameData.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4">
        <h1 className="text-3xl font-grotesk md:text-4xl">
          Article Guesser (Der/Die/Das)
        </h1>
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="mt-4 text-xl font-semibold">
            No Nouns with Gender Found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please add German Nouns to your{" "}
            <Link href="/inventory" className="text-primary hover:underline">
              Inventory
            </Link>{" "}
            with AI-generated details to play this game.
          </p>
        </div>
      </div>
    );
  }

  return <ArticleGuesserClient initialData={gameData} />;
}
