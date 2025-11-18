// studiominsky/wi/wi-f5dfbd236c9a97521343ab4512a1acaf15a3da07/app/settings/page.tsx
import { SettingsForm } from "@/components/settings-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/inventory/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("native_language, theme, username")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="max-w-8xl mx-auto space-y-3">
        <h1 className="text-3xl font-grotesk md:text-4xl">Settings</h1>
        <p className="text-sans text-foreground/60">
          Manage your account details, app preferences, and default language
          settings.
        </p>
      </div>
      <div className="max-w-8xl mx-auto">
        <SettingsForm
          currentLanguage={profile?.native_language || "English"}
          currentTheme={profile?.theme || "system"}
          initialUsername={profile?.username || ""}
        />
      </div>
    </div>
  );
}
