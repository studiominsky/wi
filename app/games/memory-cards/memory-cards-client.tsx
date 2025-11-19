"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  RepeatIcon,
  LightbulbIcon,
  CaretRightIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";

interface CardData {
  id: string;
  german: string;
  germanDisplay: string;
  native: string;
  article: string | null;
  image_url: string | null;
  all_examples: string[];
  color: string | null;
}

interface CardState extends CardData {
  flipped: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const GAME_SIZE = 10;

export default function MemoryCardsClient({
  initialData,
}: {
  initialData: CardData[];
}) {
  const [cards, setCards] = useState<CardState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const initializeGame = useCallback(() => {
    const sourceData = initialData.length > 0 ? initialData : [];

    const newSessionData = shuffleArray([...sourceData]).slice(0, GAME_SIZE);

    setCards(newSessionData.map((c) => ({ ...c, flipped: false })));
    setCurrentIndex(0);
    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setCards((prev) => {
      const next = [...prev];
      if (next[currentIndex]) {
        next[currentIndex] = {
          ...next[currentIndex],
          flipped: !next[currentIndex].flipped,
        };
      }
      return next;
    });
  }, [currentIndex]);

  const handleRestart = () => {
    initializeGame();
    toast.info("Game restarted with new cards.", { duration: 2000 });
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.success("Game finished! Shuffling cards for another round.", {
        duration: 3000,
      });
      handleRestart();
    }
  };

  if (loading || !currentCard) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex justify-center items-center h-[50vh]">
        <CircleNotchIcon className="size-8 animate-spin text-primary" />
        <span className="ml-2">Loading cards...</span>
      </div>
    );
  }

  const isFlipped = currentCard.flipped;
  const isWord = !currentCard.id.startsWith("trans-");

  const displayedExamples = currentCard.all_examples
    .slice(0, 3)
    .map((e) => {
      return (e || "").split("(")[0].trim();
    })
    .filter((e) => e.length > 0);

  const customColorClass = currentCard.color;
  const isCustomColor = !!customColorClass;

  const flippedCardBackground =
    customColorClass || "bg-card text-card-foreground border-border";

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs md:text-sm text-foreground font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Games</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleRestart}>
          <RepeatIcon className="w-4 h-4 mr-2" /> Restart Game
        </Button>
      </div>

      <h1 className="text-3xl font-grotesk md:text-4xl">Memory Cards</h1>

      <div className="flex justify-center w-full">
        <div className="w-full max-w-xl">
          <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>

          <div
            className="w-full aspect-[4/3] cursor-pointer"
            style={{ perspective: "1200px" }}
            onClick={handleFlip}
          >
            <div
              className={cn(
                "relative h-full w-full rounded-2xl border border-border/60 shadow-xl bg-transparent transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
                "will-change-transform"
              )}
              style={{
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center px-8 py-6 rounded-md bg-[#fbfbfb] dark:bg-[#000] border from-card to-card/80 text-card-foreground"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                }}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  {isWord ? "German Word" : "Native Phrase"}
                </p>
                <h2 className="text-4xl sm:text-5xl font-bold text-center leading-tight">
                  {isWord ? currentCard.german : currentCard.native}
                </h2>
                <p className="mt-4 text-xs text-muted-foreground/80">
                  Tap the card to reveal / hide the translation
                </p>
              </div>

              <div
                className={cn(
                  "absolute inset-0 flex flex-col px-8 py-6 rounded-md",
                  isCustomColor ? "border-current" : "border-transparent",
                  flippedCardBackground
                )}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <span>
                    {isWord ? currentCard.germanDisplay : currentCard.native}
                  </span>

                  <p className="text-xs uppercase tracking-[0.18em] opacity-80 mt-2">
                    {isWord ? "Native Translation" : "German Translation"}
                  </p>

                  <h2 className="text-3xl sm:text-4xl font-bold text-center leading-tight">
                    {isWord ? currentCard.native : currentCard.germanDisplay}
                  </h2>
                </div>

                {displayedExamples.length > 0 && (
                  <div className={cn("mt-4 pt-4 border-t border-current/30")}>
                    <p className="text-xs font-mono opacity-80 mb-2 flex items-center gap-1">
                      <LightbulbIcon className="size-3" /> Examples:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm italic leading-relaxed text-left max-h-24 overflow-y-auto">
                      {displayedExamples.map((ex, index) => (
                        <li key={index} className="text-start">
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            {!isFlipped ? (
              <Button onClick={handleFlip} size="lg" className="w-full">
                Show Answer / Flip Card
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
                className="w-full flex items-center justify-center"
              >
                {currentIndex < cards.length - 1 ? (
                  <>
                    Next Card <CaretRightIcon className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Finish Game / Restart"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
