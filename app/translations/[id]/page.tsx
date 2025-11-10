import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const formatKey = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

async function getGermanLanguageId(userId: string) {
  const supabase = await createClient();
  const GERMAN_LANGUAGE_NAME = "German";

  const { data } = await supabase
    .from("user_languages")
    .select("id")
    .eq("user_id", userId)
    .eq("language_name", GERMAN_LANGUAGE_NAME)
    .single();

  if (!data) notFound();
  return data.id;
}

function AiDataSection({ title, data }: { title: string; data: any }) {
  if (data === null || data === undefined || data === "") return null;

  let content;

  if (typeof data === "string") {
    content = <p className="text-sm whitespace-pre-wrap">{data}</p>;
  } else if (Array.isArray(data)) {
    if (data.length === 0) return null;
    content = (
      <ul className="list-disc list-inside space-y-1 text-sm">
        {(data as any[]).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  } else if (typeof data === "object") {
    if (title === "Synonyms" && (data as any).synonyms?.length > 0) {
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
    <div className="border-t border-blue-200 dark:border-blue-700 pt-4 first:border-t-0">
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
    .select("*, notes, ai_data, translation, color, image_url")
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
            console.error(
              "Failed to parse ai_data string:",
              translationEntry.ai_data
            );
            return null;
          }
        })()
      : translationEntry.ai_data
    : null;

  const nativePhrase = translationEntry.word;
  const germanTranslation = translationEntry.translation;
  const originalLanguage = aiData?.original_phrase_language;

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6 space-y-6">
      {translationEntry.image_url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
          <img
            src={translationEntry.image_url}
            alt={`Image for the translation`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={cn("p-4 ", translationEntry.color)}>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">{nativePhrase}</h1>
          <Badge variant="grammar" className="capitalize shrink-0">
            {originalLanguage || "Native"}
          </Badge>
        </div>

        <p className="text-xl text-muted-foreground">
          {germanTranslation || "German translation not generated."}
        </p>

        <p className="text-base italic text-muted-foreground mt-2">
          Translation to German
        </p>
      </div>

      <div className="bg-muted p-4 ">
        <h2 className="text-lg font-semibold mb-2">My Notes</h2>
        {translationEntry.notes ? (
          <p className="text-sm whitespace-pre-wrap">
            {translationEntry.notes}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No notes provided.</p>
        )}
      </div>

      {aiData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4  space-y-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
            AI Generated Details
          </h2>
          <AiDataSection
            title="Grammar/Usage Explanation"
            data={aiData.grammar}
          />
          <AiDataSection title="Example Sentences" data={aiData.examples} />
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
  );
}
