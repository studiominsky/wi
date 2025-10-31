// studiominsky/wi/wi-6490d5e232baaf957c0eb90cafd653377333ef59/app/inventory/page.tsx
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InventoryBasePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/inventory");
  }

  // Fetch languages to find the first ISO code for redirection
  const { data: userLanguages } = await supabase
    .from("user_languages")
    .select("iso_code")
    .eq("user_id", user.id)
    .not("iso_code", "is", null)
    .order("language_name", { ascending: true });

  const allUserLanguages = userLanguages || [];
  const firstLanguage = allUserLanguages.find((l) => l.iso_code);

  if (firstLanguage) {
    // Redirect to the first valid language's dynamic route (e.g., /inventory/de)
    redirect(`/inventory/${firstLanguage.iso_code}`);
  } else {
    // If no languages exist or none have an iso_code,
    // redirect to a safe path ('start') that the dynamic page can handle
    // to display the "Add a language" message.
    redirect("/inventory/start");
  }
}
