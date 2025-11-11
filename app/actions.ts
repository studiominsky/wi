"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function updateSortPreference(newSortPreference: string) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "User not authenticated" };
  }

  const validPreferences = ["date_desc", "date_asc", "alpha_asc", "alpha_desc"];
  if (!validPreferences.includes(newSortPreference)) {
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
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/inventory");
  return { success: true };
}

export async function updateWordEntry({
  id,
  table,
  word,
  translation,
  notes,
  color,
  image_url,
}: {
  id: string | number;
  table: "user_words" | "user_translations";
  word: string;
  translation: string;
  notes: string | null;
  color: string | null;
  image_url: string | null;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!word.trim() || !translation.trim()) {
    return { error: "Word and translation cannot be empty." };
  }

  const { data: currentData, error: fetchError } = await supabase
    .from(table)
    .select("id, word, translation, notes, color, image_url, ai_data")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !currentData) {
    return { error: `Could not find entry to update: ${fetchError?.message}` };
  }

  const updatePayload = {
    word: word.trim(),
    translation: translation.trim(),
    notes: notes?.trim() || null,
    color,
    image_url,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from(table)
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: `Database update failed: ${updateError.message}` };
  }

  const revalidatePathname =
    table === "user_words"
      ? `/inventory/${encodeURIComponent(word.trim())}`
      : `/translations/${id}`;

  revalidatePath(revalidatePathname);
  revalidatePath(table === "user_words" ? "/inventory" : "/translations");

  return { success: true };
}

export async function deleteWordEntry({
  id,
  table,
  word,
}: {
  id: string | number;
  table: "user_words" | "user_translations";
  word: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: `Database deletion failed: ${deleteError.message}` };
  }

  const revalidatePathname =
    table === "user_words"
      ? `/inventory/${encodeURIComponent(word)}`
      : `/translations/${id}`;

  revalidatePath(revalidatePathname);
  revalidatePath(table === "user_words" ? "/inventory" : "/translations");

  return { success: true };
}
