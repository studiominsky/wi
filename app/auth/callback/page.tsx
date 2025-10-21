"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

type Language = {
  id: string;
  name: string;
  iso_code: string;
};

export default function AddWordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      const { data, error } = await supabase.from("languages").select("*");
      if (data) {
        setLanguages(data);
        if (data.length > 0) {
          setSelectedLanguage(data[0].id);
        }
      }
      setLoading(false);
    };
    fetchLanguages();
  }, [supabase]);

  const handleAddWord = async () => {
    setMessage("Adding...");
    if (!selectedLanguage || !word || !translation) {
      setMessage("Please fill in language, word, and translation.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You must be logged in to add a word.");
      return;
    }

    let detailsJson = null;
    if (details) {
      try {
        detailsJson = JSON.parse(details);
      } catch (e) {
        setMessage("Error: Details must be valid JSON.");
        return;
      }
    }

    const { error } = await supabase.from("user_words").insert({
      word: word,
      translation: translation,
      details: detailsJson,
      user_id: user.id,
      language_id: selectedLanguage,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Success! Word added.");
      setWord("");
      setTranslation("");
      setDetails("");
      router.push(`/dashboard?lang=${selectedLanguage}`);
      router.refresh();
    }
  };

  if (loading) {
    return <div className="p-8">Loading languages...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Add a New Word</h1>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {languages.length === 0 ? (
              <option disabled>Please add a language first</option>
            ) : (
              languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="word">Word</Label>
          <Input
            id="word"
            type="text"
            placeholder="e.g., Olá"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="translation">Translation</Label>
          <Input
            id="translation"
            type="text"
            placeholder="e.g., Hello"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Details (JSON)</Label>
          <Textarea
            id="details"
            placeholder='e.g., {"example": "Olá, mundo!"}'
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        <Button
          onClick={handleAddWord}
          className="w-full"
          disabled={languages.length === 0}
        >
          Add Word
        </Button>

        {message && <p className="text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}
