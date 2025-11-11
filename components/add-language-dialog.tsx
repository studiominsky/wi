"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PlusCircleIcon } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function AddLanguageDialog() {
  const supabase = createClient();
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddLanguage = async () => {
    setMessage("");
    if (!user) {
      setMessage("Error: You must be logged in.");
      return;
    }
    if (!name) {
      setMessage("Error: Language name cannot be empty.");
      return;
    }

    setLoading(true);
    setMessage("Adding...");

    const { error } = await supabase.from("user_languages").insert({
      user_id: user.id,
      language_name: name,
      iso_code: isoCode ? isoCode.toLowerCase().trim() : null,
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setMessage(`Error: You've already added "${name}".`);
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage("Success! Language added. Redirecting...");
      setName("");
      setIsoCode("");

      router.push(`/inventory`);

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
      setName("");
      setIsoCode("");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Language
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Language</DialogTitle>
          <DialogDescription>
            Add a language you want to start tracking words for.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lang-name" className="text-right">
              Name
            </Label>
            <Input
              id="lang-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Portuguese"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="iso-code" className="text-right">
              ISO Code
            </Label>
            <Input
              id="iso-code"
              value={isoCode}
              onChange={(e) => setIsoCode(e.target.value)}
              className="col-span-3"
              placeholder="e.g., pt (Optional for hub card link)"
              maxLength={10}
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
            onClick={handleAddLanguage}
            disabled={loading || !name}
          >
            {loading ? "Adding..." : "Add Language"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
