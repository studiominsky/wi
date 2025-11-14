"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DotsThreeIcon,
  CircleNotchIcon,
  TrashIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
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
import { Button } from "@/components/ui/button";
import { EditTagDialog } from "@/components/edit-tag-dialog";
import { deleteTagMetadata } from "@/app/actions";

interface TagMetadata {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
}

export function TagActionMenu({
  tag,
  onTagUpdated,
}: {
  tag: TagMetadata;
  onTagUpdated: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTagUpdated = () => {
    onTagUpdated();
  };

  const handleConfirmDelete = async () => {
    if (loading) return;
    setLoading(true);
    setDeleteConfirmOpen(false);
    setMenuOpen(false);

    const toastId = toast.loading(`Deleting tag "${tag.tag_name}" metadata...`);

    const result = await deleteTagMetadata({
      tagName: tag.tag_name,
    });

    if (result.error) {
      toast.error(`Deletion failed: ${result.error}`, { id: toastId });
    } else {
      toast.success(`Tag "${tag.tag_name}" metadata deleted successfully!`, {
        id: toastId,
      });
      // CRITICAL CHANGE: Rely on parent (onTagUpdated) to handle navigation/refresh.
      onTagUpdated();
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
            aria-label={`Actions for tag ${tag.tag_name}`}
            className="size-8 shrink-0 opacity-50 hover:opacity-100"
            disabled={loading}
          >
            {loading ? (
              <CircleNotchIcon className="size-4 animate-spin" />
            ) : (
              <DotsThreeIcon className="size-6" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-40 p-1 flex flex-col space-y-1"
          align="end"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <EditTagDialog
            tag={tag}
            onTagUpdated={handleTagUpdated}
            triggerAsChild={
              <Button
                variant="ghost"
                className="w-full justify-start h-8 text-sm"
                size="sm"
              >
                <PencilSimpleIcon className="mr-2 h-4 w-4" />
                Edit Tag
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
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Tag
            </Button>
          </DialogTrigger>
        </PopoverContent>
      </Popover>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Tag Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the **custom metadata** (icon/color)
            for tag "<span className="font-semibold">{tag.tag_name}</span>"? The
            tag will remain on your entries.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between flex-row">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={loading}
          >
            Delete Metadata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
