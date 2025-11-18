// studiominsky/wi/wi-f5dfbd236c9a97521343ab4512a1acaf15a3da07/components/settings-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  MoonIcon,
  SunIcon,
  MonitorIcon,
  CheckIcon,
  CaretUpDownIcon,
  TrashIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  initialUsername: string;
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
          <CaretUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                  <CheckIcon
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
  initialUsername,
}: SettingsFormProps) {
  const supabase = createClient();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Settings State
  const [nativeLanguage, setNativeLanguage] = useState(currentLanguage);
  const [themePreferenceToSave, setThemePreferenceToSave] =
    useState(currentTheme);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Profile State
  const [username, setUsername] = useState(initialUsername);
  const [currentUsername, setCurrentUsername] = useState(initialUsername);
  const [profileMessage, setProfileMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Delete Account State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const languageOptions = (() => {
    const set = new Set(majorLanguages);
    if (currentLanguage && !set.has(currentLanguage)) set.add(currentLanguage);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  })();

  useEffect(() => {
    setMounted(true);
    if (theme) setThemePreferenceToSave(theme);
  }, [theme]);

  // Initialize username states once mounted/if prop changes
  useEffect(() => {
    setUsername(initialUsername);
    setCurrentUsername(initialUsername);
  }, [initialUsername]);

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
      setMessage("Language and Theme saved successfully!");
    }
    setLoading(false);
  };

  const handleUpdateUsername = async () => {
    setLoadingProfile(true);
    setProfileMessage("");
    if (!user) return;
    if (!username || username.length < 3) {
      setProfileMessage("Username must be at least 3 characters.");
      setLoadingProfile(false);
      return;
    }
    if (username === currentUsername) {
      setProfileMessage("Username is unchanged.");
      setLoadingProfile(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: username, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        setProfileMessage("Error: Username already taken.");
      } else {
        setProfileMessage(`Error updating username: ${error.message}`);
      }
    } else {
      setProfileMessage("Username updated successfully!");
      setCurrentUsername(username);
    }
    setLoadingProfile(false);
  };

  const handleUpdatePassword = async () => {
    setLoadingProfile(true);
    setPasswordMessage("");
    if (!password) {
      setPasswordMessage("Please enter a new password.");
      setLoadingProfile(false);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      setLoadingProfile(false);
      return;
    }
    if (password.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      setLoadingProfile(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setPasswordMessage(`Error updating password: ${error.message}`);
    } else {
      setPasswordMessage("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    }
    setLoadingProfile(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoadingDelete(true);
    setLoading(true);

    // In a real application, this would call a secure Server Action or Supabase Edge function
    // to perform the user/data deletion which requires admin privileges.
    // Here we simulate success and rely on signOut/redirect.
    const { error: deletionError } = await supabase.rpc(
      "delete_current_user_and_data"
    ); // Assumed RLS function

    if (deletionError) {
      console.error("User deletion attempt failed:", deletionError);
      toast.error(
        `Account deletion failed: ${deletionError.message}. Please try again.`
      );
      setLoadingDelete(false);
      setLoading(false);
      return;
    }

    await signOut();
    toast.success("Account successfully deleted.", { duration: 3000 });
    router.push("/");

    setLoadingDelete(false);
    setLoading(false);
  };

  if (!mounted) {
    return <div className="space-y-8 animate-pulse" />;
  }

  const isLightActive = theme === "light";
  const isDarkActive = theme === "dark";
  const isSystemActive = theme === "system";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
      {/* COLUMN 1: ACCOUNT DETAILS */}
      <div className="space-y-8">
        {/* SECTION 1A: PROFILE / ACCOUNT INFO */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Account Details</h2>
          <div>
            <h3 className="text-lg font-medium mb-1">Email</h3>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* UPDATE USERNAME */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold">Update Username</h2>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username (min 3 chars)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loadingProfile}
            />
          </div>
          <Button
            onClick={handleUpdateUsername}
            disabled={
              loadingProfile ||
              username === currentUsername ||
              username.length < 3
            }
          >
            {loadingProfile ? "Updating..." : "Update Username"}
          </Button>
          {profileMessage && <p className="text-sm">{profileMessage}</p>}
        </div>

        {/* UPDATE PASSWORD */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold">Update Password</h2>
          <p className="text-sm text-muted-foreground">
            Set a password to enable email/password login.
          </p>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="New password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loadingProfile}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loadingProfile}
            />
          </div>
          <Button
            onClick={handleUpdatePassword}
            disabled={
              loadingProfile ||
              !password ||
              password !== confirmPassword ||
              password.length < 6
            }
          >
            {loadingProfile ? "Updating..." : "Update Password"}
          </Button>
          {passwordMessage && <p className="text-sm">{passwordMessage}</p>}
        </div>
      </div>

      {/* COLUMN 2: APP SETTINGS */}
      <div className="space-y-8">
        {/* SECTION 2A: APPEARANCE */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <Label>Theme</Label>
          <div className="flex gap-2">
            <Button
              variant={isLightActive ? "default" : "outline"}
              size="icon"
              onClick={() => handleThemeChange("light")}
              aria-pressed={isLightActive}
              disabled={loading}
            >
              <SunIcon className="size-4" />
            </Button>
            <Button
              variant={isDarkActive ? "default" : "outline"}
              size="icon"
              onClick={() => handleThemeChange("dark")}
              aria-pressed={isDarkActive}
              disabled={loading}
            >
              <MoonIcon className="size-4" />
            </Button>
            <Button
              variant={isSystemActive ? "default" : "outline"}
              size="icon"
              onClick={() => handleThemeChange("system")}
              aria-pressed={isSystemActive}
              disabled={loading}
            >
              <MonitorIcon className="size-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Currently active: {resolvedTheme}
          </p>
        </div>

        {/* SECTION 2B: LANGUAGE */}
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

        {/* SAVE BUTTON */}
        <div className="border-t pt-6 flex flex-col items-start gap-4">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Language & Theme"}
          </Button>
          {message && <p className="text-sm">{message}</p>}
        </div>

        {/* DELETE ACCOUNT SECTION (NEW) */}
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Delete Account</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data, including
            all words and translations. This action cannot be undone.
          </p>
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={loadingProfile || loadingDelete || loading}
              >
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Account Deletion</DialogTitle>
                <DialogDescription>
                  Are you absolutely sure you want to delete your account? All
                  your vocabulary data will be permanently lost.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-between flex-row">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loadingDelete}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loadingDelete}
                >
                  {loadingDelete ? (
                    <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrashIcon className="mr-2 h-4 w-4" />
                  )}
                  {loadingDelete ? "Deleting..." : "Confirm Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
