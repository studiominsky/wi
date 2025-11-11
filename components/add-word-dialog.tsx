"use client";

import { useState } from "react";
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
import {
  PlusCircle,
  Check,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type UserLanguage = { id: string; language_name: string };

type AddWordDialogProps = {
  userLanguages: UserLanguage[];
  currentLanguageId: string;
  onWordAdded?: (wordId: number | string) => void;
  isNativePhrase?: boolean;
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
      "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-700/50 dark:border-yellow-600/60 dark:text-yellow-200",
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
  currentLanguageId,
  onWordAdded,
  isNativePhrase = false,
}: AddWordDialogProps) {
  const supabase = createClient();
  const { user, settings } = useAuth();
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [genGrammar, setGenGrammar] = useState(true);
  const [genSynonyms, setGenSynonyms] = useState(true);
  const [genPhrases, setGenPhrases] = useState(true);
  const [genDetailedGrammarTables, setGenDetailedGrammarTables] =
    useState(true);
  const [examplesCount, setExamplesCount] = useState(3);
  const [cefrLevel, setCefrLevel] = useState("B1");

  const handleRemoveImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    const files =
      "dataTransfer" in e
        ? (e.dataTransfer.files as FileList)
        : (e.target.files as FileList);
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        handleRemoveImage();
        setImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        toast.error("Please select a valid image file.");
      }
    }
    if ("target" in e && e.target instanceof HTMLInputElement) {
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("ring-2", "ring-primary", "ring-offset-2");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("ring-2", "ring-primary", "ring-offset-2");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("ring-2", "ring-primary", "ring-offset-2");
    handleFileChange(e);
  };

  const resetForm = () => {
    setWord("");
    setNotes("");
    setSelectedColor(null);
    setExamplesCount(3);
    setGenPhrases(true);
    setGenGrammar(true);
    setGenSynonyms(true);
    setGenDetailedGrammarTables(true);
    setCefrLevel("B1");
    handleRemoveImage();
  };

  const handleAddWord = async () => {
    if (!user || !settings) {
      toast.error("You must be logged in.");
      return;
    }
    if (!currentLanguageId || !word) {
      toast.error(
        currentLanguageId
          ? "Please fill in the word field."
          : "Language not selected. Please navigate to a specific language inventory first."
      );
      return;
    }
    setLoading(true);

    let image_url: string | null = null;
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}_${word}.${fileExt}`;
      toast.loading("Uploading image...", { id: "image-upload" });
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("word_images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) {
        toast.error(`Image upload failed: ${uploadError.message}`, {
          id: "image-upload",
          duration: 6000,
        });
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("word_images")
        .getPublicUrl(uploadData.path);
      image_url = publicUrlData.publicUrl;
      toast.success("Image uploaded successfully!", {
        id: "image-upload",
        duration: 1500,
      });
    }

    const toastId = toast.loading(
      `Generating AI details for the ${
        isNativePhrase ? "translation" : "word"
      }...`
    );

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
        examples: examplesCount,
        level: cefrLevel,
        synonyms: genSynonyms,
        phrases: genPhrases,
        detailed_grammar_tables: genDetailedGrammarTables,
      };

      const languageName = "German";

      const payload = {
        wordText: word,
        languageName: languageName,
        nativeLanguage: settings.native_language,
        options: aiOptions,
        isNativePhrase: isNativePhrase,
      };

      const res = await fetch("/api/generate-word-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
              `"${word}" might not be a valid ${
                isNativePhrase ? "translation source" : "word"
              }, or AI couldn't process it. Entry not added.`,
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

      if (apiError) throw apiError;

      if (aiDataResponse?.success) {
        toast.message("AI details generated, saving word...", { id: toastId });
        dbErrorOccurred = true;

        const targetTable = isNativePhrase ? "user_translations" : "user_words";

        let aiDataToSave = aiDataResponse.aiData;
        if (isNativePhrase) delete aiDataToSave.isNativePhrase;

        const { data: newWordData, error: insertError } = await supabase
          .from(targetTable)
          .insert({
            user_id: user.id,
            language_id: currentLanguageId,
            word,
            translation: aiDataResponse.translation,
            ai_data: aiDataToSave,
            notes: notes || null,
            color: selectedColor,
            image_url: image_url,
          })
          .select("id")
          .single();

        if (insertError || !newWordData?.id) {
          if ((insertError as any)?.code === "23505") {
            throw new Error(
              `Failed to save: You've already added "${word}" for this language.`
            );
          }
        }
        insertedWordId = newWordData?.id ?? null;

        toast.success("Entry added & AI details saved!", { id: toastId });
        resetForm();
        if (insertedWordId !== null) onWordAdded?.(insertedWordId);
        setTimeout(() => setOpen(false), 1500);
      } else {
        throw new Error("AI processing failed silently.");
      }
    } catch (e: any) {
      const messagePrefix = dbErrorOccurred
        ? "Failed to save entry after getting AI data:"
        : "Error processing entry:";
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
    examplesCount > 0 ||
    genGrammar ||
    genSynonyms ||
    genPhrases ||
    genDetailedGrammarTables;

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

  const currentLangName =
    userLanguages.find((l) => l.id === currentLanguageId)?.language_name ||
    "Language";

  const canAddWord = !!currentLanguageId && !!word;

  const wordInputPlaceholder = isNativePhrase
    ? `e.g., I'm going running tomorrow morning`
    : `e.g., Haus in ${currentLangName}`;

  const adjustExamples = (delta: number) =>
    setExamplesCount((prev) => Math.max(0, Math.min(10, prev + delta)));

  const imageAdded = Boolean(imagePreviewUrl);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={loading || userLanguages.length === 0 || !currentLanguageId}
          title={
            userLanguages.length === 0
              ? "Add a language first"
              : !currentLanguageId
              ? "Select an inventory language first"
              : `Add new ${
                  isNativePhrase ? "translation" : "word"
                } to ${currentLangName}`
          }
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          {isNativePhrase ? "Add Translation" : "Add Word"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <DialogTitle>
                Add New {isNativePhrase ? "Native Translation" : "Word"}
              </DialogTitle>
              <DialogDescription>
                {isNativePhrase
                  ? `Enter a phrase in your native language (e.g., English). AI will provide the German translation and grammar.`
                  : `Enter a word in ${currentLangName}. AI will generate the translation and other details.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 py-2 px-1 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word-text">
                {isNativePhrase
                  ? `${settings?.native_language} Phrase`
                  : `${currentLangName} Word`}
              </Label>
              <Input
                id="word-text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder={wordInputPlaceholder}
                disabled={loading || !currentLanguageId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="word-notes">Notes</Label>
              <Textarea
                id="word-notes"
                placeholder="e.g., Personal reminder..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Image</Label>
              </div>

              {!imagePreviewUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "flex h-24 w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-input bg-transparent text-sm text-muted-foreground transition-colors hover:border-primary/50",
                    loading && "pointer-events-none opacity-50"
                  )}
                >
                  <input
                    type="file"
                    id="word-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                    disabled={loading}
                  />
                  <label
                    htmlFor="word-image"
                    className="flex flex-col items-center gap-1 cursor-pointer p-4 h-full w-full"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <p>
                      Drag & drop or{" "}
                      <span className="text-primary hover:underline">
                        browse
                      </span>
                    </p>
                  </label>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="h-16 w-16 rounded-md object-cover border"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Preview</span>
                      <span className="text-xs text-muted-foreground">
                        Ready to upload
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Color Tag</Label>
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
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-card">
            <h4 className="font-medium text-sm text-muted-foreground">
              AI Generated Details
            </h4>
            <p className="text-xs text-muted-foreground">
              AI can make mistakes. Review generated details after adding the
              word.
            </p>
            <div className="flex flex-wrap gap-2">
              {renderToggle("Grammar", genGrammar, setGenGrammar)}
              {renderToggle("Synonyms", genSynonyms, setGenSynonyms)}
              {renderToggle("Phrases/Idioms", genPhrases, setGenPhrases)}
              {!isNativePhrase &&
                renderToggle(
                  "Detailed Grammar Tables",
                  genDetailedGrammarTables,
                  setGenDetailedGrammarTables
                )}
            </div>

            <div className="space-y-3 pt-3 border-t">
              <Label id="examples-count-label">Number of Examples</Label>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustExamples(-1)}
                  disabled={loading || examplesCount <= 0}
                  aria-label="Decrease examples"
                  aria-describedby="examples-count-label"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold tracking-tight">
                    {examplesCount}
                  </div>
                  <div className="text-muted-foreground text-[0.70rem] uppercase">
                    Examples
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustExamples(1)}
                  disabled={loading || examplesCount >= 10}
                  aria-label="Increase examples"
                  aria-describedby="examples-count-label"
                >
                  <Plus className="h-4 w-4" />
                </Button>
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
                    <SelectTrigger id="cefr-level" className="w-full">
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
            disabled={loading || !canAddWord}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? "Processing..."
              : isNativePhrase
              ? "Add Translation"
              : "Add Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
