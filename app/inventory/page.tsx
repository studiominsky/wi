import { AddLanguageDialog } from "@/components/add-language-dialog";
import { AddWordDialog } from "@/components/add-word-dialog";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { revalidatePath } from "next/cache";
import { cn } from "@/lib/utils";
import { SortControls } from "@/components/sort-controls";

function getBgColorClass(colorString: string | null | undefined): string {
  if (!colorString) return "bg-transparent border-border";
  const lightBgMatch = colorString.match(/bg-([a-z]+)-[0-9]+/);
  const darkBgMatch = colorString.match(/dark:bg-([a-z]+)-[0-9]+\/[0-9]+/);
  let classes = "";
  if (lightBgMatch) classes += `${lightBgMatch[0]} `;
  if (darkBgMatch) classes += `${darkBgMatch[0]}`;
  if (!classes.trim()) return "bg-muted";
  return classes.trim();
}

type SortPreference = "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const { lang: selectedLang } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/inventory");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("word_sort_preference")
    .eq("id", user.id)
    .single();

  const currentSortPreference = (profile?.word_sort_preference ||
    "date_desc") as SortPreference;

  const { data: userLanguages } = await supabase
    .from("user_languages")
    .select("id, language_name")
    .eq("user_id", user.id)
    .order("language_name", { ascending: true });

  let query = supabase
    .from("user_words")
    .select("id, word, translation, color, ai_data")
    .eq("user_id", user.id);

  if (selectedLang) {
    query = query.eq("language_id", selectedLang);
  }

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
    revalidatePath("/inventory");
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Your Word Inventory</h1>
        <div className="flex items-center gap-4">
          <SortControls currentPreference={currentSortPreference} />
          <LanguageSwitcher languages={userLanguages || []} />
          <AddLanguageDialog onLanguageAdded={refreshData} />
          <AddWordDialog
            userLanguages={userLanguages || []}
            onWordAdded={refreshData}
          />
        </div>
      </div>

      {words && words.length > 0 ? (
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
                href={`/word/${encodeURIComponent(word.word)}`}
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
            {userLanguages && userLanguages.length === 0
              ? "Add a language to get started!"
              : "No words yet!"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {userLanguages && userLanguages.length === 0
              ? "Click 'Add Language' above."
              : selectedLang
              ? "No words found for this language."
              : "Click 'Add Word' above to add your first word."}
          </p>
        </div>
      )}
    </div>
  );
}
