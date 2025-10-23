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
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type UserLanguage = {
  id: string;
  language_name: string;
};

type AddWordDialogProps = {
  userLanguages: UserLanguage[];
  onWordAdded?: () => void;
};

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

  useEffect(() => {
    if (userLanguages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(userLanguages[0].id);
    }
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
    setMessage("Adding...");

    const { error } = await supabase.from("user_words").insert({
      user_id: user.id,
      language_id: selectedLanguage,
      word: word,
      translation: translation,
      notes: notes || null,
      ai_data: null,
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setMessage(`Error: You've already added "${word}" for this language.`);
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage("Success! Word added.");
      setWord("");
      setTranslation("");
      setNotes("");
      onWordAdded?.();
      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1000);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setMessage("");
      setWord("");
      setTranslation("");
      setNotes("");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Word
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
          <DialogDescription>
            Enter the word, its translation, and any notes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="word-language" className="text-right">
              Language
            </Label>
            <select
              id="word-language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || userLanguages.length === 0}
            >
              {userLanguages.length === 0 ? (
                <option value="" disabled>
                  Add a language first
                </option>
              ) : (
                userLanguages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.language_name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="word-text" className="text-right">
              Word
            </Label>
            <Input
              id="word-text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Olá"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="word-translation" className="text-right">
              Translation
            </Label>
            <Input
              id="word-translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Hello"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="word-notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="word-notes"
              placeholder="e.g., Example sentence, grammar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3 min-h-[80px]"
              disabled={loading}
            />
          </div>
        </div>
        {message && <p className="text-center text-sm px-6 pb-2">{message}</p>}
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
              !word ||
              !translation
            }
          >
            {loading ? "Adding..." : "Add Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
