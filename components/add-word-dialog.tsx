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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const { user, settings } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    userLanguages[0]?.id || ""
  );
  const [word, setWord] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [genGrammar, setGenGrammar] = useState(true);
  const [genExamples, setGenExamples] = useState(true);
  const [genDifficulty, setGenDifficulty] = useState(true);
  const [genSynonyms, setGenSynonyms] = useState(true);
  const [cefrLevel, setCefrLevel] = useState("B1");

  useEffect(() => {
    if (userLanguages.length > 0 && !selectedLanguage)
      setSelectedLanguage(userLanguages[0].id);
  }, [userLanguages, selectedLanguage]);

  const handleAddWord = async () => {
    setMessage("");
    if (!user || !settings) {
      setMessage("Error: You must be logged in.");
      return;
    }
    if (!selectedLanguage || !word) {
      setMessage("Error: Please fill in language and word.");
      return;
    }
    setLoading(true);
    setIsGeneratingAi(true);
    setMessage("Adding word and generating AI details...");

    const { data: newWordData, error } = await supabase
      .from("user_words")
      .insert({
        user_id: user.id,
        language_id: selectedLanguage,
        word,
        translation: null,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (error || !newWordData) {
      setLoading(false);
      setIsGeneratingAi(false);
      if ((error as any)?.code === "23505")
        setMessage(`Error: You've already added "${word}" for this language.`);
      else
        setMessage(
          `Error adding word: ${(error as any)?.message || "Unknown error"}`
        );
      return;
    }

    const newWordId = newWordData.id;

    const aiOptions = {
      translation: true,
      grammar: genGrammar,
      examples: genExamples ? 3 : 0,
      level: cefrLevel,
      difficulty: genDifficulty,
      synonyms: genSynonyms,
    };

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
          nativeLanguage: settings.native_language,
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

      setMessage("Word added & AI details saved!");
    } catch (e: any) {
      setMessage(
        `Word added, but failed to generate/save AI details: ${e.message}`
      );
    } finally {
      setIsGeneratingAi(false);
    }

    setWord("");
    setNotes("");
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
      setNotes("");
      setLoading(false);
      setIsGeneratingAi(false);
    }
  };

  const aiOptionsSelected =
    genGrammar || genExamples || genDifficulty || genSynonyms;

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
            Enter a word. AI will generate the translation and other details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 px-1 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <Label htmlFor="word-language">Language</Label>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              disabled={loading || userLanguages.length === 0}
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
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="word-notes">Notes (Optional)</Label>
            <Textarea
              id="word-notes"
              placeholder="e.g., Personal reminder..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px]"
              disabled={loading}
            />
          </div>
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              AI Enhancements
            </h4>
            <p className="text-sm text-muted-foreground">
              Translation into your native language (
              {settings?.native_language || "..."}) is always included.
            </p>
            <div className="flex flex-wrap gap-2">
              <Toggle
                variant="outline"
                size="sm"
                pressed={genGrammar}
                onPressedChange={setGenGrammar}
                disabled={loading}
              >
                Grammar
              </Toggle>
              <Toggle
                variant="outline"
                size="sm"
                pressed={genExamples}
                onPressedChange={setGenExamples}
                disabled={loading}
              >
                Examples
              </Toggle>
              <Toggle
                variant="outline"
                size="sm"
                pressed={genDifficulty}
                onPressedChange={setGenDifficulty}
                disabled={loading}
              >
                Difficulty
              </Toggle>
              <Toggle
                variant="outline"
                size="sm"
                pressed={genSynonyms}
                onPressedChange={setGenSynonyms}
                disabled={loading}
              >
                Synonyms
              </Toggle>
            </div>
            {aiOptionsSelected && (
              <div className="space-y-2">
                <Label htmlFor="cefr-level">
                  Explanation/Example Level (CEFR)
                </Label>
                <Select
                  value={cefrLevel}
                  onValueChange={setCefrLevel}
                  disabled={loading}
                >
                  <SelectTrigger id="cefr-level" className="w-[180px]">
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
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleAddWord}
            disabled={
              loading ||
              userLanguages.length === 0 ||
              !selectedLanguage ||
              !word
            }
          >
            {loading ? "Adding & Generating..." : "Add Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
