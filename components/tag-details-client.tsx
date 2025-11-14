"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TagActionMenu } from "@/components/tag-action-menu";
import { TagIcon, Icon } from "@phosphor-icons/react";
import { TagIconMap } from "@/lib/tag-icons";

interface TagEntry {
  id: string | number;
  word: string;
  translation: string;
  tags: string[] | null;
  color: string | null;
  image_url: string | null;
  ai_data: any;
  isNativePhrase: boolean;
  wordDisplay: string;
}

interface TagMetadata {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
}

interface TagData {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
  count: number;
  entries: TagEntry[];
}

interface TagDetailsClientProps {
  tagData: TagData;
}

const iconComponentMap: Record<string, Icon> = TagIconMap;

const getEntryLink = (entry: TagEntry) =>
  entry.isNativePhrase
    ? `/translations/${entry.id}`
    : `/inventory/${encodeURIComponent(entry.word)}`;

export function TagDetailsClient({ tagData }: TagDetailsClientProps) {
  const TagIconComponent = iconComponentMap[tagData.icon_name] || TagIcon;

  const metadata: TagMetadata = {
    tag_name: tagData.tag_name,
    icon_name: tagData.icon_name,
    color_class: tagData.color_class,
  };

  return (
    <>
      <div className="flex justify-end sticky top-20 z-10 mt-0">
        <TagActionMenu tag={metadata} />
      </div>

      <div className={cn("p-4 rounded-lg", tagData.color_class)}>
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn(
              "p-3 rounded-full border-2",
              tagData.color_class
                ? "bg-white/30 dark:bg-black/30 border-white/50 dark:border-black/50"
                : "bg-muted/50 border-border"
            )}
          >
            <TagIconComponent className="size-8" weight="bold" />
          </div>
          <div>
            <h1 className="text-4xl font-bold capitalize">
              {tagData.tag_name}
            </h1>
            <p className="text-xl text-muted-foreground">
              {tagData.count} entr{tagData.count === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>

        <p className="text-base text-muted-foreground">
          All words and translations with the tag "{tagData.tag_name}".
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Tagged Entries</h2>
        <div className="space-y-3">
          {tagData.entries.map((entry) => (
            <Link
              key={entry.id}
              href={getEntryLink(entry)}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="truncate">
                <p className="font-semibold text-base block truncate">
                  {entry.wordDisplay}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {entry.translation}
                </p>
              </div>
              <Badge
                variant={entry.isNativePhrase ? "grammar" : "outline"}
                className="shrink-0 ml-4"
              >
                {entry.isNativePhrase
                  ? "Translation"
                  : entry.ai_data?.category || "Word"}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
