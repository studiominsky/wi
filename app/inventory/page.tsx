import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import { AddLanguageDialog } from "@/components/add-language-dialog";
import { LanguageCard } from "@/components/language-card";

export default async function InventoryPage() {
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

  const { data: allWords } = await supabase
    .from("user_words")
    .select("id, language_id")
    .eq("user_id", user.id);

  const wordCounts = (allWords || []).reduce((acc, word) => {
    acc[word.language_id] = (acc[word.language_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Language Hub</h1>
        <AddLanguageDialog />
      </div>

      {allUserLanguages.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="mt-4 text-xl font-semibold">
            Time to start your vocabulary journey!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Click 'Add Language' to set up your first language.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allUserLanguages.map((lang) => (
            <LanguageCard
              key={lang.id}
              id={lang.id}
              name={lang.language_name}
              isoCode={lang.iso_code}
              wordCount={wordCounts[lang.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
