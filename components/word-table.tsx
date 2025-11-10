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
import { Separator } from "@/components/ui/separator";
import { SortControls } from "@/components/sort-controls";
import { Search } from "lucide-react";

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
    const unique = new Set<string>();
    for (const w of words) if (w.category) unique.add(w.category);
    return ["All", ...Array.from(unique).sort()];
  }, [words]);

  React.useEffect(() => {
    if (!categoryOptions.includes(selectedCategory)) setSelectedCategory("All");
  }, [categoryOptions, selectedCategory]);

  const filteredWords = React.useMemo(() => {
    let data = words;
    if (selectedCategory !== "All") {
      data = data.filter((w) => w.category === selectedCategory);
    }
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          (w.translation ? w.translation.toLowerCase().includes(q) : false)
      );
    }
    return data;
  }, [words, searchTerm, selectedCategory]);

  const getLinkHref = (word: Word) =>
    isNativeInventory
      ? `/translations/${word.id}`
      : `/inventory/${encodeURIComponent(word.word)}`;

  const searchPlaceholder = isNativeInventory
    ? "Search phrase or translation..."
    : "Search word or translation...";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap rounded-lg border bg-card p-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search"
            placeholder={searchPlaceholder}
            className="pl-8 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Separator orientation="vertical" className="hidden sm:flex h-6" />

        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              aria-label="Filter by category"
              className="h-9 min-w-[10rem]"
            >
              <SelectValue placeholder="Filter category" />
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

        <Separator orientation="vertical" className="hidden sm:flex h-6" />

        <div className="ml-auto">
          <SortControls currentPreference={currentSortPreference} />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-1/12">Color</TableHead>
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
