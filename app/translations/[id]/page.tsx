import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EntryActionMenu } from "@/components/edit-word-dialog";
import { ImageWithErrorBoundary } from "@/components/image-error-boundary";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

function TagsDisplay({ tags }: { tags: string[] | null }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-4">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="hover:opacity-80 transition-opacity"
        >
          <Badge variant="secondary" className="capitalize cursor-pointer">
            {tag}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

function AiDataSection({ title, data }: { title: string; data: any }) {
  if (data === null || data === undefined || data === "") return null;

  let content;

  if (typeof data === "string") {
    content = <p className="text-md leading-7 whitespace-pre-wrap">{data}</p>;
  } else if (Array.isArray(data)) {
    if (data.length === 0) return null;
    content = (
      <ul className="list-disc list-inside space-y-1 text-md leading-7">
        {(data as any[]).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  } else if (typeof data === "object") {
    if (title === "Equivalent Phrases" && (data as any).synonyms?.length > 0) {
      content = (
        <div className="text-sm space-y-1">
          <p>
            <strong>Equivalent Phrases:</strong>{" "}
            {(data as any).synonyms.join(", ")}
          </p>
        </div>
      );
    } else if (Object.keys(data).length === 0) {
      return null;
    } else {
      content = <p className="text-sm">{JSON.stringify(data)}</p>;
    }
  } else {
    content = <p className="text-sm">{String(data)}</p>;
  }

  if (!content) return null;

  return (
    <div className="pt-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {content}
    </div>
  );
}

export default async function TranslationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/translations/${id}`);

  const { data: translationEntry, error } = await supabase
    .from("user_translations")
    .select("*, notes, ai_data, translation, color, image_url, tags")
    .eq("user_id", user.id)
    .eq("id", id)
    .single();

  if (error || !translationEntry) notFound();

  const aiData = translationEntry.ai_data
    ? typeof translationEntry.ai_data === "string"
      ? (() => {
          try {
            return JSON.parse(translationEntry.ai_data);
          } catch {
            return null;
          }
        })()
      : translationEntry.ai_data
    : null;

  const nativePhrase = translationEntry.word;
  const germanTranslation = translationEntry.translation;
  const originalLanguage = aiData?.original_phrase_language;

  const entryForEdit = {
    id: translationEntry.id,
    word: nativePhrase,
    translation: germanTranslation,
    notes: translationEntry.notes,
    color: translationEntry.color,
    image_url: translationEntry.image_url,
    tags: (translationEntry as any).tags || null,
  };

  return (
    <>
      <div className={cn("relative w-full pb-10")}>
        <div className="container mx-auto max-w-8xl p-4 md:p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/translations"
              className="inline-flex items-center gap-2 text-xs md:text-sm text-foreground font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                Back to Native Translations
              </span>
              <span className="sm:hidden">Back</span>
            </Link>
            <EntryActionMenu entry={entryForEdit} isNativePhrase={true} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2 flex flex-col justify-end order-2 md:order-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight break-words">
                {nativePhrase}
              </h1>
              <p className="mt-2 text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                {germanTranslation || "German translation not generated yet."}
              </p>

              <div className="space-y-3 mt-5">
                <div className="inline-flex max-w-xl rounded-md overflow-hidden shadow-sm">
                  <div
                    className={cn(
                      "w-1.5 flex-shrink-0",
                      translationEntry.color || "bg-primary"
                    )}
                  />

                  <div className="relative flex-1">
                    {translationEntry.color && (
                      <div
                        className={cn(
                          "absolute inset-0 pointer-events-none opacity-20",
                          translationEntry.color
                        )}
                      />
                    )}

                    <div className="relative space-y-2 px-4 py-3 bg-muted/60">
                      <div className="flex flex-col flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-foreground/90">
                        {originalLanguage && (
                          <div className="flex items-center gap-2">
                            <span className="uppercase tracking-wide text-[0.65rem] opacity-70">
                              Original language
                            </span>
                            <span className="font-semibold capitalize">
                              {originalLanguage}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-wide text-[0.65rem] opacity-70">
                            Direction
                          </span>
                          <span className="font-semibold">Native → German</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-wide text-[0.65rem] opacity-70">
                            Type
                          </span>
                          <span className="font-semibold">
                            Native phrase / expression
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <TagsDisplay tags={(translationEntry as any).tags} />
            </div>

            <div className="md:col-span-1 flex flex-col justify-end items-end gap-4 order-1 md:order-2">
              {translationEntry.image_url && (
                <div className="relative aspect-video w-full max-w-sm md:max-w-none overflow-hidden rounded-md border border-border/60">
                  <ImageWithErrorBoundary
                    src={translationEntry.image_url}
                    alt="Image for the translation"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-8xl p-4 md:p-6 space-y-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-6">
            {aiData && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
                  AI Generated Details (Text)
                </h2>
                <AiDataSection
                  title="Grammar/Usage Explanation"
                  data={aiData.grammar}
                />
                <AiDataSection
                  title="Example Sentences"
                  data={aiData.examples}
                />
                <AiDataSection
                  title="Equivalent Phrases"
                  data={aiData.synonyms_antonyms}
                />
                <AiDataSection
                  title="Related Phrases / Idioms"
                  data={aiData.phrases}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div
              className={cn(
                "p-4 rounded-md border border-border bg-background/80",
                translationEntry.color &&
                  `${translationEntry.color} bg-opacity-10 bg-blend-multiply`
              )}
            >
              <h2 className="text-lg font-semibold mb-2">My Notes</h2>
              {translationEntry.notes ? (
                <p className="text-md whitespace-pre-wrap">
                  {translationEntry.notes}
                </p>
              ) : (
                <p className="text-md opacity-80">No notes provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
