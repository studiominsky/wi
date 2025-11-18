import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ScrollIcon,
  BrainIcon,
  CheckCircleIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/dist/ssr";

function GameCard({
  href,
  icon: Icon,
  title,
  description,
  disabled = false,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "relative flex flex-col justify-between p-4 rounded-lg border shadow-lg cursor-pointer",
        "aspect-square group transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1",
        disabled
          ? "bg-muted/50 text-muted-foreground opacity-60 pointer-events-none"
          : "bg-card hover:bg-card/90"
      )}
    >
      <div className="flex items-start justify-between relative">
        <Icon
          className={cn(
            "size-16 transition-transform group-hover:scale-110",
            disabled ? "" : "text-primary/70 group-hover:text-primary"
          )}
          weight="regular"
        />

        <div className="text-xs font-semibold text-primary absolute top-0 right-0">
          {disabled ? (
            <span className="text-muted-foreground italic">Coming Soon</span>
          ) : (
            <CaretRightIcon className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>

      <div className="mt-4 relative">
        <h3 className="text-xl font-bold capitalize truncate">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return disabled ? (
    <div className="h-full">{content}</div>
  ) : (
    <Link href={href} className="h-full" aria-label={`Start ${title} game`}>
      {content}
    </Link>
  );
}

export default async function GamesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/games");
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-grotesk md:text-4xl">Language Games</h1>
      <p className="text-sans text-foreground/60 max-w-lg">
        Practice your vocabulary and grammar with interactive games based on
        your inventory.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 pt-4">
        <GameCard
          href="/games/memory-cards"
          icon={ScrollIcon}
          title="Memory Cards"
          description="Test your word recall."
        />
        <GameCard
          href="/games/article-guesser"
          icon={CheckCircleIcon}
          title="Article Guesser"
          description="Guess German articles."
        />
        <GameCard
          href="/games/quick-recall"
          icon={BrainIcon}
          title="Quick Recall"
          description="Timed translation challenge."
          disabled={false}
        />
      </div>
    </div>
  );
}
