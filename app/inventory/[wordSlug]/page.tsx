import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EntryActionMenu } from "@/components/edit-word-dialog";
import { ImageWithErrorBoundary } from "@/components/image-error-boundary";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { TagIconMap } from "@/lib/tag-icons";
import { TagIcon } from "@phosphor-icons/react/ssr";
import { fetchRandomEntry } from "@/app/actions";

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

const CASE_ORDER_CANONICAL_CAPS = [
  "Nominative",
  "Accusative",
  "Dative",
  "Genitive",
  "Plural",
];

const CANONICAL_VERB_PRONOUN_ORDER = [
  "ich",
  "du",
  "er/sie/es",
  "wir",
  "ihr",
  "sie",
];

const TENSE_ORDER = [
  "Present",
  "Preterit",
  "Perfect",
  "Future",
  "Past Perfect",
];

const PRONOUN_ORDER_FOR_SORT = ["ich", "du", "er/sie/es", "wir", "ihr", "sie"];

const formatKey = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const renderArticleForm = (cell: any) => {
  if (!cell) return "";
  if (typeof cell === "string") return cell;

  if (typeof cell === "object" && cell !== null) {
    if ((cell as any).form) return String((cell as any).form);
    if ((cell as any).example) return String((cell as any).example);

    const a = (cell as any).article ? String((cell as any).article) : "";
    const f = (cell as any).form ? String((cell as any).form) : "";
    return a && f ? `${a} ${f}` : a || f || "";
  }
  return String(cell);
};

const isNounDeclensionTable = (data: any) =>
  data &&
  typeof data === "object" &&
  !Array.isArray(data) &&
  data.Singular &&
  data.Plural &&
  typeof data.Singular === "object";

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

async function getGermanLanguageId(userId: string) {
  const supabase = await createClient();
  const GERMAN_LANGUAGE_NAME = "German";

  const { data } = await supabase
    .from("user_languages")
    .select("id")
    .eq("user_id", userId)
    .eq("language_name", GERMAN_LANGUAGE_NAME)
    .single();

  if (!data) {
    notFound();
  }
  return data.id;
}

