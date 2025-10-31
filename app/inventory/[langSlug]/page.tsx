// studiominsky/wi/wi-6490d5e232baaf957c0eb90cafd653377333ef59/app/inventory/[langSlug]/page.tsx
import { AddLanguageDialog } from "@/components/add-language-dialog";
import { AddWordDialog } from "@/components/add-word-dialog";
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { revalidatePath } from "next/cache";
import { cn } from "@/lib/utils";
import { SortControls } from "@/components/sort-controls";
import { LanguageSelector } from "@/components/language-selector"; // Now pointing to the created component

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
  params,
}: {
  params: { langSlug?: string };
}) {
  const langSlug = params?.langSlug;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/inventory");
  }

  const { data: userLanguages } = await supabase
    .from("user_languages")
    .select("id, language_name, iso_code")
    .eq("user_id", user.id)
    .order("language_name", { ascending: true });

  const allUserLanguages = userLanguages || [];

  let selectedLanguage: {
    id: string;
    iso_code: string;
    language_name: string;
  } | null = null;
  let redirectPath: string | null = null;

  if (allUserLanguages.length === 0) {
    // No languages added. This will trigger the empty state.
  } else if (!langSlug || langSlug === "start") {
    // Also handle the '/inventory/start' redirect
    // If the path is /inventory (no slug), or the placeholder slug 'start', redirect to the first language's slug
    const firstLanguage = allUserLanguages.find((l) => l.iso_code);
    if (firstLanguage) {
      redirectPath = `/inventory/${firstLanguage.iso_code}`;
    }
  } else {
    // If langSlug is provided, find the language ID
    const foundLanguage = allUserLanguages.find(
      (lang) => lang.iso_code?.toLowerCase() === langSlug.toLowerCase()
    );

    if (foundLanguage) {
      selectedLanguage = foundLanguage as any;
    } else {
      // If slug is invalid, redirect to the first valid language
      const firstLanguage = allUserLanguages.find((l) => l.iso_code);
      if (firstLanguage) {
        redirectPath = `/inventory/${firstLanguage.iso_code}`;
      }
    }
  }

  if (redirectPath) {
    redirect(redirectPath);
  }

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
    .eq("user_id", user.id);

  if (selectedLanguage) {
    query = query.eq("language_id", selectedLanguage.id);
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
    revalidatePath(`/inventory/${langSlug || ""}`);
  };

  const currentLangName = selectedLanguage?.language_name || "Language";
  const currentLangId = selectedLanguage?.id || "";
  const langDisplay = selectedLanguage
    ? `Inventory: ${currentLangName}`
    : "Your Word Inventory";
  // The list should only show if a language is selected AND words are found.
  // If no language is selected (e.g. if allUserLanguages.length === 0) or if words are empty.
  const showList = selectedLanguage && words && words.length > 0;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{langDisplay}</h1>
        <div className="flex items-center gap-4">
          <SortControls currentPreference={currentSortPreference} />

          {allUserLanguages.length > 0 && selectedLanguage?.iso_code && (
            <LanguageSelector
              userLanguages={allUserLanguages as any[]}
              langSlug={selectedLanguage.iso_code}
            />
          )}

          <AddLanguageDialog onLanguageAdded={refreshData} />
          <AddWordDialog
            userLanguages={allUserLanguages}
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
            {allUserLanguages.length === 0
              ? "Add a language to get started!"
              : `No words yet for ${currentLangName}!`}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {allUserLanguages.length === 0
              ? "Click 'Add Language' above."
              : `Click 'Add Word' above to add your first word to ${currentLangName}.`}
          </p>
        </div>
      )}
    </div>
  );
}
