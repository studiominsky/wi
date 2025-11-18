"use client";

import { useState, useEffect } from "react";
import { fetchUniqueTagsWithWords } from "@/app/actions";
import { TagListView } from "@/components/tag-list-view";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { TagNodeGraphFlow as TagForceGraph } from "./tag-force-graph";

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

export default function TagsPageContent({
  userId,
  initialNativeLanguage,
}: {
  userId: string;
  initialNativeLanguage: string;
}) {
  const [tagsData, setTagsData] = useState<TagData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadTags() {
      setLoading(true);
      const data = await fetchUniqueTagsWithWords();
      setTagsData(data);
      setLoading(false);
    }
    loadTags();
  }, [userId, refreshKey]);

  const refreshTags = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex justify-center items-center h-[50vh]">
        <CircleNotchIcon className="size-8 animate-spin text-primary" />
        <span className="ml-2">Loading tags...</span>
      </div>
    );
  }

  if (!tagsData || tagsData.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center py-16 border-2 border-dashed rounded-lg max-w-4xl mt-10">
        <h1 className="text-2xl font-bold">No Tags Used Yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start tagging your words and translations in German and{" "}
          {initialNativeLanguage} to build up your personal vocabulary map.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Go to your Inventory and edit any word/translation to add tags.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-grotesk md:text-4xl">Tag Overview</h1>
      <p className="text-sans text-foreground/60 max-w-lg">
        Visualize your vocabulary by tags. Switch between Card and Node Graph
        views.
      </p>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="nodes">Graph View</TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="py-4">
          <TagListView tagsData={tagsData} onTagUpdated={refreshTags} />
        </TabsContent>
        <TabsContent value="nodes" className="py-4">
          <TagForceGraph tagsData={tagsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
