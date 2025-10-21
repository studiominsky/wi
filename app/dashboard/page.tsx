import { createServerClientRSC } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen } from "lucide-react";
import LanguageSwitcher from "./language-switcher"; // Import new component

type Word = {
  id: string;
  word: string;
  slug: string;
  translation?: string | null;
  language_id?: string | null;
  created_at?: string | null;
  user_id?: string | null;
};
// Define the page as an async component that accepts searchParams
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const selectedLang = searchParams.lang;

  const supabase = await createServerClientRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch languages for the dropdown
  const { data: languages } = await supabase
    .from("languages")
    .select("id, name");

  // Build the query for words
  let query = supabase
    .from("user_words")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Add the language filter if one is selected
  if (selectedLang) {
    query = query.eq("language_id", selectedLang); // Assuming 'language_id'
  }

  const { data: words, error } = await query;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Your Word Inventory</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher languages={languages || []} />
          <Link href="/dashboard/add-word">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Word
            </Button>
          </Link>
        </div>
      </div>

      {words && words.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word: Word) => (
            <Link
              // FIX: This link was pointing to a non-existent route.
              // It should point to /word/[slug]
              href={`/word/${word.slug}`}
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
          <h2 className="mt-4 text-xl font-semibold">No words yet!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedLang
              ? "No words found for this language."
              : "Click the button above to add your first word."}
          </p>
        </div>
      )}
    </div>
  );
}
