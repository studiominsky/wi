"use client";

import { useState, useTransition } from "react";
import {
  ArrowDownIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { updateSortPreference } from "@/app/actions";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

type SortPreference = "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

interface SortControlsProps {
  currentPreference: SortPreference;
}

export function SortControls({ currentPreference }: SortControlsProps) {
  const [preference, setPreference] =
    useState<SortPreference>(currentPreference);
  const [isPending, startTransition] = useTransition();

  const setSort = (value: SortPreference) => {
    if (isPending) return;
    setPreference(value);
    startTransition(async () => {
      const result = await updateSortPreference(value);
      if (result?.error) {
        toast.error(`Failed to save sort preference: ${result.error}`);
        setPreference(currentPreference);
      }
    });
  };

  const iconBase = "absolute left-2 size-4 transition-all duration-200";

  return (
    <div className="flex items-center gap-1">
      <Toggle
        size="sm"
        pressed={preference === "date_desc"}
        onPressedChange={() => setSort("date_desc")}
        aria-label="Sort by newest first"
      >
        <ArrowDownIcon
          className={cn(
            iconBase,
            preference === "date_desc"
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-75 -translate-x-1"
          )}
        />
        Newest
      </Toggle>

      <Toggle
        size="sm"
        pressed={preference === "date_asc"}
        onPressedChange={() => setSort("date_asc")}
        aria-label="Sort by oldest first"
      >
        <ClockIcon
          className={cn(
            iconBase,
            preference === "date_asc"
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-75 -translate-x-1"
          )}
        />
        Oldest
      </Toggle>

      <Toggle
        size="sm"
        pressed={preference === "alpha_asc"}
        onPressedChange={() => setSort("alpha_asc")}
        aria-label="Sort A–Z"
      >
        <SortAscendingIcon
          className={cn(
            iconBase,
            preference === "alpha_asc"
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-75 -translate-x-1"
          )}
        />
        A–Z
      </Toggle>

      <Toggle
        size="sm"
        pressed={preference === "alpha_desc"}
        onPressedChange={() => setSort("alpha_desc")}
        aria-label="Sort Z–A"
      >
        <SortDescendingIcon
          className={cn(
            iconBase,
            preference === "alpha_desc"
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-75 -translate-x-1"
          )}
        />
        Z–A
      </Toggle>
    </div>
  );
}
