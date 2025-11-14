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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SortControls } from "@/components/sort-controls";
import {
  MagnifyingGlassIcon,
  CheckIcon,
  CaretUpDownIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EntryActionMenu } from "@/components/edit-word-dialog";
import { useRouter } from "next/navigation";

interface Word {
  id: string | number;
  word: string;
  translation: string;
  color: string | null;
  category: string | null;
  gender: string | null;
  colorClass: string;
  notes: string | null;
  image_url: string | null;
  tags: string[] | null;
}

type SortPreference = "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

interface WordTableProps {
  words: Word[];
  currentSortPreference: SortPreference;
  isNativeInventory?: boolean;
}

function CategoryCombobox({
  value,
  onChange,
  options,
  ariaLabel = "Filter by category",
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          className="h-9 min-w-[10rem] justify-between"
        >
          <span className="truncate">
            {value !== "All" ? value : "All Categories"}
          </span>
          <CaretUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[220px]" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." className="h-9" />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      option === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function WordTable({
  words: initialWords,
  currentSortPreference,
  isNativeInventory = false,
}: WordTableProps) {
  const router = useRouter();
  const [words, setWords] = React.useState(initialWords);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const itemsPerPageOptions = [10, 25, 50, 100];

  React.useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  const categoryOptions = React.useMemo(() => {
    const unique = new Set<string>();
    for (const w of words) if (w.category) unique.add(w.category);
    return ["All", ...Array.from(unique).sort()];
  }, [words]);

  React.useEffect(() => {
    if (!categoryOptions.includes(selectedCategory)) setSelectedCategory("All");
    setCurrentPage(1);
  }, [categoryOptions, selectedCategory]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const totalItems = filteredWords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;

  const paginatedWords = React.useMemo(() => {
    return filteredWords.slice(startIdx, endIdx);
  }, [filteredWords, startIdx, endIdx]);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = Number(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getLinkHref = (word: Word) =>
    isNativeInventory
      ? `/translations/${word.id}`
      : `/inventory/${encodeURIComponent(word.word)}`;

  const searchPlaceholder = isNativeInventory
    ? "Search phrase or translation..."
    : "Search word or translation...";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
          <CategoryCombobox
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            ariaLabel="Filter by category"
          />
        </div>

        <Separator orientation="vertical" className="hidden sm:flex h-6" />

        <div className="ml-auto">
          <SortControls currentPreference={currentSortPreference} />
        </div>
      </div>

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
            <TableHead className="w-3/12">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedWords.length > 0 ? (
            paginatedWords.map((word) => {
              const isNoun = word.category === "Noun";
              const badgeVariant = isNoun ? "outline" : ("grammar" as const);
              const badgeText = word.category;
              const secondaryText =
                isNoun && word.gender ? `(${word.gender})` : "";
              const href = getLinkHref(word);

              const entryData = {
                id: word.id,
                word: word.word,
                translation: word.translation,
                notes: word.notes,
                color: word.color,
                image_url: word.image_url,
                tags: word.tags,
              };

              return (
                <TableRow key={word.id} className="relative group/row">
                  <TableCell className="w-1/12 py-2">
                    <Link
                      href={href}
                      className={cn(
                        "size-3 rounded-full shrink-0 border block",
                        word.color || "bg-transparent border-input"
                      )}
                      aria-label={`View ${word.word}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[200px] w-4/12 pr-2">
                    <Link href={href} className="block w-full">
                      {word.word}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate hidden sm:table-cell w-4/12 pr-2">
                    <Link href={href} className="block w-full">
                      {word.translation}
                    </Link>
                  </TableCell>
                  <TableCell className="w-3/12 pr-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                      </div>
                      <div className="shrink-0">
                        <EntryActionMenu
                          entry={entryData}
                          isNativePhrase={isNativeInventory}
                        />
                      </div>
                    </div>
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

      {totalItems > 0 && (
        <div className="flex items-center justify-between text-sm py-2">
          <div className="flex items-center space-x-2">
            <p className="text-muted-foreground hidden sm:block">
              Rows per page
            </p>
            <Select
              value={String(itemsPerPage)}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger size="sm" className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground hidden sm:block">
              Showing {Math.min(startIdx + 1, totalItems)} to{" "}
              {Math.min(endIdx, totalItems)} of {totalItems} entries
            </p>
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationPrevious
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
              />
              <PaginationItem className="hidden sm:block">
                <p className="text-sm font-medium px-4">
                  Page {currentPage} of {totalPages}
                </p>
              </PaginationItem>
              <PaginationNext
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
              />
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
