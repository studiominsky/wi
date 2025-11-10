"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SortControls } from "@/components/sort-controls";

interface Word {
  id: string | number;
  word: string;
  translation: string | null;
  color: string | null;
  category: string | null;
  gender: string | null;
  colorClass: string;
}

type SortPreference = "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

interface WordTableProps {
  words: Word[];
  currentSortPreference: SortPreference;
  isNativeInventory?: boolean;
}

export function WordTable({
  words,
  currentSortPreference,
  isNativeInventory = false,
}: WordTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const categoryOptions = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    words.forEach((word) => {
      if (word.category) {
        uniqueCategories.add(word.category);
      }
    });

    const sortedCategories = Array.from(uniqueCategories).sort();

    return ["All", ...sortedCategories];
  }, [words]);

  React.useEffect(() => {
    if (!categoryOptions.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categoryOptions, selectedCategory]);

  const filteredWords = React.useMemo(() => {
    let filtered = words;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((word) => word.category === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (word) =>
          word.word.toLowerCase().includes(lowerSearchTerm) ||
          word.translation?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return filtered;
  }, [words, searchTerm, selectedCategory]);

  const getLinkHref = (word: Word) => {
    if (isNativeInventory) {
      return `/translations/${word.id}`;
    }
    return `/inventory/${encodeURIComponent(word.word)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center rounded-md border bg-card dark:bg-card dark:border-border/50 p-1 gap-1 flex-wrap">
        <Input
          placeholder="Search word..."
          className="h-7 px-3 py-0 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent text-foreground flex-grow max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-7 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent w-auto px-3 p-0 text-muted-foreground hover:bg-accent/50 rounded-md">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SortControls currentPreference={currentSortPreference} />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-1/12">#</TableHead>
              <TableHead className="w-4/12">
                {isNativeInventory ? "Native Phrase" : "Word"}
              </TableHead>
              <TableHead className="w-4/12 hidden sm:table-cell">
                {isNativeInventory ? "Translation (German)" : "Translation"}
              </TableHead>
              <TableHead className="w-3/12">Category / Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWords.length > 0 ? (
              filteredWords.map((word) => {
                const isNoun = word.category === "Noun";
                const badgeVariant = isNoun ? "outline" : "grammar";

                const badgeText = word.category;

                const secondaryText =
                  isNoun && word.gender ? `(${word.gender})` : "";

                const href = getLinkHref(word);
                return (
                  <TableRow key={word.id} className="relative cursor-pointer">
                    <TableCell className="w-1/12 py-2">
                      <span
                        className={cn(
                          "size-3 rounded-full shrink-0 border",
                          word.colorClass
                        )}
                      />
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-[200px] w-4/12 pr-2">
                      <Link
                        href={href}
                        className="hover:underline hover:text-primary/90 block w-full"
                      >
                        {word.word}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate hidden sm:table-cell w-4/12 pr-2">
                      <Link href={href} className="block w-full">
                        {word.translation}
                      </Link>
                    </TableCell>
                    <TableCell className="flex items-center gap-2 w-3/12 pr-2">
                      {word.category && (
                        <Badge
                          variant={badgeVariant}
                          className="capitalize shrink-0"
                        >
                          {badgeText}
                        </Badge>
                      )}
                      {secondaryText && (
                        <span className="text-xs text-muted-foreground italic shrink-0">
                          {secondaryText}
                        </span>
                      )}
                      <Link
                        href={href}
                        className="absolute inset-0"
                        aria-label={`View ${word.word}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No words found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
