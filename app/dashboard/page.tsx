import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: words, error } = await supabase
    .from("user_words")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Your Word Inventory</h1>
        <Link href="/dashboard/add-word">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Word
          </Button>
        </Link>
      </div>

      {words && words.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <Link
              href={`/dashboard/words/${word.word}`}
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
            Click the button above to add your first word.
          </p>
        </div>
      )}
    </div>
  );
}
