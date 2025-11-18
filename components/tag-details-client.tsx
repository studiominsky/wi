"use client";

import * as React from "react";
import { TagIcon } from "@phosphor-icons/react";
import { TagIconMap } from "@/lib/tag-icons";
import { ImageWithErrorBoundary } from "./image-error-boundary";
import { TagActionMenu } from "./tag-action-menu";
import Link from "next/link";

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

interface TagData {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
  count: number;
  entries: TagEntry[];
}

interface TagMetadata {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
}

const getTagColors = (colorClass: string | null) => {
  switch (colorClass) {
    case "tag-color-teal":
      return { bg: "#0f766e", text: "#e5f9f4", border: "#0f766e" };
    case "tag-color-blue":
      return { bg: "#1d4ed8", text: "#e0ecff", border: "#1d4ed8" };
    case "tag-color-orange":
      return { bg: "#c2410c", text: "#ffe7d1", border: "#c2410c" };
    case "tag-color-red":
      return { bg: "#b91c1c", text: "#ffe2e2", border: "#b91c1c" };
    case "tag-color-purple":
      return { bg: "#7e22ce", text: "#f3e8ff", border: "#7e22ce" };
    default:
      return { bg: "#111827", text: "#e5e7eb", border: "#111827" };
  }
};

export function TagDetailsClient({ tagData }: { tagData: TagData }) {
  const IconComponent =
    TagIconMap[tagData.icon_name as keyof typeof TagIconMap] || TagIcon;

  const colors = getTagColors(tagData.color_class);

  const tagMetadata: TagMetadata = {
    tag_name: tagData.tag_name,
    icon_name: tagData.icon_name,
    color_class: tagData.color_class,
  };

  const dummyRefresh = () => {};

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-6 space-y-8">
      <header className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm border"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            <IconComponent className="w-5 h-5" weight="bold" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold capitalize">
              {tagData.tag_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tagData.count} entr{tagData.count === 1 ? "y" : "ies"} with this
              tag
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TagActionMenu tag={tagMetadata} onTagUpdated={dummyRefresh} />
        </div>
      </header>

      <section className="space-y-3">
        {tagData.entries.map((entry) => {
          const href = entry.isNativePhrase
            ? `/translations/${entry.id}`
            : `/inventory/${encodeURIComponent(entry.wordDisplay)}`;

          return (
            <Link key={entry.id} href={href} className="group block">
              <div className="flex items-start gap-3 rounded-md border border-border bg-card/70 p-3 transition-colors hover:bg-card">
                <div
                  className="mt-1 w-1.5 rounded-full self-stretch transition-all"
                  style={{ backgroundColor: colors.bg }}
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold transition-colors group-hover:text-primary">
                        {entry.wordDisplay}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.translation}
                      </p>
                    </div>
                    {entry.image_url && (
                      <div className="relative w-20 h-16 overflow-hidden rounded-sm border border-border/60 shrink-0">
                        <ImageWithErrorBoundary
                          src={entry.image_url}
                          alt={entry.wordDisplay}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {tagData.entries.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No entries yet for this tag.
          </p>
        )}
      </section>
    </div>
  );
}
