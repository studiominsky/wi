import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";

const PRONOUN_ORDER_CANONICAL = [
  "i",
  "ich",
  "yo",
  "je",
  "you",
  "du",
  "tú",
  "vous",
  "tu",
  "he/she/it",
  "er/sie/es",
  "él/ella/ud",
  "il/elle",
  "we",
  "wir",
  "nosotros",
  "nous",
  "you all",
  "ihr",
  "vosotros",
  "ustedes",
  "vous",
  "they",
  "sie",
  "ellos/ellas",
  "ils/elles",
];

const formatKey = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const renderArticleForm = (cell: any) => {
  if (!cell) return "";
  if (typeof cell === "string") return cell;

  if (typeof cell === "object" && cell !== null) {
    if (cell.form) return String(cell.form);
    if (cell.example) return String(cell.example);

    const a = cell.article ? String(cell.article) : "";
    const f = cell.form ? String(cell.form) : "";
    return a && f ? `${a} ${f}` : a || f || "";
  }
  return String(cell);
};

const isNounDeclensionTable = (data: any) =>
  data &&
  typeof data === "object" &&
  !Array.isArray(data) &&
  (Array.isArray(data.Singular) || Array.isArray(data.Plural));

const isConjugationTable = (data: any) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const potentialColumns = Object.keys(data);
  if (potentialColumns.length < 1) return false;
  return potentialColumns.every((colKey) => {
    const colData = data[colKey];
    return (
      typeof colData === "object" &&
      colData !== null &&
      !Array.isArray(colData) &&
      Object.keys(colData).length > 0
    );
  });
};

