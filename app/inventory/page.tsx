import { AddWordDialog } from "@/components/add-word-dialog";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { revalidatePath } from "next/cache";
import { cn } from "@/lib/utils";
import { SortControls } from "@/components/sort-controls";

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
    .select("id, word, translation, color, ai_data")
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

  const langDisplay = `Inventory`;
  const showList = words && words.length > 0;

  const userLanguages = [germanLanguage];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{langDisplay}</h1>
        <div className="flex items-center gap-4">
          <SortControls currentPreference={currentSortPreference} />

          <AddWordDialog
            userLanguages={userLanguages}
            currentLanguageId={currentLangId}
            onWordAdded={refreshData}
          />
        </div>
      </div>

      {showList ? (
        <div className="border rounded-md">
          {words.map((word, index) => {
            let gender: string | null = null;
            if (word.ai_data) {
              try {
                const aiData =
                  typeof word.ai_data === "string"
                    ? JSON.parse(word.ai_data)
                    : word.ai_data;
                gender = aiData?.gender || null;
              } catch (e) {
                console.error(
                  "Failed to parse ai_data for word:",
                  word.word,
                  e
                );
              }
            }
            const colorClass = getBgColorClass(word.color);

            return (
              <Link
                href={`/inventory/${encodeURIComponent(word.word)}`}
                key={word.id}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors",
                  index < words.length - 1 && "border-b"
                )}
              >
                <span
                  className={cn(
                    "size-3 rounded-full shrink-0 border",
                    colorClass
                  )}
                />
                <div className="flex items-baseline gap-2 flex-1 min-w-0">
                  <span className="font-semibold truncate">{word.word}</span>
                  {gender && (
                    <span className="text-xs text-muted-foreground italic shrink-0">
                      ({gender})
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground truncate hidden sm:block w-1/4">
                  {word.translation || "..."}
                </span>
                <ChevronRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
              </Link>
            );
          })}
        </div>
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
