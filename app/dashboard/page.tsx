import { AddLanguageDialog } from "@/components/add-language-dialog";
import { AddWordDialog } from "@/components/add-word-dialog";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { revalidatePath } from "next/cache";

export default async function DashboardPage({
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
    redirect("/login");
  }

  const { data: userLanguages } = await supabase
    .from("user_languages")
    .select("id, language_name")
    .eq("user_id", user.id)
    .order("language_name", { ascending: true });

  let query = supabase
    .from("user_words")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (selectedLang) {
    query = query.eq("language_id", selectedLang);
  }

  const { data: words, error } = await query;

  const refreshData = async () => {
    "use server";
    revalidatePath("/dashboard");
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Your Word Inventory</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher languages={userLanguages || []} />
          <AddLanguageDialog onLanguageAdded={refreshData} />
          <AddWordDialog
            userLanguages={userLanguages || []}
            onWordAdded={refreshData}
          />
        </div>
      </div>

      {words && words.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <Link
              href={`/word/${encodeURIComponent(word.word)}`}
              key={word.id}
              className="block"
            >
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold">{word.word}</h2>
                <p className="text-muted-foreground">{word.translation}</p>
              </div>
            </Link>
          ))}
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
