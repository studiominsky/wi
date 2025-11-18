"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeftIcon,
  RepeatIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface RecallEntry {
  source: string;
  target: string;
  direction: "G-N" | "N-G";
}

interface GameState extends RecallEntry {
  status: "pending" | "correct" | "incorrect";
}

const TOTAL_TIME_MS = 60000;
const GAME_LENGTH = 15;
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

const normalizeInput = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9äöüß]/g, "");

export default function QuickRecallClient({
  initialData,
}: {
  initialData: RecallEntry[];
}) {
  const [sessionData, setSessionData] = useState<GameState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME_MS);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentItem = sessionData[currentIndex];

  const score = sessionData.filter((e) => e.status === "correct").length;
  const attempted = sessionData.filter((e) => e.status !== "pending").length;

  const startNewGame = useCallback(() => {
    const randomizedSet = shuffleArray([...initialData]).slice(0, GAME_LENGTH);
    setSessionData(randomizedSet.map((e) => ({ ...e, status: "pending" })));

    setCurrentIndex(0);
    setUserInput("");
    setTimeRemaining(TOTAL_TIME_MS);
    setIsGameOver(false);
    setIsRunning(true);
    inputRef.current?.focus();
  }, [initialData]);

  useEffect(() => {
    if (initialData.length > 0) {
      startNewGame();
    }
  }, [initialData, startNewGame]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 100));
      }, 100);
    } else if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      setIsGameOver(true);
      toast.error(`Time's up! You scored ${score} out of ${attempted}.`, {
        duration: 5000,
      });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeRemaining, score, attempted]);

  const handleNextWord = (status: "correct" | "incorrect") => {
    setSessionData((prev) => {
      const nextData = [...prev];
      if (nextData[currentIndex]) {
        nextData[currentIndex] = { ...nextData[currentIndex], status: status };
      }
      return nextData;
    });

    setUserInput("");

    if (currentIndex < GAME_LENGTH - 1) {
      setCurrentIndex((prev) => prev + 1);
      inputRef.current?.focus();
    } else {
      setIsRunning(false);
      setIsGameOver(true);
      toast.success("Congratulations, you finished the challenge!", {
        duration: 5000,
      });
    }
  };

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !isRunning || isGameOver || userInput.trim() === "")
      return;

    const targets = currentItem.target.split("/").map((t) => normalizeInput(t));
    const normalizedInput = normalizeInput(userInput);

    const isCorrect = targets.includes(normalizedInput);

    handleNextWord(isCorrect ? "correct" : "incorrect");
  };

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const timerDisplay = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const sourceLang =
    currentItem?.direction === "G-N" ? "German Word" : "Native Phrase";
  const targetLang =
    currentItem?.direction === "G-N"
      ? "Native Translation"
      : "German Translation";
  const scoreDisplay = `${score} / ${attempted}`;

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
        <Button
          variant="ghost"
          size="sm"
          onClick={startNewGame}
          disabled={isRunning}
        >
          <RepeatIcon className="w-4 h-4 mr-2" /> Restart
        </Button>
      </div>

      <h1 className="text-3xl font-grotesk md:text-4xl">
        Quick Recall Challenge
      </h1>
      <p className="text-sans text-foreground/60 max-w-xl">
        Translate the word/phrase as quickly as possible. **Goal: {GAME_LENGTH}{" "}
        attempts in 60 seconds.**
      </p>

      <div className="flex justify-center w-full">
        <div className="w-full max-w-xl space-y-6 p-6 border rounded-lg bg-card shadow-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span className="flex items-center gap-2">
              <ClockIcon
                className={cn(
                  "size-5",
                  timeRemaining < 10000 && timeRemaining > 0
                    ? "text-destructive animate-pulse"
                    : "text-primary"
                )}
              />
              {timerDisplay}
            </span>
            <span>{scoreDisplay} Correct</span>
          </div>
          <Separator />

          {isGameOver ? (
            <div className="text-center py-10">
              <h2 className="text-3xl font-bold mb-2">
                {score === GAME_LENGTH
                  ? "Perfect Score!"
                  : "Challenge Finished!"}
              </h2>
              <p className="text-xl text-primary">
                Final Score: {score} / {GAME_LENGTH}
              </p>
              <Button onClick={startNewGame} className="mt-6">
                Play Again
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-4 py-8">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">
                  {sourceLang} ({currentIndex + 1} of {GAME_LENGTH})
                </p>
                <p className="text-5xl font-bold">{currentItem?.source}</p>
              </div>

              <form onSubmit={handleSubmission} className="space-y-4">
                <Label
                  htmlFor="translation-input"
                  className="text-muted-foreground"
                >
                  Type {targetLang}
                </Label>
                <Input
                  id="translation-input"
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Your translation here..."
                  autoComplete="off"
                  disabled={!isRunning}
                />
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!isRunning || userInput.trim() === ""}
                >
                  Submit Answer
                </Button>
              </form>

              {attempted > 0 && (
                <div className="flex items-center justify-center pt-2">
                  {sessionData[currentIndex - 1]?.status === "correct" ? (
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <CheckIcon className="size-5 mr-2" /> Correct!
                    </span>
                  ) : sessionData[currentIndex - 1]?.status === "incorrect" ? (
                    <span className="flex flex-col items-center text-destructive">
                      <div className="flex items-center">
                        <XIcon className="size-5 mr-2" /> Incorrect.
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">
                        Correct: "{sessionData[currentIndex - 1]?.target}"
                      </span>
                    </span>
                  ) : null}
                </div>
              )}
            </>
          )}

          <div className="pt-4 text-sm text-muted-foreground">
            Attempted: {attempted} / {GAME_LENGTH}
          </div>
        </div>
      </div>
    </div>
  );
}
