import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";

function GrammarTable({ data }: { data: any }) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  return (
    <div className="bg-background/50 rounded-md p-2 text-sm space-y-2 mt-2 border border-border">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b border-muted last:border-b-0 pb-1">
          <strong className="block text-primary/80 capitalize font-medium">
            {key.replace(/_/g, " ")}:
          </strong>
          {typeof value === "string" ? (
            <p className="pl-2 italic">{value}</p>
          ) : Array.isArray(value) ? (
            <ul className="list-disc list-inside pl-4">
              {(value as any[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : typeof value === "object" && value !== null ? (
            <div className="pl-2 space-y-1">
              <GrammarTable data={value} />
            </div>
          ) : (
            <p className="pl-2">{String(value)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function VerbFormsSection({ data }: { data: any }) {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0)
    return null;
  return (
    <div className="text-sm space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <p key={key}>
          <strong className="capitalize">{key.replace("_", " ")}:</strong>{" "}
          {String(value)}
        </p>
      ))}
    </div>
  );
}

function AiDataSection({ title, data }: { title: string; data: any }) {
  if (data === null || data === undefined || data === "") return null;

  let content;
  if (
    title === "Full Verb Conjugation" ||
    title === "Noun Declension Table" ||
    title === "Adjective Declension Example"
  ) {
    content = <GrammarTable data={data} />;
  } else if (title === "Key Verb Forms" && typeof data === "object") {
    content = <VerbFormsSection data={data} />;
  } else if (typeof data === "string") {
    content = <p className="text-sm whitespace-pre-wrap">{data}</p>;
  } else if (Array.isArray(data)) {
    if (data.length === 0) return null;
    if (title === "Common Phrases / Idioms") {
      content = (
        <ul className="list-disc list-inside space-y-1 text-sm">
          {data.map((item, index) => (
            <li key={index}>"{item}"</li>
          ))}
        </ul>
      );
    } else {
      content = (
        <ul className="list-disc list-inside space-y-1 text-sm">
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
  } else if (typeof data === "object") {
    if (
      title === "Synonyms / Antonyms" &&
      ((data as any).synonyms?.length > 0 || (data as any).antonyms?.length > 0)
    ) {
      content = (
        <div className="text-sm space-y-1">
          {(data as any).synonyms?.length > 0 && (
            <p>
              <strong>Synonyms:</strong> {(data as any).synonyms.join(", ")}
            </p>
          )}
          {(data as any).antonyms?.length > 0 && (
            <p>
              <strong>Antonyms:</strong> {(data as any).antonyms.join(", ")}
            </p>
          )}
        </div>
      );
    } else if (Object.keys(data).length === 0) {
      return null;
    } else {
      content = (
        <pre className="text-xs whitespace-pre-wrap bg-muted p-2">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
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

export default async function WordDetailPage(props: {
  params: { langSlug: string; wordSlug: string };
}) {
  const { langSlug, wordSlug } = await props.params;
  const decodedWord = decodeURIComponent(wordSlug);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/inventory/${langSlug}/${wordSlug}`);

  const { data: language } = await supabase
    .from("user_languages")
    .select("id")
    .eq("user_id", user.id)
    .eq("iso_code", langSlug)
    .single();

  if (!language) {
    console.error(`Language not found for slug: ${langSlug}`);
    notFound();
  }

  const languageId = language.id;

  const { data: word, error } = await supabase
    .from("user_words")
    .select("*, notes, ai_data, translation, color, image_url")
    .eq("user_id", user.id)
    .eq("language_id", languageId)
    .eq("word", decodedWord)
    .single();

  if (error || !word) notFound();

  const aiData = word.ai_data
    ? typeof word.ai_data === "string"
      ? (() => {
          try {
            return JSON.parse(word.ai_data);
          } catch {
            console.error("Failed to parse ai_data string:", word.ai_data);
            return null;
          }
        })()
      : word.ai_data
    : null;

  const fullConjugationTable = aiData?.full_conjugation_table;
  const nounDeclensionTable = aiData?.noun_declension_table;
  const adjectiveDeclensionExample = aiData?.adjective_declension_example;

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6 space-y-6">
      {word.image_url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
          <img
            src={word.image_url}
            alt={`Image for the word ${word.word}`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={cn("p-4 ", word.color)}>
        <h1 className="text-4xl font-bold mb-2">{word.word}</h1>
        <p className="text-xl text-muted-foreground">
          {word.translation || "Translation not generated yet."}
        </p>
        {aiData?.gender && (
          <p className="text-sm text-muted-foreground italic mt-1">
            {aiData.gender}
          </p>
        )}
      </div>

      <div className="bg-muted p-4 ">
        <h2 className="text-lg font-semibold mb-2">My Notes</h2>
        {word.notes ? (
          <p className="text-sm whitespace-pre-wrap">{word.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No notes provided.</p>
        )}
      </div>

      {aiData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4  space-y-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
            AI Generated Details
          </h2>
          {/* NEW SECTIONS - Displayed first for primary grammatical data */}
          <AiDataSection
            title="Full Verb Conjugation"
            data={fullConjugationTable}
          />
          <AiDataSection
            title="Noun Declension Table"
            data={nounDeclensionTable}
          />
          <AiDataSection
            title="Adjective Declension Example"
            data={adjectiveDeclensionExample}
          />

          {/* Existing Sections */}
          <AiDataSection title="Key Verb Forms" data={aiData.verb_forms} />
          <AiDataSection title="Grammar Explanation" data={aiData.grammar} />
          <AiDataSection title="Example Sentences" data={aiData.examples} />
          <AiDataSection
            title="Synonyms / Antonyms"
            data={aiData.synonyms_antonyms}
          />
          <AiDataSection
            title="Common Phrases / Idioms"
            data={aiData.phrases}
          />
          <AiDataSection title="Mnemonic" data={aiData.mnemonic} />
          <AiDataSection title="Etymology" data={aiData.etymology} />
        </div>
      )}
    </div>
  );
}
