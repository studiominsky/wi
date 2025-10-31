import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, BookOpen } from "lucide-react";

type LanguageCardProps = {
  id: string;
  name: string;
  isoCode: string | null;
  wordCount: number;
};

export function LanguageCard({ name, isoCode, wordCount }: LanguageCardProps) {
  const href = isoCode ? `/inventory/${isoCode.toLowerCase()}` : "#";

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col justify-between p-6 h-40 border rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-muted/50",
        !isoCode && "opacity-60 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{name}</h2>
          {isoCode && (
            <p className="text-sm text-muted-foreground uppercase mt-1">
              {isoCode}
            </p>
          )}
        </div>
        <ChevronRight className="h-6 w-6 text-muted-foreground shrink-0" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
      {!isoCode && (
        <p className="text-xs text-destructive mt-1">
          Missing ISO code for direct link.
        </p>
      )}
    </Link>
  );
}
