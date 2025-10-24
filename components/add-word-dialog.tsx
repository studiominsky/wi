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
import { PlusCircle, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UserLanguage = { id: string; language_name: string };

type AddWordDialogProps = {
  userLanguages: UserLanguage[];
  onWordAdded?: (wordId: number | string) => void;
};

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const colorOptions = [
  { name: "Default", value: null, displayClass: "bg-transparent border-input" },

  {
    name: "Red",
    value:
      "bg-red-100 border-red-200 text-red-800 dark:bg-red-800/50 dark:border-red-700/60 dark:text-red-200",
    displayClass:
      "bg-red-100 border-red-200 dark:bg-red-800/50 dark:border-red-700/60",
  },

  {
    name: "Blue",
    value:
      "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-800/50 dark:border-blue-700/60 dark:text-blue-200",
    displayClass:
      "bg-blue-100 border-blue-200 dark:bg-blue-800/50 dark:border-blue-700/60",
  },

  {
    name: "Green",
    value:
      "bg-green-100 border-green-200 text-green-800 dark:bg-green-800/50 dark:border-green-700/60 dark:text-green-200",
    displayClass:
      "bg-green-100 border-green-200 dark:bg-green-800/50 dark:border-green-700/60",
  },

  {
    name: "Yellow",
    value:
      "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-700/50 dark:border-yellow-600/60 dark:text-yellow-200", // Used 700/600 for dark yellow
    displayClass:
      "bg-yellow-100 border-yellow-200 dark:bg-yellow-700/50 dark:border-yellow-600/60",
  },

  {
    name: "Purple",
    value:
      "bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-800/50 dark:border-purple-700/60 dark:text-purple-200",
    displayClass:
      "bg-purple-100 border-purple-200 dark:bg-purple-800/50 dark:border-purple-700/60",
  },

  {
    name: "Pink",
    value:
      "bg-pink-100 border-pink-200 text-pink-800 dark:bg-pink-800/50 dark:border-pink-700/60 dark:text-pink-200",
    displayClass:
      "bg-pink-100 border-pink-200 dark:bg-pink-800/50 dark:border-pink-700/60",
  },

  {
    name: "Indigo",
    value:
      "bg-indigo-100 border-indigo-200 text-indigo-800 dark:bg-indigo-800/50 dark:border-indigo-700/60 dark:text-indigo-200",
    displayClass:
      "bg-indigo-100 border-indigo-200 dark:bg-indigo-800/50 dark:border-indigo-700/60",
  },
];

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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [genGrammar, setGenGrammar] = useState(true);
  const [genExamples, setGenExamples] = useState(true);
  const [genDifficulty, setGenDifficulty] = useState(true);
  const [genSynonyms, setGenSynonyms] = useState(true);
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [genMnemonic, setGenMnemonic] = useState(false);
  const [genPhrases, setGenPhrases] = useState(false);
  const [genEtymology, setGenEtymology] = useState(false);

  useEffect(() => {
    if (
      userLanguages.length > 0 &&
      (!selectedLanguage ||
        !userLanguages.some((l) => l.id === selectedLanguage))
    ) {
      setSelectedLanguage(userLanguages[0].id);
    } else if (userLanguages.length === 0) {
      setSelectedLanguage("");
    }
  }, [userLanguages, selectedLanguage]);

  const resetForm = () => {
    setWord("");
    setNotes("");
    setSelectedColor(null);
    setGenMnemonic(false);
    setGenPhrases(false);
    setGenEtymology(false);
    setGenGrammar(true);
    setGenExamples(true);
    setGenDifficulty(true);
    setGenSynonyms(true);
    setCefrLevel("B1");
    if (userLanguages.length > 0) {
      setSelectedLanguage(userLanguages[0].id);
    } else {
      setSelectedLanguage("");
    }
  };

  const handleAddWord = async () => {
    if (!user || !settings) {
      toast.error("You must be logged in.");
      return;
    }
    if (!selectedLanguage || !word) {
      toast.error("Please fill in language and word.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Generating AI details for the word...");

    let aiDataResponse: {
      success: boolean;
      translation: string;
      aiData: any;
    } | null = null;
    let apiError: Error | null = null;
    let dbErrorOccurred = false;
    let insertedWordId: string | number | null = null;

    try {
      const aiOptions = {
        translation: true,
        gender_verb_forms: true,
        grammar: genGrammar,
        examples: genExamples ? 3 : 0,
        level: cefrLevel,
        difficulty: genDifficulty,
        synonyms: genSynonyms,
        mnemonic: genMnemonic,
        phrases: genPhrases,
        etymology: genEtymology,
      };

      const languageName =
        userLanguages.find((l) => l.id === selectedLanguage)?.language_name ||
        "Selected Language";

      const res = await fetch("/api/generate-word-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordText: word,
          languageName: languageName,
          nativeLanguage: settings.native_language,
          options: aiOptions,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        let errorMsg = `HTTP ${res.status} ${res.statusText}`;
        let errJson: any = null;
        if (contentType.includes("application/json")) {
          try {
            errJson = await res.json();
            errorMsg = errJson.error || errorMsg;
          } catch {}

          if (res.status === 422 && errJson?.code === "WORD_NOT_RECOGNIZED") {
            toast.warning(
              `"${word}" might not be a valid word in ${languageName}, or AI couldn't process it. Word not added.`,
              { id: toastId, duration: 6000 }
            );
            setLoading(false);
            return;
          }
        } else {
          const text = await res.text();
          errorMsg += `: ${text.slice(0, 200)}`;
        }
        apiError = new Error(`Failed to generate AI details: ${errorMsg}`);
      } else {
        if (contentType.includes("application/json")) {
          aiDataResponse = await res.json();
          if (!aiDataResponse?.success || !aiDataResponse.translation) {
            apiError = new Error(
              "API returned success but data was incomplete."
            );
          }
        } else {
          const text = await res.text();
          apiError = new Error(
            `API returned unexpected success format: ${text.slice(0, 100)}`
          );
        }
      }

      if (apiError) {
        throw apiError;
      }

      if (aiDataResponse?.success) {
        toast.message("AI details generated, saving word...", { id: toastId });
        dbErrorOccurred = true;

        const { data: newWordData, error: insertError } = await supabase
          .from("user_words")
          .insert({
            user_id: user.id,
            language_id: selectedLanguage,
            word,
            translation: aiDataResponse.translation,
            ai_data: aiDataResponse.aiData,
            notes: notes || null,
            color: selectedColor,
          })
          .select("id")
          .single();

        if (insertError || !newWordData?.id) {
          if ((insertError as any)?.code === "23505") {
            throw new Error(
              `Failed to save: You've already added "${word}" for this language.`
            );
          }
          throw new Error(
            `Failed to save word: ${insertError?.message || "Unknown DB error"}`
          );
        }
        insertedWordId = newWordData.id;

        toast.success("Word added & AI details saved!", { id: toastId });
        resetForm();
        if (insertedWordId !== null) {
          onWordAdded?.(insertedWordId);
        }
        setTimeout(() => setOpen(false), 1500);
      } else {
        throw new Error("AI processing failed silently.");
      }
    } catch (e: any) {
      console.error("Error in handleAddWord:", e);
      const messagePrefix = dbErrorOccurred
        ? "Failed to save word after getting AI data:"
        : "Error processing word:";
      toast.error(
        `${messagePrefix} ${e.message || "An unexpected error occurred."}`,
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
      setLoading(false);
    }
  };

  const aiOptionsSelected =
    genGrammar ||
    genExamples ||
    genDifficulty ||
    genSynonyms ||
    genMnemonic ||
    genPhrases ||
    genEtymology;

  const renderToggle = (
    label: string,
    pressed: boolean,
    onPressedChange: (pressed: boolean) => void
  ) => (
    <Toggle
      size="sm"
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={loading}
      aria-label={`Toggle ${label}`}
    >
      <Check
        className={cn(
          "absolute left-2 size-4 transition-all duration-200",
          pressed
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-75 -translate-x-1"
        )}
      />
      {label}
    </Toggle>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={loading || userLanguages.length === 0}
          title={
            userLanguages.length === 0 ? "Add a language first" : "Add new word"
          }
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Add Word
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
          <div className="space-y-2">
            <Label>Color Tag (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  disabled={loading}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    color.value ?? "bg-transparent border-input",
                    color.value,
                    selectedColor === color.value
                      ? "ring-2 ring-ring ring-offset-2 border-primary"
                      : "border-transparent hover:border-muted-foreground/50"
                  )}
                  aria-label={`Select color ${color.name}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              AI Enhancements
            </h4>
            <p className="text-sm text-muted-foreground">
              Translation, Gender/Verb Forms are always included (if
              applicable). Select optional details:
            </p>
            <div className="flex flex-wrap gap-2">
              {renderToggle("Grammar", genGrammar, setGenGrammar)}
              {renderToggle("Examples", genExamples, setGenExamples)}
              {renderToggle("Difficulty", genDifficulty, setGenDifficulty)}
              {renderToggle("Synonyms", genSynonyms, setGenSynonyms)}
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t mt-3">
              <Label className="w-full text-xs text-muted-foreground mb-1">
                More Options:
              </Label>
              {renderToggle("Mnemonic", genMnemonic, setGenMnemonic)}
              {renderToggle("Phrases", genPhrases, setGenPhrases)}
              {renderToggle("Etymology", genEtymology, setGenEtymology)}
            </div>
            {aiOptionsSelected && (
              <div className="space-y-2 pt-3 border-t">
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
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : "Add Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
