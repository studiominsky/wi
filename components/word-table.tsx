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

interface Word {
  id: number;
  word: string;
  translation: string | null;
  color: string | null;
  category: string | null;
  gender: string | null;
  colorClass: string;
}

interface WordTableProps {
  words: Word[];
  currentSortPreference: string;
}

export function WordTable({ words, currentSortPreference }: WordTableProps) {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search word or translation..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger id="category-filter" className="w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-1/12">#</TableHead>
              <TableHead className="w-4/12">Word</TableHead>
              <TableHead className="w-4/12 hidden sm:table-cell">
                Translation
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
                        href={`/inventory/${encodeURIComponent(word.word)}`}
                        className="hover:underline hover:text-primary/90 block w-full"
                      >
                        {word.word}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate hidden sm:table-cell w-4/12 pr-2">
                      <Link
                        href={`/inventory/${encodeURIComponent(word.word)}`}
                        className="block w-full"
                      >
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
                        href={`/inventory/${encodeURIComponent(word.word)}`}
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
