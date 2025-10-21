"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddWordPage() {
  const [name, setName] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [message, setMessage] = useState("");

  const handleAddLanguage = async () => {
    setMessage("Adding...");
    const supabase = createClient();

    const { error } = await supabase.from("languages").insert({
      name: name,
      iso_code: isoCode,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Success! Language added.");
      setName("");
      setIsoCode("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Add a New Language</h1>

        <div className="space-y-2">
          <Label htmlFor="name">Language Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Portuguese"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isoCode">ISO Code (2 letters)</Label>
          <Input
            id="isoCode"
            type="text"
            placeholder="e.g., pt"
            maxLength={2}
            value={isoCode}
            onChange={(e) => setIsoCode(e.target.value)}
          />
        </div>

        <Button onClick={handleAddLanguage} className="w-full">
          Add Language
        </Button>

        {message && <p className="text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}
