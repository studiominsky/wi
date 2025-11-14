import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { fetchUniqueTagsWithWords } from "@/app/actions";
import { TagDetailsClient } from "@/components/tag-details-client";

interface TagEntry {
  id: string | number;
  word: string;
  translation: string;
  tags: string[] | null;
  color: string | null;
  image_url: string | null;
  ai_data: any;
  isNativePhrase: boolean;
  wordDisplay: string;
}

interface TagData {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
  count: number;
  entries: TagEntry[];
}

export default async function TagDetailPage({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}) {
  const { tagSlug } = await params;
  const tagName = decodeURIComponent(tagSlug);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/tags/${tagSlug}`);

  const allTagsData: TagData[] | null = await fetchUniqueTagsWithWords();

  if (!allTagsData) {
    notFound();
  }

  const tagData = allTagsData.find(
    (t) => t.tag_name.toLowerCase() === tagName.toLowerCase()
  );

  if (!tagData) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6 space-y-6">
      <TagDetailsClient tagData={tagData} />
    </div>
  );
}
