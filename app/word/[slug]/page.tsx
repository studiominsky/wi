// studiominsky/wi/wi-f7e042deb6451d23e7f0522a2dd16ccf927b33c6/app/word/[slug]/page.tsx
import { createServerClientRSC } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function WordDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // FIX: Await params BEFORE using its properties, per Next.js 15 docs
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const supabase = await createServerClientRSC();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/word/${slug}`);
  }

  const { data: word, error } = await supabase
    .from("user_words")
    .select("*, notes")
    .eq("user_id", user.id)
    .eq("word", decodedSlug)
    .single();

  if (error || !word) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6">
      <h1 className="text-4xl font-bold mb-2">{word.word}</h1>
      <p className="text-xl text-muted-foreground mb-6">{word.translation}</p>

      <div className="bg-muted p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Notes</h2>
        {word.notes ? (
          <p className="text-sm whitespace-pre-wrap">{word.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No notes provided.</p>
        )}
      </div>
    </div>
  );
}
