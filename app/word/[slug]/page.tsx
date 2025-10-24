import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

function AiDataSection({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  let content;
  if (typeof data === "string") {
    content = <p className="text-sm whitespace-pre-wrap">{data}</p>;
  } else if (Array.isArray(data)) {
    content = (
      <ul className="list-disc list-inside space-y-1 text-sm">
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  } else if (typeof data === "object") {
    if (
      title === "Synonyms / Antonyms" &&
      (data as any).synonyms &&
      (data as any).antonyms
    ) {
      content = (
        <div className="text-sm space-y-1">
          {(data as any).synonyms.length > 0 && (
            <p>
              <strong>Synonyms:</strong> {(data as any).synonyms.join(", ")}
            </p>
          )}
          {(data as any).antonyms.length > 0 && (
            <p>
              <strong>Antonyms:</strong> {(data as any).antonyms.join(", ")}
            </p>
          )}
        </div>
      );
    } else {
      content = (
        <pre className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
  } else {
    content = <p className="text-sm">{String(data)}</p>;
  }
  return (
    <div className="border-t pt-4">
      <h3 className="text-md font-semibold mb-2">{title}</h3>
      {content}
    </div>
  );
}

export default async function WordDetailPage(props: {
  params: { slug: string };
}) {
  const { slug } = props.params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/word/${slug}`);

  const { data: word, error } = await supabase
    .from("user_words")
    .select("*, notes, ai_data")
    .eq("user_id", user.id)
    .eq("word", decodedSlug)
    .single();

  if (error || !word) notFound();

  const aiData = word.ai_data
    ? typeof word.ai_data === "string"
      ? (() => {
          try {
            return JSON.parse(word.ai_data);
          } catch {
            return null;
          }
        })()
      : word.ai_data
    : null;

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">{word.word}</h1>
        <p className="text-xl text-muted-foreground">{word.translation}</p>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">My Notes</h2>
        {word.notes ? (
          <p className="text-sm whitespace-pre-wrap">{word.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No notes provided.</p>
        )}
      </div>
      {aiData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
            AI Generated Details
          </h2>
          <AiDataSection title="Grammar Explanation" data={aiData.grammar} />
          <AiDataSection title="Example Sentences" data={aiData.examples} />
          <AiDataSection
            title="Difficulty Estimation"
            data={aiData.difficulty}
          />
          <AiDataSection
            title="Synonyms / Antonyms"
            data={aiData.synonyms_antonyms}
          />
        </div>
      )}
    </div>
  );
}
