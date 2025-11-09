"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowDownAZ, ArrowUpAZ, Clock } from "lucide-react";
import { updateSortPreference } from "@/app/actions";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";

type SortPreference = "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

interface SortControlsProps {
  currentPreference: SortPreference;
}

export function SortControls({ currentPreference }: SortControlsProps) {
  const [preference, setPreference] =
    useState<SortPreference>(currentPreference);
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (value: string) => {
    if (!value) return;

    const newPreference = value as SortPreference;
    setPreference(newPreference);

    startTransition(async () => {
      const result = await updateSortPreference(newPreference);
      if (result?.error) {
        toast.error(`Failed to save sort preference: ${result.error}`);
        setPreference(currentPreference);
      } else {
      }
    });
  };

  const itemClasses = `
    h-7 px-3 rounded-md transition-colors whitespace-nowrap
    border-none bg-transparent shadow-none
    text-muted-foreground
    hover:bg-accent/50
    data-[state=on]:bg-primary 
    data-[state=on]:text-primary-foreground 
    data-[state=on]:shadow-sm
    data-[state=on]:font-semibold
    data-[state=on]:hover:bg-primary
  `;

  return (
    <ToggleGroup
      type="single"
      value={preference}
      onValueChange={handleValueChange}
      aria-label="Sort words"
      size="sm"
      className="gap-1 p-0 border-none bg-transparent"
      disabled={isPending}
    >
      <ToggleGroupItem
        value="date_desc"
        aria-label="Sort by date descending"
        className={itemClasses}
      >
        <ArrowDown className="h-4 w-4 mr-1" /> Newest
      </ToggleGroupItem>
      <ToggleGroupItem
        value="date_asc"
        aria-label="Sort by date ascending"
        className={itemClasses}
      >
        <Clock className="h-4 w-4 mr-1" /> Oldest
      </ToggleGroupItem>
      <ToggleGroupItem
        value="alpha_asc"
        aria-label="Sort alphabetically A-Z"
        className={itemClasses}
      >
        <ArrowDownAZ className="h-4 w-4 mr-1" /> A-Z
      </ToggleGroupItem>
      <ToggleGroupItem
        value="alpha_desc"
        aria-label="Sort alphabetically Z-A"
        className={itemClasses}
      >
        <ArrowUpAZ className="h-4 w-4 mr-1" /> Z-A
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
