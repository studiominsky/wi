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
    .select("native_language, theme")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto max-w-xl p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <SettingsForm
        currentLanguage={profile?.native_language || "English"}
        currentTheme={profile?.theme || "system"}
      />
    </div>
  );
}
