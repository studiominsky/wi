"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  RepeatIcon,
  CheckIcon,
  XIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ArticleGameEntry {
  id: string | number;
  word: string;
  translation: string;
  gender: "Masculine" | "Feminine" | "Neuter";
}

interface GameState extends ArticleGameEntry {
  status: "playing" | "correct" | "incorrect";
  guess: string | null;
}

const articleMap = {
  Masculine: "Der",
  Feminine: "Die",
  Neuter: "Das",
};

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

export default function ArticleGuesserClient({
  initialData,
}: {
  initialData: ArticleGameEntry[];
}) {
  const [data, setData] = useState<GameState[]>(
    shuffleArray([...initialData]).map(
      (e) =>
        ({
          ...e,
          status: "playing",
          guess: null,
        } as GameState)
    )
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isGameOver, setIsGameOver] = useState(false);

  const currentItem = data[currentIndex];

  const handleGuess = (guessedArticle: string) => {
    if (!currentItem || currentItem.status !== "playing") return;

    const correctArticle = articleMap[currentItem.gender];
    const isCorrect = guessedArticle === correctArticle;

    setData((prev) => {
      const newData = [...prev];
      newData[currentIndex] = {
        ...newData[currentIndex],
        status: isCorrect ? "correct" : "incorrect",
        guess: guessedArticle,
      };
      return newData;
    });

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
      toast.success("Game Over! See your final score below.", {
        duration: 5000,
      });
    }
  };

  const handleRestart = () => {
    const newData = shuffleArray([...initialData]).map(
      (e) =>
        ({
          ...e,
          status: "playing",
          guess: null,
        } as GameState)
    );
    setData(newData);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setIsGameOver(false);
  };

  const currentArticle = currentItem ? articleMap[currentItem.gender] : "";
  const buttonsDisabled = currentItem && currentItem.status !== "playing";
  const { correct, total } = score;

  if (!currentItem && !isGameOver) return null;

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

      <h1 className="text-3xl font-grotesk md:text-4xl">Article Guesser</h1>
      <p className="text-sans text-foreground/60 max-w-xl">
        Guess the correct German article for the noun.
      </p>

      <div className="flex justify-center w-full">
        <div className="w-full max-w-xl space-y-6 p-6 border rounded-md g-[#fbfbfb] dark:bg-[#000]">
          {isGameOver ? (
            <div className="text-center py-10">
              <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
              <p className="text-xl text-primary">
                Final Score: {correct} / {data.length}
              </p>
              <Button onClick={handleRestart} className="mt-6">
                Play Again
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Word {currentIndex + 1} of {data.length}
                </span>
                <span className="cursor-pointer relative inline-flex items-center justify-center rounded-full text-sm font-medium bg-[#52eec8] transition-all focus-visible:outline-none border border-input text-black h-8 px-3">
                  Score: {correct} / {total}
                </span>
              </div>

              <div className="text-center space-y-2">
                <p className="text-5xl font-bold">{currentItem.word}</p>
                <p className="text-xl text-muted-foreground">
                  ({currentItem.translation})
                </p>
              </div>

              <Separator className="bg-[#52eec8]" />

              <div className="flex justify-around gap-4">
                {Object.values(articleMap).map((article) => {
                  const isCorrect =
                    currentItem.status === "correct" &&
                    article === currentArticle;
                  const isIncorrectGuess =
                    currentItem.status === "incorrect" &&
                    article === currentItem.guess;
                  const isCorrectAnswer =
                    currentItem.status === "incorrect" &&
                    article === currentArticle;

                  const buttonVariant = isCorrect
                    ? "default"
                    : isIncorrectGuess
                    ? "destructive"
                    : isCorrectAnswer
                    ? "outline"
                    : "outline";

                  return (
                    <Button
                      key={article}
                      onClick={() => handleGuess(article)}
                      disabled={buttonsDisabled}
                      variant={buttonVariant}
                      className={cn(
                        "text-lg w-fit capitalize font-sans",
                        isCorrectAnswer &&
                          "bg-green-600/20 capitalize hover:bg-green-600/30 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300"
                      )}
                    >
                      {article}
                    </Button>
                  );
                })}
              </div>

              {currentItem.status !== "playing" && (
                <div className="text-center space-y-2 pt-4">
                  <p
                    className={cn(
                      "text-md font-medium flex items-center justify-center gap-2",
                      currentItem.status === "correct"
                        ? "text-green-600 dark:text-green-400"
                        : "text-destructive"
                    )}
                  >
                    {currentItem.status === "correct" ? (
                      <>
                        <CheckIcon className="size-5" /> Correct!{" "}
                        {currentArticle} {currentItem.word}
                      </>
                    ) : (
                      <>
                        <XIcon className="size-5" /> Incorrect. The correct
                        article is {currentArticle}.
                      </>
                    )}
                  </p>
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="mt-4 flex items-center justify-center"
                  >
                    {currentIndex < data.length - 1 ? (
                      <>
                        Next Word <CaretRightIcon className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      "Finish Game"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
