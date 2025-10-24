"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { PlusCircle, Minus, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserLanguage = { id: string; language_name: string };

type AddWordDialogProps = {
  userLanguages: UserLanguage[];
  onWordAdded?: (wordId: number | string) => void;
};

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function AddWordDialog({
  userLanguages,
  onWordAdded,
}: AddWordDialogProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    userLanguages[0]?.id || ""
  );
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [includeGrammar, setIncludeGrammar] = useState(false);
  const [includeExamples, setIncludeExamples] = useState(false);
  const [exampleCount, setExampleCount] = useState(3);
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [includeDifficulty, setIncludeDifficulty] = useState(false);
  const [includeSynonyms, setIncludeSynonyms] = useState(false);

  useEffect(() => {
    if (userLanguages.length > 0 && !selectedLanguage)
      setSelectedLanguage(userLanguages[0].id);
  }, [userLanguages, selectedLanguage]);

  const handleAddWord = async () => {
    setMessage("");
    if (!user) {
      setMessage("Error: You must be logged in.");
      return;
    }
    if (!selectedLanguage || !word || !translation) {
      setMessage("Error: Please fill in language, word, and translation.");
      return;
    }
    setLoading(true);
    setMessage("Adding word...");

    const { data: newWordData, error } = await supabase
      .from("user_words")
      .insert({
        user_id: user.id,
        language_id: selectedLanguage,
        word,
        translation,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (error || !newWordData) {
      setLoading(false);
      if ((error as any)?.code === "23505")
        setMessage(`Error: You've already added "${word}" for this language.`);
      else
        setMessage(
          `Error adding word: ${(error as any)?.message || "Unknown error"}`
        );
      return;
    }

    setMessage("Word added! Requesting AI details...");
    const newWordId = newWordData.id;

    const aiOptions = {
      grammar: includeGrammar,
      examples: includeExamples ? exampleCount : 0,
      level: cefrLevel,
      difficulty: includeDifficulty,
      synonyms: includeSynonyms,
    };

    const isAiRequested = Object.values(aiOptions).some(
      (val) => val === true || (typeof val === "number" && val > 0)
    );

    if (isAiRequested) {
      setIsGeneratingAi(true);
      try {
        const res = await fetch("/api/generate-word-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wordId: newWordId,
            wordText: word,
            languageName:
              userLanguages.find((l) => l.id === selectedLanguage)
                ?.language_name || "Unknown",
            options: aiOptions,
            userId: user.id,
          }),
        });

        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          if (ct.includes("application/json")) {
            const err = await res.json();
            throw new Error(err.error || `HTTP ${res.status}`);
          } else {
            const text = await res.text();
            throw new Error(
              `HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`
            );
          }
        }

        const { aiData } = await res.json();

        if (aiData) {
          setMessage("AI details generated! Saving...");
          const { error: updateError } = await supabase
            .from("user_words")
            .update({ ai_data: aiData })
            .eq("id", newWordId);

          if (updateError) {
            throw new Error(`Failed to save AI data: ${updateError.message}`);
          }
        }

        setMessage("Word added & AI details saved!");
      } catch (e: any) {
        setMessage(
          `Word added, but failed to process AI details: ${e.message}`
        );
      } finally {
        setIsGeneratingAi(false);
      }
    } else {
      setMessage("Success! Word added.");
    }

    setWord("");
    setTranslation("");
    setNotes("");
    setIncludeGrammar(false);
    setIncludeExamples(false);
    setExampleCount(3);
    setIncludeDifficulty(false);
    setIncludeSynonyms(false);

    onWordAdded?.(newWordId);

    setTimeout(() => {
      setOpen(false);
      setMessage("");
      setLoading(false);
    }, 1500);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setMessage("");
      setWord("");
      setTranslation("");
      setNotes("");
      setLoading(false);
      setIsGeneratingAi(false);
      setIncludeGrammar(false);
      setIncludeExamples(false);
      setExampleCount(3);
      setIncludeDifficulty(false);
      setIncludeSynonyms(false);
    }
  };

  const adjustExampleCount = (amount: number) => {
    setExampleCount((prev) => Math.max(1, Math.min(10, prev + amount)));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Word
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
          <DialogDescription>
            Enter the word details. Optionally select AI features to generate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 px-1 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <Label htmlFor="word-language">Language</Label>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              disabled={loading || isGeneratingAi || userLanguages.length === 0}
            >
              <SelectTrigger id="word-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {userLanguages.length === 0 ? (
                  <SelectItem value="-" disabled>
                    Add a language first
                  </SelectItem>
                ) : (
                  userLanguages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.language_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="word-text">Word</Label>
            <Input
              id="word-text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g., Olá"
              disabled={loading || isGeneratingAi}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="word-translation">Translation</Label>
            <Input
              id="word-translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="e.g., Hello"
              disabled={loading || isGeneratingAi}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="word-notes">Notes</Label>
            <Textarea
              id="word-notes"
              placeholder="e.g., Example sentence..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px]"
              disabled={loading || isGeneratingAi}
            />
          </div>
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              AI Enhancements (Optional)
            </h4>
            <div className="items-top flex space-x-2">
              <Checkbox
                id="ai-grammar"
                checked={includeGrammar}
                onCheckedChange={(checked) =>
                  setIncludeGrammar(Boolean(checked))
                }
                disabled={loading || isGeneratingAi}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="ai-grammar"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Grammar Explanation
                </label>
              </div>
            </div>
            <div className="items-top flex space-x-2">
              <Checkbox
                id="ai-examples"
                checked={includeExamples}
                onCheckedChange={(checked) =>
                  setIncludeExamples(Boolean(checked))
                }
                disabled={loading || isGeneratingAi}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="ai-examples"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Example Sentences
                </label>
              </div>
            </div>
            {includeExamples && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="example-count">Number of Examples</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => adjustExampleCount(-1)}
                    disabled={loading || isGeneratingAi || exampleCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="example-count"
                    type="number"
                    value={exampleCount}
                    readOnly
                    className="w-12 text-center h-7"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => adjustExampleCount(1)}
                    disabled={loading || isGeneratingAi || exampleCount >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {(includeGrammar || includeExamples) && (
              <div className="space-y-2">
                <Label htmlFor="cefr-level">
                  Explanation/Example Level (CEFR)
                </Label>
                <Select
                  value={cefrLevel}
                  onValueChange={setCefrLevel}
                  disabled={loading || isGeneratingAi}
                >
                  <SelectTrigger id="cefr-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {cefrLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="items-top flex space-x-2">
              <Checkbox
                id="ai-difficulty"
                checked={includeDifficulty}
                onCheckedChange={(checked) =>
                  setIncludeDifficulty(Boolean(checked))
                }
                disabled={loading || isGeneratingAi}
              />
              <Label
                htmlFor="ai-difficulty"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Difficulty Estimation (Learner)
              </Label>
            </div>
            <div className="items-top flex space-x-2">
              <Checkbox
                id="ai-synonyms"
                checked={includeSynonyms}
                onCheckedChange={(checked) =>
                  setIncludeSynonyms(Boolean(checked))
                }
                disabled={loading || isGeneratingAi}
              />
              <Label
                htmlFor="ai-synonyms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Synonyms/Antonyms
              </Label>
            </div>
          </div>
        </div>
        {message && (
          <p
            className={`text-center text-sm px-6 pb-2 ${
              message.startsWith("Error")
                ? "text-destructive"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
        {isGeneratingAi && (
          <p className="text-center text-sm px-6 pb-2 text-blue-600 animate-pulse">
            Generating AI details...
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={loading || isGeneratingAi}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleAddWord}
            disabled={
              loading ||
              isGeneratingAi ||
              userLanguages.length === 0 ||
              !selectedLanguage ||
              !word ||
              !translation
            }
          >
            {loading
              ? isGeneratingAi
                ? "Adding & Generating..."
                : "Adding Word..."
              : "Add Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