function DataDisplay({ data }: { data: any }) {
  if (data == null) return null;

  let processedData = data;
  let isVerbTable = false;
  let isNounDeclension = false;
  let isAdjectiveDeclension = false;

  if (isNounDeclensionTable(processedData)) {
    isNounDeclension = true;
  } else if (
    Array.isArray(processedData) &&
    processedData.some((item: any) => item.example && item.case)
  ) {
    isAdjectiveDeclension = true;
  } else if (isConjugationTable(processedData)) {
    isVerbTable = true;
  }

  if (isNounDeclension || isAdjectiveDeclension || isVerbTable) {
    let orderedColKeys: string[] = [];
    let finalRowKeys: string[] = [];
    let rowsData: any[] = [];
    let firstHeader = "Category";

    if (isNounDeclension) {
      orderedColKeys = ["Singular", "Plural"].filter(
        (k) => processedData[k] && processedData[k].length > 0
      );
      rowsData = processedData.Singular;
      finalRowKeys = rowsData.map((item: any) => item.case);
      firstHeader = "Case";
    } else if (isAdjectiveDeclension) {
      orderedColKeys = ["Example"];
      rowsData = processedData;
      finalRowKeys = rowsData.map((item: any) => item.case);
      firstHeader = "Case";
    } else if (isVerbTable) {
      const colKeys = Object.keys(processedData);

      const columnOrderPriority = {
        present: 10,
        preterit: 11,
        future: 12,
        perfect: 13,
        past: 14,
      };

      orderedColKeys = [...colKeys].sort((a, b) => {
        const aLower = a.toLowerCase().split(" ")[0];
        const bLower = b.toLowerCase().split(" ")[0];

        const aPriority =
          columnOrderPriority[aLower as keyof typeof columnOrderPriority] || 90;
        const bPriority =
          columnOrderPriority[bLower as keyof typeof columnOrderPriority] || 90;

        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.localeCompare(b);
      });

      const allRowKeysSet = new Set<string>();
      orderedColKeys.forEach((colKey) => {
        const colData = processedData[colKey];
        if (colData && typeof colData === "object") {
          Object.keys(colData).forEach((rowKey) => allRowKeysSet.add(rowKey));
        }
      });
      const potentialRowKeys = Array.from(allRowKeysSet);

      const foundPronounsMap = new Map<string, string>();

      PRONOUN_ORDER_CANONICAL.forEach((canonical) => {
        const canonicalClean = canonical.replace(/\s/g, "");
        const matchingOriginalKey = potentialRowKeys.find((original) =>
          original.toLowerCase().replace(/\s/g, "").includes(canonicalClean)
        );
        if (
          matchingOriginalKey &&
          !Array.from(foundPronounsMap.values()).includes(matchingOriginalKey)
        ) {
          foundPronounsMap.set(canonicalClean, matchingOriginalKey);
        }
      });

      const usedKeys = new Set<string>();
      PRONOUN_ORDER_CANONICAL.forEach((canonical) => {
        const canonicalClean = canonical.replace(/\s/g, "");
        if (foundPronounsMap.has(canonicalClean)) {
          const originalKey = foundPronounsMap.get(canonicalClean)!;
          if (!usedKeys.has(originalKey)) {
            finalRowKeys.push(originalKey);
            usedKeys.add(originalKey);
          }
        }
      });

      potentialRowKeys.forEach((originalKey) => {
        if (!usedKeys.has(originalKey)) {
          finalRowKeys.push(originalKey);
        }
      });

      if (finalRowKeys.length === 0 && potentialRowKeys.length > 0) {
        finalRowKeys = potentialRowKeys;
      }
      firstHeader = "Pronoun";
    }

    if (finalRowKeys.length > 0 && orderedColKeys.length > 0) {
      const headers = [firstHeader, ...orderedColKeys.map(formatKey)];

      return (
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse rounded-md overflow-hidden bg-background/50">
            <thead>
              <tr className="border-b border-border text-left">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-3 py-2 text-sm font-semibold capitalize bg-muted/70"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finalRowKeys.map((rowKey, rowIndex) => (
                <tr
                  key={rowKey}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2 font-medium text-sm text-primary/80 capitalize">
                    {formatKey(rowKey)}
                  </td>
                  {orderedColKeys.map((colKey, colIndex) => {
                    let cellValue: any;

                    if (isNounDeclension) {
                      cellValue = processedData[colKey]?.[rowIndex] ?? "";
                    } else if (isAdjectiveDeclension) {
                      cellValue = processedData[rowIndex] ?? "";
                    } else {
                      cellValue = processedData[colKey]?.[rowKey] ?? "";
                    }

                    return (
                      <td key={colIndex} className="px-3 py-2 text-sm">
                        {renderArticleForm(cellValue)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  return (
    <div className="bg-background/50 rounded-md p-2 text-sm space-y-2 mt-2 border border-border">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b border-muted last:border-b-0 pb-1">
          <strong className="block text-primary/80 capitalize font-medium">
            {formatKey(key)}:
          </strong>
          {typeof value === "string" ? (
            <p className="pl-2 italic">{value}</p>
          ) : Array.isArray(value) ? (
            <ul className="list-disc list-inside pl-4">
              {(value as any[]).map((item, i) => (
                <li key={i}>
                  {typeof item === "object"
                    ? JSON.stringify(item)
                    : String(item)}
                </li>
              ))}
            </ul>
          ) : typeof value === "object" && value !== null ? (
            <div className="pl-2 space-y-1">
              <DataDisplay data={value} />
            </div>
          ) : (
            <p className="pl-2">{String(value)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function GrammarTable({ data }: { data: any }) {
  if (data == null) return null;
  return <DataDisplay data={data} />;
}

function VerbFormsSection({ data }: { data: any }) {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0)
    return null;
  return (
    <div className="text-sm space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <p key={key}>
          <strong className="capitalize">{formatKey(key)}:</strong>{" "}
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
    if (title === "Synonyms" && (data as any).synonyms?.length > 0) {
      content = (
        <div className="text-sm space-y-1">
          <p>
            <strong>Synonyms:</strong> {(data as any).synonyms.join(", ")}
          </p>
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

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ langSlug: string; wordSlug: string }>;
}) {
  const { langSlug, wordSlug } = await params;
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
  const passiveForms = aiData?.passive_forms;

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

          <AiDataSection title="Passive Voice Forms" data={passiveForms} />

          <AiDataSection title="Key Verb Forms" data={aiData.verb_forms} />
          <AiDataSection title="Grammar Explanation" data={aiData.grammar} />
          <AiDataSection title="Example Sentences" data={aiData.examples} />

          <AiDataSection title="Synonyms" data={aiData.synonyms_antonyms} />
          <AiDataSection
            title="Common Phrases / Idioms"
            data={aiData.phrases}
          />
        </div>
      )}
    </div>
  );
}
