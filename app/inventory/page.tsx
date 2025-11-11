import { AddWordDialog } from "@/components/add-word-dialog";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { revalidatePath } from "next/cache";
import { WordTable } from "@/components/word-table";

function getBgColorClass(colorString: null | undefined): string {
  if (!colorString) return "bg-transparent border-border";
  const lightBgMatch = String(colorString).match(/bg-([a-z]+)-[0-9]+/);
  const darkBgMatch = String(colorString).match(
    /dark:bg-([a-z]+)-[0-9]+\/[0-9]+/
  );
  let classes = "";
  if (lightBgMatch) classes += `${lightBgMatch[0]} `;
  if (darkBgMatch) classes += `${darkBgMatch[0]}`;
  if (!classes.trim()) return "bg-muted";
  return classes.trim();
}

type SortPreference = "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

const GERMAN_LANGUAGE_NAME = "German";
const GERMAN_ISO_CODE = "de";

async function getOrCreateGermanLanguage(userId: string) {
  const supabase = await createClient();

  const { data: existingLang } = await supabase
    .from("user_languages")
    .select("id, language_name, iso_code")
    .eq("user_id", userId)
    .eq("language_name", GERMAN_LANGUAGE_NAME)
    .single();

  if (existingLang) {
    return existingLang;
  }

  const { data: newLang, error: insertError } = await supabase
    .from("user_languages")
    .insert({
      user_id: userId,
      language_name: GERMAN_LANGUAGE_NAME,
      iso_code: GERMAN_ISO_CODE,
    })
    .select("id, language_name, iso_code")
    .single();

  if (insertError) {
    console.error("Error creating German language entry:", insertError);
    throw new Error("Failed to initialize German language setup.");
  }

  return newLang;
}

export default async function GermanInventoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/inventory");
  }

  let germanLanguage;
  try {
    germanLanguage = await getOrCreateGermanLanguage(user.id);
  } catch (e) {
    redirect("/login");
  }

  const currentLangId = germanLanguage.id;
  const currentLangName = germanLanguage.language_name;

  const { data: profile } = await supabase
    .from("profiles")
    .select("word_sort_preference")
    .eq("id", user.id)
    .single();

  const currentSortPreference = (profile?.word_sort_preference ||
    "date_desc") as SortPreference;

  let query = supabase
    .from("user_words")
    .select("id, word, translation, color, ai_data, notes, image_url")
    .eq("user_id", user.id)
    .eq("language_id", currentLangId);

  switch (currentSortPreference) {
    case "date_asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "alpha_asc":
      query = query.order("word", { ascending: true });
      break;
    case "alpha_desc":
      query = query.order("word", { ascending: false });
      break;
    case "date_desc":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: words, error } = await query;

  const refreshData = async () => {
    "use server";
    revalidatePath(`/inventory`);
  };

  const formattedWords =
    words?.map((word) => {
      let gender: string | null = null;
      let category: string | null = null;
      let colorClass: string = getBgColorClass(word.color);

      if (word.ai_data) {
        try {
          const aiData =
            typeof word.ai_data === "string"
              ? JSON.parse(word.ai_data)
              : word.ai_data;
          gender = aiData?.gender || null;
          category = aiData?.category || null;
        } catch (e) {
          console.error("Failed to parse ai_data for word:", word.word, e);
        }
      }

      return {
        id: word.id,
        word: word.word,
        translation: word.translation || "...",
        color: word.color,
        category: category,
        gender: gender,
        colorClass: colorClass,
        notes: word.notes,
        image_url: word.image_url,
      };
    }) || [];

  const langDisplay = `Inventory`;
  const showList = formattedWords.length > 0;

  const userLanguages = [germanLanguage];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{langDisplay}</h1>
        <div className="flex items-center gap-4">
          <AddWordDialog
            userLanguages={userLanguages}
            currentLanguageId={currentLangId}
            onWordAdded={refreshData}
          />
        </div>
      </div>

      {showList ? (
        <WordTable
          words={formattedWords}
          currentSortPreference={currentSortPreference}
        />
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">
            No words yet for {currentLangName}!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Click 'Add Word' above to add your first word to {currentLangName}.
          </p>
        </div>
      )}
    </div>
  );
}
