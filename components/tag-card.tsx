// studiominsky/wi/wi-3a66a3e3b87b5cde4dab73718cd820d2cfdc6990/components/tag-card.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TagIcon, Icon } from "@phosphor-icons/react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { TagActionMenu } from "./tag-action-menu";

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

const iconComponentMap: Record<string, Icon> = PhosphorIcons as any;

export function TagCard({ tag }: { tag: TagData }) {
  const CardIcon = iconComponentMap[tag.icon_name] || TagIcon;

  const cardClasses = cn(
    "relative flex flex-col justify-between p-4 h-48 rounded-lg shadow-md transition-shadow hover:shadow-lg cursor-pointer",
    tag.color_class || "bg-card/50 border border-border"
  );

  const iconClasses = cn(
    "size-16 transition-transform group-hover:scale-105",
    tag.color_class
      ? "text-white/80 dark:text-foreground/80"
      : "text-muted-foreground"
  );

  const metadata = {
    tag_name: tag.tag_name,
    icon_name: tag.icon_name,
    color_class: tag.color_class,
  };

  return (
    <div className={cardClasses} role="button">
      <Link
        href={`/tags/${encodeURIComponent(tag.tag_name)}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for tag ${tag.tag_name} with ${tag.count} entries`}
      >
        <span className="sr-only">View tag {tag.tag_name}</span>
      </Link>
      <div className="flex items-start justify-between relative z-20">
        <CardIcon className={iconClasses} weight="regular" />
        <div className="-mt-1 -mr-1">
          <TagActionMenu tag={metadata} />
        </div>
      </div>

      <div className="mt-4 relative z-20">
        <h3 className="text-xl font-bold capitalize truncate">
          {tag.tag_name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {tag.count} entr{tag.count === 1 ? "y" : "ies"}
        </p>
      </div>
    </div>
  );
}
