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

export async function updateItemsPerPagePreference(newItemsPerPage: number) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "User not authenticated" };
  }

  const validSizes = [10, 25, 50, 100];
  if (!validSizes.includes(newItemsPerPage)) {
    return { error: "Invalid items per page value" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      items_per_page: newItemsPerPage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/inventory");
  revalidatePath("/translations");
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
  tags,
}: {
  id: string | number;
  table: "user_words" | "user_translations";
  word: string;
  translation: string;
  notes: string | null;
  color: string | null;
  image_url: string | null;
  tags: string[] | null;
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
    tags,
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

export async function fetchUniqueTagsWithWords() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/tags");

  const wordQuery = supabase
    .from("user_words")
    .select("id, word, translation, tags, color, image_url, ai_data")
    .eq("user_id", user.id);

  const translationQuery = supabase
    .from("user_translations")
    .select("id, word, translation, tags, color, image_url, ai_data")
    .eq("user_id", user.id);

  const [wordResults, translationResults] = await Promise.all([
    wordQuery,
    translationQuery,
  ]);

  if (wordResults.error || translationResults.error) {
    console.error("Error fetching tagged entries:", {
      word: wordResults.error,
      translation: translationResults.error,
    });
    return null;
  }

  const allEntries = [
    ...wordResults.data.map((e) => ({
      ...e,
      isNativePhrase: false,
      wordDisplay: e.word,
    })),
    ...translationResults.data.map((e) => ({
      ...e,
      isNativePhrase: true,
      wordDisplay: e.word,
    })),
  ];

  const uniqueTags = new Set<string>();
  allEntries.forEach((entry) => {
    if (Array.isArray(entry.tags)) {
      entry.tags.forEach((tag) => uniqueTags.add(tag));
    }
  });

  const uniqueTagNames = Array.from(uniqueTags);

  const { data: tagMetadata, error: metaError } = await supabase
    .from("user_tags")
    .select("tag_name, icon_name, color_class")
    .in("tag_name", uniqueTagNames)
    .eq("user_id", user.id);

  const tagsData = uniqueTagNames.map((tagName) => {
    const metadata = tagMetadata?.find((m) => m.tag_name === tagName);
    const entries = allEntries.filter(
      (entry) => Array.isArray(entry.tags) && entry.tags.includes(tagName)
    );

    return {
      tag_name: tagName,
      icon_name: metadata?.icon_name || "Tag",
      color_class: metadata?.color_class || null,
      count: entries.length,
      entries: entries,
    };
  });

  return tagsData.sort((a, b) => b.count - a.count);
}

export async function deleteTagMetadata({ tagName }: { tagName: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: metaDeleteError } = await supabase
    .from("user_tags")
    .delete()
    .eq("user_id", user.id)
    .eq("tag_name", tagName);

  if (metaDeleteError) {
    return {
      error: `Database error deleting metadata: ${metaDeleteError.message}`,
    };
  }

  const removeTagFromTable = async (
    table: "user_words" | "user_translations"
  ) => {
    const { data, error } = await supabase
      .from(table)
      .select("id, tags")
      .contains("tags", [tagName])
      .eq("user_id", user.id);

    if (error || !data?.length) {
      if (error) {
        console.error(`Error fetching rows from ${table}:`, error);
      }
      return;
    }

    await Promise.all(
      data.map((row) => {
        const filteredTags = (row.tags || []).filter(
          (t: string) => t !== tagName
        );

        return supabase
          .from(table)
          .update({
            tags: filteredTags.length ? filteredTags : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id)
          .eq("user_id", user.id);
      })
    );
  };

  await Promise.all([
    removeTagFromTable("user_words"),
    removeTagFromTable("user_translations"),
  ]);

  revalidatePath("/inventory");
  revalidatePath("/translations");
  revalidatePath("/tags");

  return { success: true };
}

export async function saveTagMetadata({
  tagName,
  iconName,
  colorClass,
}: {
  tagName: string;
  iconName: string;
  colorClass: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "User not authenticated" };

  const { error } = await supabase
    .from("user_tags")
    .upsert(
      {
        user_id: user.id,
        tag_name: tagName,
        icon_name: iconName,
        color_class: colorClass,
      },
      { onConflict: "user_id, tag_name" }
    )
    .select();

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/tags");
  return { success: true };
}
