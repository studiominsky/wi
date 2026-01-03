"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { PlusIcon, CircleNotchIcon, CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fetchUniqueTagsWithWords } from "@/app/actions";

type ExistingTag = {
  tag_name: string;
  color_class: string | null;
};

type TagInputTogglesProps = {
  currentTags: string[];
  onChange: (tags: string[]) => void;
  isLoading: boolean;
};

const normalizeTag = (tag: string): string =>
  tag
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

const stringToTags = (s: string): string[] => {
  return s
    .split(/[,;\s]+/)
    .map(normalizeTag)
    .filter((tag) => tag.length > 0);
};

export function TagInputToggles({
  currentTags,
  onChange,
  isLoading: isParentLoading,
}: TagInputTogglesProps) {
  const [existingTags, setExistingTags] = useState<ExistingTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [newTagInput, setNewTagInput] = useState("");
  const [newlyAddedTagsForDisplay, setNewlyAddedTagsForDisplay] = useState<
    ExistingTag[]
  >([]);

  useEffect(() => {
    async function loadTags() {
      try {
        const data = await fetchUniqueTagsWithWords();
        if (data) {
          const simplifiedTags = data.map((tag) => ({
            tag_name: tag.tag_name,
            color_class: tag.color_class,
          }));
          setExistingTags(simplifiedTags);
        }
      } catch (e) {
        console.error("Failed to fetch existing tags:", e);
      } finally {
        setLoadingTags(false);
      }
    }
    loadTags();
  }, []);

  const allDisplayTags = useMemo(() => {
    const tagMap = new Map<string, ExistingTag>();

    [...existingTags, ...newlyAddedTagsForDisplay].forEach((tag) => {
      tagMap.set(tag.tag_name, tag);
    });

    currentTags.forEach((tag_name) => {
      if (!tagMap.has(tag_name)) {
        tagMap.set(tag_name, { tag_name, color_class: null });
      }
    });

    return Array.from(tagMap.values()).sort((a, b) =>
      a.tag_name.localeCompare(b.tag_name)
    );
  }, [existingTags, newlyAddedTagsForDisplay, currentTags]);

  const normalizedCurrentTags = useMemo(
    () => currentTags.map(normalizeTag),
    [currentTags]
  );

  const isTagSelected = (tag: ExistingTag) =>
    normalizedCurrentTags.includes(tag.tag_name);

  const handleToggle = (tag: ExistingTag, isPressed: boolean) => {
    let newSelection;
    if (isPressed) {
      if (!currentTags.includes(tag.tag_name)) {
        newSelection = [...currentTags, tag.tag_name];
      }
    } else {
      newSelection = currentTags.filter((t) => t !== tag.tag_name);
    }

    if (newSelection !== undefined) {
      onChange(newSelection);
    }
  };

  const handleAddNewTag = () => {
    const newTags = stringToTags(newTagInput);
    if (newTags.length > 0) {
      const uniqueNewSelectedTags: string[] = [];
      const uniqueNewDisplayTags: ExistingTag[] = [];

      newTags.forEach((tag) => {
        if (!allDisplayTags.find((t) => t.tag_name === tag)) {
          uniqueNewDisplayTags.push({ tag_name: tag, color_class: null });
        }

        if (!currentTags.includes(tag)) {
          uniqueNewSelectedTags.push(tag);
        }
      });

      if (uniqueNewDisplayTags.length > 0) {
        setNewlyAddedTagsForDisplay((prev) => [
          ...prev,
          ...uniqueNewDisplayTags,
        ]);
      }

      if (uniqueNewSelectedTags.length > 0) {
        onChange([...currentTags, ...uniqueNewSelectedTags]);
      }

      setNewTagInput("");
    }
  };

  const currentNewTags = stringToTags(newTagInput);

  return (
    <div className="space-y-4">
      <Label htmlFor="new-tag-input">Tags</Label>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1">
          {loadingTags && (
            <div className="flex items-center text-sm text-muted-foreground h-6">
              <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" /> Loading
              existing tags...
            </div>
          )}

          {!loadingTags && allDisplayTags.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No tags have been added yet.
            </p>
          ) : (
            <>
              {!loadingTags &&
                allDisplayTags.map((tag) => {
                  const selected = isTagSelected(tag);

                  return (
                    <Toggle
                      key={tag.tag_name}
                      size="sm"
                      pressed={selected}
                      onPressedChange={(isPressed) =>
                        handleToggle(tag, isPressed)
                      }
                      disabled={isParentLoading || loadingTags}
                      className={cn("capitalize group relative")}
                    >
                      <CheckIcon
                        className={cn(
                          "absolute left-2 size-4 transition-all duration-200",
                          selected
                            ? "opacity-100 scale-100 translate-x-0"
                            : "opacity-0 scale-75 -translate-x-1"
                        )}
                      />

                      <span className={cn(selected && "")}>{tag.tag_name}</span>
                    </Toggle>
                  );
                })}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Select existing tags or add new ones below.
        </p>
      </div>

      <div className="flex w-full space-x-2">
        <Input
          id="new-tag-input"
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddNewTag();
            }
          }}
          placeholder="e.g., family, sports (or hit enter)"
          disabled={isParentLoading}
        />
        <Button
          type="button"
          size="icon"
          onClick={handleAddNewTag}
          disabled={isParentLoading || currentNewTags.length === 0}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {newTagInput && (
        <div className="flex flex-wrap gap-1 mt-1">
          {currentNewTags.map((tag, index) => {
            const isAlreadyOption = allDisplayTags.some(
              (t) => t.tag_name === tag
            );

            return !isAlreadyOption ? (
              <div
                key={index}
                className={cn(
                  "bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs"
                )}
              >
                {tag} (New - Press + to add as option)
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
