"use client";

import { useState } from "react";
import { TagCard } from "@/components/tag-card";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

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

export function TagListView({
  tagsData,
  onTagUpdated,
}: {
  tagsData: TagData[];
  onTagUpdated: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTags = tagsData.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:max-w-xs">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search tags"
          placeholder="Search tags..."
          className="pl-8 h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredTags.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredTags.map((tag) => (
            <TagCard key={tag.tag_name} tag={tag} onTagUpdated={onTagUpdated} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="mt-4 text-xl font-semibold">No tags found.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Search term "{searchTerm}" did not match any tags.
          </p>
        </div>
      )}
    </div>
  );
}