function DataDisplay({ data }: { data: any }) {
  if (data == null) return null;

  let processedData = data;
  let isVerbTable = false;
  let isNounDeclension = false;
  let isAdjectiveDeclension = false;

  if (isConjugationTable(processedData)) {
    isVerbTable = true;
  }
  if (isNounDeclensionTable(processedData)) {
    isNounDeclension = true;
  } else {
    const potentialCaseKeys = Object.keys(processedData).filter((k) =>
      CASE_ORDER_CANONICAL_CAPS.map((c) => c.toLowerCase()).includes(
        k.toLowerCase()
      )
    );
    if (potentialCaseKeys.length > 2) {
      isAdjectiveDeclension = true;
    }
  }

  if (isNounDeclension || isAdjectiveDeclension || isVerbTable) {
    let orderedColKeys: string[] = [];
    let finalRowKeys: string[] = [];
    let firstHeader = "Category";

    if (isNounDeclension) {
      orderedColKeys = ["Singular", "Plural"].filter(
        (k) => processedData[k] && typeof processedData[k] === "object"
      );
      finalRowKeys = Object.keys(processedData[orderedColKeys[0]] || {});
      firstHeader = "Case";
    } else if (isAdjectiveDeclension) {
      orderedColKeys = ["Example"];
      finalRowKeys = Object.keys(processedData);
      firstHeader = "Case";
      processedData = { Example: processedData };
    } else if (isVerbTable) {
      const colKeys = Object.keys(processedData);
      const columnOrderPriority = {
        present: 10,
        preterit: 11,
        perfect: 12,
        future: 13,
        "past perfect": 14,
      };

      orderedColKeys = [...colKeys].sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aPriority =
          columnOrderPriority[aLower as keyof typeof columnOrderPriority] || 90;
        const bPriority =
          columnOrderPriority[bLower as keyof typeof columnOrderPriority] || 90;

        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.localeCompare(b);
      });

      const potentialRowKeys = Object.keys(
        processedData[orderedColKeys[0]] || {}
      );

      const foundPronounsMap = new Map<string, string>();
      CANONICAL_VERB_PRONOUN_ORDER.forEach((canonical) => {
        const matchingOriginalKey = potentialRowKeys.find(
          (original) =>
            original.toLowerCase().replace(/\s/g, "") ===
            canonical.toLowerCase().replace(/\s/g, "")
        );
        if (matchingOriginalKey) {
          foundPronounsMap.set(canonical, matchingOriginalKey);
        }
      });

      finalRowKeys = CANONICAL_VERB_PRONOUN_ORDER.map((c) =>
        foundPronounsMap.get(c)
      ).filter((k): k is string => k !== undefined);

      potentialRowKeys.forEach((key) => {
        if (!finalRowKeys.includes(key)) {
          finalRowKeys.push(key);
        }
      });

      firstHeader = "Pronoun";
    }

    if (firstHeader === "Case") {
      const originalKeys = finalRowKeys;
      const canonicalToOriginal = new Map<string, string>();

      originalKeys.forEach((original) => {
        const lowerKey = original.toLowerCase().split(" ")[0];
        const match = CASE_ORDER_CANONICAL_CAPS.find(
          (c) => c.toLowerCase() === lowerKey
        );
        if (match && !canonicalToOriginal.has(match)) {
          canonicalToOriginal.set(match, original);
        }
      });

      finalRowKeys = CASE_ORDER_CANONICAL_CAPS.map((c) =>
        canonicalToOriginal.get(c)
      ).filter((k): k is string => k !== undefined);

      originalKeys.forEach((k) => {
        if (!finalRowKeys.includes(k)) finalRowKeys.push(k);
      });
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
              {finalRowKeys.map((rowKey) => (
                <tr
                  key={rowKey}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2 font-medium text-sm text-primary/80">
                    {isVerbTable ? String(rowKey) : formatKey(rowKey)}
                  </td>
                  {orderedColKeys.map((colKey, colIndex) => {
                    const cellValue = processedData[colKey]?.[rowKey] ?? "";

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

  const rawEntries = Object.entries(data);
  let entries = rawEntries;

  const isTenseObject = rawEntries.some(([key]) =>
    TENSE_ORDER.some((t) => t.toLowerCase() === key.toLowerCase())
  );
  const isPronounObject =
    rawEntries.length > 0 &&
    rawEntries.every(([key]) =>
      PRONOUN_ORDER_FOR_SORT.some(
        (p) => p.replace(/\s/g, "") === key.toLowerCase().replace(/\s/g, "")
      )
    );

  if (isTenseObject) {
    entries = rawEntries.sort(([keyA, _a], [keyB, _b]) => {
      const indexA = TENSE_ORDER.findIndex(
        (t) => t.toLowerCase() === keyA.toLowerCase()
      );
      const indexB = TENSE_ORDER.findIndex(
        (t) => t.toLowerCase() === keyB.toLowerCase()
      );
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return 0;
    });
  } else if (isPronounObject) {
    entries = rawEntries.sort(([keyA, _a], [keyB, _b]) => {
      const cleanA = keyA.toLowerCase().replace(/\s/g, "");
      const cleanB = keyB.toLowerCase().replace(/\s/g, "");
      const indexA = PRONOUN_ORDER_FOR_SORT.findIndex(
        (p) => p.replace(/\s/g, "") === cleanA
      );
      const indexB = PRONOUN_ORDER_FOR_SORT.findIndex(
        (p) => p.replace(/\s/g, "") === cleanB
      );
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return 0;
    });
  }

  return (
    <div className="bg-background/50 rounded-md p-2 text-sm space-y-2 mt-2 border border-border">
      {entries.map(([key, value]) => (
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
  } else if (title === "Passive Voice Forms") {
    content = (
      <p className="text-md leading-7 whitespace-pre-wrap">{String(data)}</p>
    );
  } else if (typeof data === "string") {
    content = <p className="text-md leading-7 whitespace-pre-wrap">{data}</p>;
  } else if (Array.isArray(data)) {
    if (data.length === 0) return null;
    if (title === "Common Phrases / Idioms") {
      content = (
        <ul className="list-disc list-inside space-y-1 text-md leading-7">
          {data.map((item, index) => (
            <li key={index}>"{item}"</li>
          ))}
        </ul>
      );
    } else {
      content = (
        <ul className="list-disc list-inside leading-7 space-y-1 text-md">
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
    <div className="pt-4">
      <h3 className="text-lg font-semibold my-2">{title}</h3>
      {content}
    </div>
  );
}

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ wordSlug: string }>;
}) {
  const { wordSlug } = await params;
  const decodedWord = decodeURIComponent(wordSlug);
  const currentYear = new Date().getFullYear();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/inventory/${wordSlug}`);

  const languageId = await getGermanLanguageId(user.id);

  const { data: word, error } = await supabase
    .from("user_words")
    .select("*, notes, ai_data, translation, color, image_url, id, tags")
    .eq("user_id", user.id)
    .eq("language_id", languageId)
    .eq("word", decodedWord)
    .single();

  if (error || !word) notFound();

  const [randomPrevResult, randomNextResult] = await Promise.all([
    (async () => {
      const { fetchRandomEntry } = await import("@/app/actions");
      return fetchRandomEntry({
        table: "user_words",
        currentIdOrSlug: decodedWord,
      });
    })(),
    (async () => {
      const { fetchRandomEntry } = await import("@/app/actions");
      return fetchRandomEntry({
        table: "user_words",
        currentIdOrSlug: decodedWord,
      });
    })(),
  ]);

  const randomPrevSlug = randomPrevResult.slug;
  const randomNextSlug = randomNextResult.slug;

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

  const fullConjugationTable = aiData?.full_conjugation_table;
  const nounDeclensionTable = aiData?.noun_declension_table;
  const adjectiveDeclensionExample = aiData?.adjective_declension_example;
  const passiveForms = aiData?.passive_forms;
  const category = aiData?.category;

  let pluralForm: string | null = null;
  let singularNominativeForm: string | null = null;
  let gender: string | null = aiData?.gender || null;

  if (nounDeclensionTable) {
    if (
      nounDeclensionTable.Singular &&
      typeof nounDeclensionTable.Singular.Nominative === "string"
    ) {
      singularNominativeForm = nounDeclensionTable.Singular.Nominative.trim();
    }

    if (
      nounDeclensionTable.Plural &&
      typeof nounDeclensionTable.Plural.Nominative === "string"
    ) {
      const nominativePlural = nounDeclensionTable.Plural.Nominative.trim();
      if (nominativePlural.toLowerCase().startsWith("die ")) {
        pluralForm = nominativePlural.substring(4).trim();
      } else {
        pluralForm = nominativePlural;
      }

      if (pluralForm?.toLowerCase() === decodedWord.toLowerCase()) {
        pluralForm = null;
      }
    }
  }

  let genderAndSingularDisplay: string | null = null;

  if (gender) {
    if (singularNominativeForm) {
      genderAndSingularDisplay = `${gender}, ${singularNominativeForm}`;
    } else {
      genderAndSingularDisplay = gender;
    }
  } else if (singularNominativeForm) {
    genderAndSingularDisplay = singularNominativeForm;
  }

  const entryForEdit = {
    id: word.id,
    word: word.word,
    translation: word.translation,
    notes: word.notes,
    color: word.color,
    image_url: word.image_url,
    tags: (word as any).tags || null,
  };

  return (
    <>
      <div className={cn("relative w-full pb-10")}>
        <div className="container mx-auto max-w-8xl p-4 md:p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 text-xs md:text-sm text-foreground font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Back to inventory</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <EntryActionMenu entry={entryForEdit} isNativePhrase={false} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2 flex flex-col justify-end order-2 md:order-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight break-words">
                {decodedWord}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                {word.translation || "Translation not generated yet."}
              </p>
              <div className="space-y-3 mt-5">
                <div className="inline-flex max-w-xl rounded-md overflow-hidden">
                  <div
                    className={cn(
                      "w-1.5 flex-shrink-0",
                      word.color || "bg-primary"
                    )}
                  />

                  <div className="relative flex-1">
                    {word.color && (
                      <div
                        className={cn(
                          "absolute inset-0 pointer-events-none opacity-50",
                          word.color
                        )}
                      />
                    )}

                    <div className="relative space-y-2 px-4 py-3 bg-muted/60">
                      <div className="flex flex-col gap-3 text-xs sm:text-sm">
                        {genderAndSingularDisplay && (
                          <div className="flex items-center gap-2">
                            <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
                              Gender:
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {genderAndSingularDisplay}
                            </div>
                          </div>
                        )}

                        {pluralForm && (
                          <div className="flex items-center gap-2">
                            <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
                              Plural:
                            </div>
                            <div className="text-sm font-semibold capitalize text-foreground">
                              {pluralForm}
                            </div>
                          </div>
                        )}

                        {category && (
                          <div className="flex items-center gap-2">
                            <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/60">
                              Category:
                            </div>
                            <div className="text-sm font-semibold capitalize text-foreground">
                              {category}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <TagsDisplay tags={(word as any).tags} />
            </div>

            <div className="md:col-span-1 m-auto flex flex-col justify-end items-end gap-4 order-1 md:order-2">
              {word.image_url && (
                <div className="relative aspect-[1.5] w-full max-w-sm overflow-hidden rounded-md bg-muted">
                  <ImageWithErrorBoundary
                    src={word.image_url}
                    alt={`Image for the word ${decodedWord}`}
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
                  title="Grammar Explanation"
                  data={aiData.grammar}
                />
                <AiDataSection
                  title="Example Sentences"
                  data={aiData.examples}
                />
                <AiDataSection
                  title="Synonyms"
                  data={aiData.synonyms_antonyms}
                />
                <AiDataSection
                  title="Common Phrases / Idioms"
                  data={aiData.phrases}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div
              className={cn(
                "p-4 rounded-md bg-background/80",
                word.color && `${word.color} bg-opacity-10 bg-blend-multiply`
              )}
            >
              <h2 className="text-lg font-semibold mb-2">My Notes</h2>
              {word.notes ? (
                <p className="text-md whitespace-pre-wrap">{word.notes}</p>
              ) : (
                <p className="text-md opacity-80">No notes provided.</p>
              )}
            </div>

            {aiData && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 space-y-4 rounded-md">
                <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
                  Grammar Tables & Forms
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
                <AiDataSection
                  title="Passive Voice Forms"
                  data={passiveForms}
                />
                <AiDataSection
                  title="Key Verb Forms"
                  data={aiData.verb_forms}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 border-t bg-[#fbfbfb] dark:bg-[#000] backdrop-blur-sm">
        <div className="container mx-auto max-w-8xl flex justify-between">
          <Link
            href={randomPrevSlug ? `/inventory/${randomPrevSlug}` : "#"}
            aria-disabled={!randomPrevSlug}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors",
              randomPrevSlug
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
            href={randomNextSlug ? `/inventory/${randomNextSlug}` : "#"}
            aria-disabled={!randomNextSlug}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors",
              randomNextSlug
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
