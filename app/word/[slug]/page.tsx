"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Word = {
  id: number;
  headword: string;
  slug: string;
  translation: string | null;
  language_code: string;
  notes: string | null;
  created_at: string;
  custom?: any;
};

function normalizeSlug(input: string) {
  return decodeURIComponent(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function WordSlugPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const rawSlug = params.slug;
  const slug = normalizeSlug(rawSlug);

  const supabase = useMemo(() => createClient(), []);
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.replace(`/login?next=/word/${encodeURIComponent(slug)}`);
        return;
      }

      const { data, error } = await supabase
        .from("words")
        .select(
          "id, headword, slug, translation, language_code, notes, created_at"
        )
        .eq("slug", slug)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setWord(data as Word);
      }
      setLoading(false);
    })();
  }, [router, slug, supabase]);

  if (loading) return <div className="p-8">Loading…</div>;

  if (notFound) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <p className="mb-4">Word not found.</p>
        <Link className="underline" href="/dashboard">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl p-6 space-y-6">
      <Link href="/dashboard" className="text-sm underline">
        ← Back
      </Link>

      <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold">{word!.headword}</h1>
        <span className="text-muted-foreground text-sm">
          [{word!.language_code}]
        </span>
      </header>

      {word!.translation && (
        <p className="text-lg text-muted-foreground">{word!.translation}</p>
      )}

      <section className="bg-muted/30 border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-2">Notes</h2>
        {word!.notes ? (
          <p className="text-sm whitespace-pre-wrap">{word!.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
      </section>
    </main>
  );
}
