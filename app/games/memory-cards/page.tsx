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
      .select("id, word, translation, ai_data, image_url, color")
      .eq("user_id", userId)
      .eq("language_id", germanLangId);

    wordData = result.data || [];
    wordError = result.error;
  }

  const { data: translationData, error: translationError } = await supabase
    .from("user_translations")
    .select("id, word, translation, ai_data, image_url, color")
    .eq("user_id", userId);

  if (wordError || translationError) {
    console.error("Error fetching game data:", {
      words: wordError,
      translations: translationError,
    });
    return null;
  }

  const getGermanDetails = (e: any) => {
    let article: string | null = null;
    let gender: string | null = null;
    let aiData: any = null;

    try {
      aiData =
        typeof e.ai_data === "string" ? JSON.parse(e.ai_data) : e.ai_data;
    } catch {}

    if (aiData?.gender) {
      gender = aiData.gender.toLowerCase().replace(/\s/g, "");
    }

    if (gender === "masculine" || gender === "der") {
      article = "Der";
    } else if (gender === "feminine" || gender === "die") {
      article = "Die";
    } else if (gender === "neuter" || gender === "das") {
      article = "Das";
    }

    const all_examples: string[] = aiData?.examples || [];

    return {
      article,
      image_url: e.image_url,
      all_examples,
    };
  };

  const allEntries = [
    ...(wordData || []).map((e) => {
      const { article, image_url, all_examples } = getGermanDetails(e);
      const germanDisplay = article && e.word ? `${article} ${e.word}` : e.word;

      const singleExample =
        all_examples.length > 0
          ? (all_examples[0] || "").split("(")[0].trim()
          : "No example available. (e.g., Sie mag Äpfel.)";

      return {
        id: `word-${e.id}`,
        german: e.word,
        germanDisplay: germanDisplay,
        native: e.translation,
        article: article,
        image_url: image_url,
        all_examples: all_examples,
        color: e.color,
        example: singleExample,
      };
    }),
    ...(translationData || []).map((e) => {
      const { image_url, all_examples } = getGermanDetails(e);

      const singleExample =
        all_examples.length > 0
          ? (all_examples[0] || "").split("(")[0].trim()
          : "No example available. (e.g., I'm going running tomorrow morning.)";

      return {
        id: `trans-${e.id}`,
        german: e.translation,
        germanDisplay: e.translation,
        native: e.word,
        article: null,
        image_url: image_url,
        all_examples: all_examples,
        color: e.color,
        example: singleExample,
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
