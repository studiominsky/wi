import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TagsPageContent from "@/components/tags-page-content";
import { fetchUniqueTagsWithWords } from "@/app/actions";

async function getTagsDataAndProfile(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("native_language")
    .eq("id", userId)
    .single();

  return {
    nativeLanguage: profile?.native_language || "English",
  };
}

export default async function TagsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/tags");
  }

  const tagsData = await fetchUniqueTagsWithWords();
  const { nativeLanguage } = await getTagsDataAndProfile(user.id);

  return (
    <TagsPageContent
      userId={user.id}
      initialNativeLanguage={nativeLanguage}
      initialData={tagsData}
    />
  );
}
