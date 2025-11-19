import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EntryActionMenu } from "@/components/edit-word-dialog";
import { ImageWithErrorBoundary } from "@/components/image-error-boundary";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { TagIconMap } from "@/lib/tag-icons";
import { TagIcon } from "@phosphor-icons/react/dist/ssr";

const iconComponentMap = TagIconMap;

async function TagsDisplay({ tags }: { tags: string[] | null }) {
  if (!tags || tags.length === 0) return null;

  const supabase = await createClient();
  const { data: tagMetadata } = await supabase
    .from("user_tags")
    .select("tag_name, icon_name, color_class")
    .in("tag_name", tags);

  const tagDataMap = new Map();
  tagMetadata?.forEach((item) => tagDataMap.set(item.tag_name, item));

  return (
    <div className="flex flex-wrap gap-2 pt-4">
      {tags.map((tag) => {
        const data = tagDataMap.get(tag) || {};
        const IconComponent = iconComponentMap[data.icon_name] || TagIcon;
        const colorClass = data.color_class || null;

        return (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="hover:opacity-80 transition-opacity"
          >
            <Badge
              variant="secondary"
              className={cn(
                "capitalize cursor-pointer flex items-center gap-1.5 border-transparent h-6"
              )}
            >
              <div
                className={cn(
                  "size-4 rounded-full flex items-center justify-center border-1 shrink-0 transition-colors",
                  colorClass || "bg-muted border-border"
                )}
                style={
                  colorClass
                    ? {
                        backgroundColor: `var(--tag-bg)`,
                        borderColor: `var(--tag-border)`,
                        color: `var(--tag-text)`,
                      }
                    : undefined
                }
              >
                <IconComponent
                  className="w-3 h-3 transition-colors"
                  style={{
                    color: colorClass ? `var(--tag-text)` : undefined,
                  }}
                  weight="bold"
                />
              </div>
              {tag}
            </Badge>
          </Link>
        );
      })}
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
  const currentYear = new Date().getFullYear();

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

  const [randomPrevResult, randomNextResult] = await Promise.all([
    (async () => {
      const { fetchRandomEntry } = await import("@/app/actions");
      return fetchRandomEntry({
        table: "user_translations",
        currentIdOrSlug: id,
      });
    })(),
    (async () => {
      const { fetchRandomEntry } = await import("@/app/actions");
      return fetchRandomEntry({
        table: "user_translations",
        currentIdOrSlug: id,
      });
    })(),
  ]);

  const randomPrevId = randomPrevResult.slug;
  const randomNextId = randomNextResult.slug;

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
                <div className="inline-flex max-w-xl rounded-md overflow-hidden">
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
                          "absolute inset-0 pointer-events-none opacity-50",
                          translationEntry.color
                        )}
                      />
                    )}

                    <div className="relative space-y-2 px-4 py-3 bg-muted/60">
                      <div className="flex flex-col gap-3 text-xs sm:text-sm">
                        {" "}
                        {originalLanguage && (
                          <div className="flex items-center gap-2">
                            <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
                              Original language:
                            </div>
                            <span className="font-semibold capitalize">
                              {originalLanguage}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
                            Direction:
                          </div>
                          <div className="font-semibold">Native → German</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
                            Type:
                          </div>
                          <div className="font-semibold">
                            Native phrase / expression
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <TagsDisplay tags={(translationEntry as any).tags} />
            </div>

            <div className="md:col-span-1 m-auto flex flex-col justify-end items-end gap-4 order-1 md:order-2">
              {translationEntry.image_url && (
                <div className="relative aspect-[1.5] w-full max-w-sm overflow-hidden rounded-md bg-muted">
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

      <div className="container mx-auto max-w-8xl p-4 md:p-6 space-y-6 mt-10 mb-40">
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
                "p-4 rounded-md bg-background/80",
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

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 border-t bg-[#fbfbfb] dark:bg-[#000] backdrop-blur-sm">
        <div className="container mx-auto max-w-8xl flex justify-between">
          <Link
            href={randomPrevId ? `/translations/${randomPrevId}` : "#"}
            aria-disabled={!randomPrevId}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors",
              randomPrevId
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground cursor-default pointer-events-none"
            )}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Random Previous</span>
          </Link>

          <p className="text-xs text-muted-foreground py-2 mt-1">
            &copy; {currentYear} Word Inventory by{" "}
            <a href="https://studiominsky.com" target="_blank">
              Studio Minsky
            </a>
            . All rights reserved.
          </p>

          <Link
            href={randomNextId ? `/translations/${randomNextId}` : "#"}
            aria-disabled={!randomNextId}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors",
              randomNextId
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground cursor-default pointer-events-none"
            )}
          >
            <span className="hidden sm:inline">Random Next</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </>
  );
}
