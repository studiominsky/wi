"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Laptop, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

const majorLanguages = [
  "Albanian",
  "Arabic",
  "Armenian",
  "Basque",
  "Belarusian",
  "Bosnian",
  "Bulgarian",
  "Catalan",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Faroese",
  "Finnish",
  "French",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Irish",
  "Italian",
  "Japanese",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Maltese",
  "Moldovan",
  "Montenegrin",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Scottish Gaelic",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swedish",
  "Turkish",
  "Ukrainian",
  "Welsh",
];

type SettingsFormProps = {
  currentLanguage: string;
  currentTheme: string;
};

function LanguageCombobox({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const display = value || "Select language";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Select native language"
          aria-expanded={open}
          className="h-9 min-w-[14rem] justify-between"
          disabled={!!disabled}
        >
          <span className="truncate">{display}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px]" align="start">
        <Command>
          <CommandInput placeholder="Search languages..." className="h-9" />
          <CommandList>
            <CommandEmpty>No languages found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={(val) => {
                    onChange(val);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      opt === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function SettingsForm({
  currentLanguage,
  currentTheme,
}: SettingsFormProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [nativeLanguage, setNativeLanguage] = useState(currentLanguage);
  const [themePreferenceToSave, setThemePreferenceToSave] =
    useState(currentTheme);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const languageOptions = (() => {
    const set = new Set(majorLanguages);
    if (currentLanguage && !set.has(currentLanguage)) set.add(currentLanguage);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  })();

  useEffect(() => {
    setMounted(true);
    if (theme) setThemePreferenceToSave(theme);
  }, [theme]);

  const handleThemeChange = (newThemePreference: string) => {
    setThemePreferenceToSave(newThemePreference);
    setTheme(newThemePreference);
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        native_language: nativeLanguage,
        theme: themePreferenceToSave,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      if (error.message.includes("schema cache")) {
        setMessage(
          "Error: Database schema might be out of sync. Please try restarting the application or contact support if the issue persists."
        );
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage("Settings saved successfully!");
    }
    setLoading(false);
  };

  if (!mounted) {
    return <div className="space-y-8 animate-pulse" />;
  }

  const isLightActive = theme === "light";
  const isDarkActive = theme === "dark";
  const isSystemActive = theme === "system";

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Appearance</h2>
        <Label>Theme</Label>
        <div className="flex gap-2">
          <Button
            variant={isLightActive ? "default" : "outline"}
            size="icon"
            onClick={() => handleThemeChange("light")}
            aria-pressed={isLightActive}
          >
            <Sun className="size-4" />
          </Button>
          <Button
            variant={isDarkActive ? "default" : "outline"}
            size="icon"
            onClick={() => handleThemeChange("dark")}
            aria-pressed={isDarkActive}
          >
            <Moon className="size-4" />
          </Button>
          <Button
            variant={isSystemActive ? "default" : "outline"}
            size="icon"
            onClick={() => handleThemeChange("system")}
            aria-pressed={isSystemActive}
          >
            <Laptop className="size-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Currently active: {resolvedTheme}
        </p>
      </div>

      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Language</h2>
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="native-language">Native Language</Label>
          <LanguageCombobox
            value={nativeLanguage}
            onChange={setNativeLanguage}
            options={languageOptions}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            AI translations will be provided in this language.
          </p>
        </div>
      </div>

      <div className="border-t pt-6 flex flex-col items-start gap-4">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}
