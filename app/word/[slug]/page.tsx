import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function WordDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: word, error } = await supabase
    .from("user_words")
    .select("*")
    .eq("user_id", user.id)
    .eq("word", decodeURIComponent(params.slug))
    .single();

  if (error || !word) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6">
      <h1 className="text-4xl font-bold mb-2">{word.word}</h1>
      <p className="text-xl text-muted-foreground mb-6">{word.translation}</p>

      <div className="bg-muted p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Custom Details</h2>
        {word.details ? (
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(word.details, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            No custom details provided.
          </p>
        )}
      </div>
    </div>
  );
}
