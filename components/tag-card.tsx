"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditTagDialog } from "@/components/edit-tag-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TagIcon, PencilSimpleIcon, Icon } from "@phosphor-icons/react";
import * as PhosphorIcons from "@phosphor-icons/react";

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
  const [open, setOpen] = useState(false);

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

  const getEntryLink = (entry: TagEntry) =>
    entry.isNativePhrase
      ? `/translations/${entry.id}`
      : `/inventory/${encodeURIComponent(entry.word)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={cardClasses} role="button">
          <div className="flex items-start justify-between">
            <CardIcon className={iconClasses} weight="regular" />
            <EditTagDialog
              tag={metadata}
              triggerAsChild={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 opacity-50 hover:opacity-100 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilSimpleIcon className="size-4" />
                </Button>
              }
            />
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-bold capitalize truncate">
              {tag.tag_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tag.count} entr{tag.count === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Words for Tag: {tag.tag_name}</DialogTitle>
          <DialogDescription>
            {tag.count} item{tag.count === 1 ? "" : "s"} tagged with '
            {tag.tag_name}'.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {tag.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="truncate">
                <Link
                  href={getEntryLink(entry)}
                  className="font-semibold text-base block truncate hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {entry.wordDisplay}
                </Link>
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
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
