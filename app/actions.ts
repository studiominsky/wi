"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateSortPreference(newSortPreference: string) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Update sort preference: User not found");
    return { error: "User not authenticated" };
  }

  const validPreferences = ["date_desc", "date_asc", "alpha_asc", "alpha_desc"];
  if (!validPreferences.includes(newSortPreference)) {
    console.error(
      "Update sort preference: Invalid preference value",
      newSortPreference
    );
    return { error: "Invalid sort preference value" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      word_sort_preference: newSortPreference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating sort preference:", error);
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/inventory");
  return { success: true };
}
