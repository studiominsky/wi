"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Remove Input import if no longer needed elsewhere
// import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Moon, Sun, Laptop } from "lucide-react";

// Define a list of common languages
// Define a more comprehensive list of languages, including European ones
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

  useEffect(() => {
    setMounted(true);
    if (theme) {
      setThemePreferenceToSave(theme);
    }
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
        native_language: nativeLanguage, // Save selected language
        theme: themePreferenceToSave,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      // Check specifically for the schema cache error
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
    return (
      <div className="space-y-8 animate-pulse">
        {/* ... loading skeleton ... */}
      </div>
    );
  }

  const isLightActive = theme === "light";
  const isDarkActive = theme === "dark";
  const isSystemActive = theme === "system";

  return (
    <div className="space-y-8">
      {/* --- Appearance Section (No changes) --- */}
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

      {/* --- Language Section (Changed to Select) --- */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Language</h2>
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="native-language">Native Language</Label>
          <Select
            value={nativeLanguage}
            onValueChange={setNativeLanguage} // Directly update state
            disabled={loading}
          >
            <SelectTrigger id="native-language">
              <SelectValue placeholder="Select your native language" />
            </SelectTrigger>
            <SelectContent>
              {majorLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
              {/* Optional: Add an 'Other' option or allow custom input elsewhere */}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            AI translations will be provided in this language.
          </p>
        </div>
      </div>

      {/* --- Save Button Section (No changes) --- */}
      <div className="border-t pt-6 flex flex-col items-start gap-4">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}
