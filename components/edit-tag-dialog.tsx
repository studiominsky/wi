"use client";

import { useState, useMemo } from "react";
import { saveTagMetadata } from "@/app/actions";
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
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  CheckIcon,
  CircleNotchIcon,
  TagIcon,
  CaretUpDownIcon,
  IconProps,
  Icon,
} from "@phosphor-icons/react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TagMetadata {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
}

const colorOptions = [
  { name: "Default", value: null, displayClass: "bg-transparent border-input" },
  { name: "Teal", value: "tag-color-teal", displayClass: "tag-color-teal" },
  { name: "Blue", value: "tag-color-blue", displayClass: "tag-color-blue" },
  {
    name: "Orange",
    value: "tag-color-orange",
    displayClass: "tag-color-orange",
  },
  { name: "Red", value: "tag-color-red", displayClass: "tag-color-red" },
  {
    name: "Purple",
    value: "tag-color-purple",
    displayClass: "tag-color-purple",
  },
];

const availableIcons = Object.keys(PhosphorIcons)
  .filter((name) => name.endsWith("Icon"))
  .sort();

const iconComponentMap: Record<string, Icon> = PhosphorIcons as any;

export function EditTagDialog({
  tag,
  triggerAsChild,
}: {
  tag: TagMetadata;
  triggerAsChild: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIconName, setSelectedIconName] = useState(tag.icon_name);
  const [selectedColor, setSelectedColor] = useState(tag.color_class);

  const [popoverOpen, setPopoverOpen] = useState(false);

  const SelectedIcon = iconComponentMap[selectedIconName] || TagIcon;

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading(`Saving tag "${tag.tag_name}"...`);

    const result = await saveTagMetadata({
      tagName: tag.tag_name,
      iconName: selectedIconName,
      colorClass: selectedColor,
    });

    if (result.error) {
      toast.error(`Save failed: ${result.error}`, { id: toastId });
    } else {
      toast.success("Tag metadata updated!", { id: toastId });
      setTimeout(() => setOpen(false), 100);
    }

    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedIconName(tag.icon_name);
      setSelectedColor(tag.color_class);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerAsChild}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tag: {tag.tag_name}</DialogTitle>
          <DialogDescription>
            Customize the icon and color for this tag.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 px-1 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <Label>Icon</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-label="Select icon"
                  aria-expanded={popoverOpen}
                  className="h-9 w-full justify-between truncate"
                  disabled={loading}
                >
                  <div className="flex items-center gap-2 truncate">
                    <SelectedIcon className="size-4 shrink-0" />
                    <span className="truncate">
                      {selectedIconName.replace("Icon", "")}
                    </span>
                  </div>
                  <CaretUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[280px] h-[300px]" align="start">
                <Command>
                  <CommandInput placeholder="Search icons..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No icons found.</CommandEmpty>
                    <CommandGroup>
                      {availableIcons.map((iconName) => {
                        const IconComponent =
                          iconComponentMap[iconName] || TagIcon;
                        return (
                          <CommandItem
                            key={iconName}
                            value={iconName.replace("Icon", "")}
                            onSelect={() => {
                              setSelectedIconName(iconName);
                              setPopoverOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                iconName === selectedIconName
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-2">
                              <IconComponent className="size-4" />
                              {iconName.replace("Icon", "")}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                    "cursor-pointer h-8 w-8 rounded-full border-2 transition-all",
                    color.value ?? "bg-transparent border-input",
                    color.value,
                    selectedColor === color.value
                      ? "ring-2 ring-ring ring-offset-2 border-primary"
                      : color.value === null
                      ? "border-input hover:border-muted-foreground/50"
                      : "border-transparent hover:border-muted-foreground/50"
                  )}
                  aria-label={`Select color ${color.name}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? (
              <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
