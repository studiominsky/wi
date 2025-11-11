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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Image as ImageIcon,
  Trash2,
  Pencil,
  MoreHorizontal,
  Edit,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateWordEntry, deleteWordEntry } from "@/app/actions";
import { useRouter } from "next/navigation";

type WordEntry = {
  id: string | number;
  word: string;
  translation: string;
  notes: string | null;
  color: string | null;
  image_url: string | null;
};

type EditWordDialogProps = {
  entry: WordEntry;
  isNativePhrase: boolean;
  onEntryUpdated: (id: string | number) => void;
  triggerAsChild?: React.ReactNode;
};

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

export function EditWordDialog({
  entry,
  isNativePhrase,
  onEntryUpdated,
  triggerAsChild,
}: EditWordDialogProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [word, setWord] = useState(entry.word);
  const [translation, setTranslation] = useState(entry.translation);
  const [notes, setNotes] = useState(entry.notes || "");
  const [selectedColor, setSelectedColor] = useState(entry.color);
  const [loading, setLoading] = useState(false);

  const [currentImageUrl, setCurrentImageUrl] = useState(entry.image_url);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setWord(entry.word);
    setTranslation(entry.translation);
    setNotes(entry.notes || "");
    setSelectedColor(entry.color);
    setCurrentImageUrl(entry.image_url);
    setImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
  }, [entry]);

  const handleRemoveImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setCurrentImageUrl(null);
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
        setCurrentImageUrl(null);
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

  const handleUpdate = async () => {
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (!word.trim() || !translation.trim()) {
      toast.error("Word and Translation fields cannot be empty.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Updating entry...");

    let newImageUrl = currentImageUrl;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}_${word}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("word_images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Image upload failed: ${uploadError.message}`, {
          id: toastId,
          duration: 6000,
        });
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("word_images")
        .getPublicUrl(uploadData.path);

      newImageUrl = publicUrlData.publicUrl;
    }

    if (entry.image_url && !imageFile && !currentImageUrl) {
    }

    const table = isNativePhrase ? "user_translations" : "user_words";

    const result = await updateWordEntry({
      id: entry.id,
      table: table,
      word: word,
      translation: translation,
      notes: notes,
      color: selectedColor,
      image_url: newImageUrl,
    });

    if (result.error) {
      toast.error(`Update failed: ${result.error}`, { id: toastId });
    } else {
      toast.success("Entry updated successfully!", { id: toastId });
      onEntryUpdated(entry.id);
      setTimeout(() => setOpen(false), 1500);
    }

    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setWord(entry.word);
      setTranslation(entry.translation);
      setNotes(entry.notes || "");
      setSelectedColor(entry.color);
      setCurrentImageUrl(entry.image_url);
      setImageFile(null);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
      setLoading(false);
    }
  };

  const wordInputLabel = isNativePhrase
    ? "Native Phrase (Editable)"
    : "Word (Editable)";
  const translationInputLabel = isNativePhrase
    ? "German Translation (Editable)"
    : "Translation (Editable)";

  const hasUnsavedChanges =
    word.trim() !== entry.word.trim() ||
    translation.trim() !== entry.translation.trim() ||
    notes.trim() !== (entry.notes || "").trim() ||
    selectedColor !== entry.color ||
    currentImageUrl !== entry.image_url ||
    imageFile !== null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerAsChild ? (
          triggerAsChild
        ) : (
          <Button size="sm" variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Entry: {entry.word}</DialogTitle>
          <DialogDescription>
            Modify the base word, translation, notes, color, or image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 px-1 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <Label htmlFor="word-text">{wordInputLabel}</Label>
            <Input
              id="word-text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="translation-text">{translationInputLabel}</Label>
            <Input
              id="translation-text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
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
            <Label>Image (Optional)</Label>
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
                id="word-image-edit"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                disabled={loading}
              />
              <label
                htmlFor="word-image-edit"
                className="flex flex-col items-center gap-1 cursor-pointer p-4 h-full w-full"
              >
                {currentImageUrl || imagePreviewUrl ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-primary">
                      Image selected/uploaded
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                      disabled={loading}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <p>
                      Drag & drop or{" "}
                      <span className="text-primary hover:underline">
                        browse
                      </span>
                    </p>
                  </>
                )}
              </label>
            </div>
            {(currentImageUrl || imagePreviewUrl) && (
              <div className="mt-2 flex justify-center">
                <img
                  src={imagePreviewUrl || currentImageUrl || ""}
                  alt="Preview"
                  className="max-h-24 w-auto rounded-md object-cover border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://placehold.co/100x100/e0e0e0/000?text=Preview";
                    target.onerror = null;
                  }}
                />
              </div>
            )}
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={loading || !hasUnsavedChanges}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="mr-2 h-4 w-4" />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EntryActionMenu({
  entry,
  isNativePhrase,
}: {
  entry: WordEntry;
  isNativePhrase: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEntryUpdated = () => {
    setMenuOpen(false);
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (loading) return;

    setLoading(true);
    setDeleteConfirmOpen(false);
    setMenuOpen(false);
    const toastId = toast.loading("Deleting entry...");

    const table = isNativePhrase ? "user_translations" : "user_words";

    const result = await deleteWordEntry({
      id: entry.id,
      table: table,
      word: entry.word,
    });

    if (result.error) {
      toast.error(`Deletion failed: ${result.error}`, { id: toastId });
    } else {
      toast.success("Entry deleted successfully!", { id: toastId });
      router.push(isNativePhrase ? "/translations" : "/inventory");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${entry.word}`}
            className="size-8 shrink-0"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MoreHorizontal className="size-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-40 p-1 flex flex-col space-y-1"
          align="end"
        >
          <EditWordDialog
            entry={entry}
            isNativePhrase={isNativePhrase}
            onEntryUpdated={handleEntryUpdated}
            triggerAsChild={
              <Button
                variant="ghost"
                className="w-full justify-start h-8 text-sm"
                size="sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            }
          />
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive h-8 text-sm"
              size="sm"
              onClick={() => {
                setMenuOpen(false);
                setDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogTrigger>
        </PopoverContent>
      </Popover>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the entry for "
            <span className="font-semibold">{entry.word}</span>"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between flex-row">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
