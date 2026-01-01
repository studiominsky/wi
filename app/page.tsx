import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MagicWandIcon,
  PaletteIcon,
  BrainIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { InteractiveGridPattern } from "@/components/interactive-grid-pattern";
import { redirect } from "next/navigation";
import { blogPosts } from "@/lib/blog-data";
import { TagNodeGraphFlow } from "@/components/tag-force-graph";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/inventory");
  }

  const fakeGraphData = [
    {
      tag_name: "Travel",
      icon_name: "AirplaneIcon",
      color_class: "tag-color-blue",
      count: 3,
      entries: [
        {
          id: 101,
          word: "Der Reisepass",
          translation: "The Passport",
          wordDisplay: "Der Reisepass",
          isNativePhrase: false,
          color: "tag-color-blue",
          tags: ["Travel"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 102,
          word: "Fliegen",
          translation: "To fly",
          wordDisplay: "Fliegen",
          isNativePhrase: false,
          color: "tag-color-blue",
          tags: ["Travel"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 103,
          word: "Die Unterkunft",
          translation: "Accommodation",
          wordDisplay: "Die Unterkunft",
          isNativePhrase: false,
          color: "tag-color-blue",
          tags: ["Travel"],
          image_url: null,
          ai_data: null,
        },
      ],
    },
    {
      tag_name: "Nature",
      icon_name: "TreeIcon",
      color_class: "tag-color-lime",
      count: 3,
      entries: [
        {
          id: 201,
          word: "Der Wald",
          translation: "The Forest",
          wordDisplay: "Der Wald",
          isNativePhrase: false,
          color: "tag-color-lime",
          tags: ["Nature"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 202,
          word: "Wandern",
          translation: "To hike",
          wordDisplay: "Wandern",
          isNativePhrase: false,
          color: "tag-color-lime",
          tags: ["Nature"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 203,
          word: "Der Berg",
          translation: "Mountain",
          wordDisplay: "Der Berg",
          isNativePhrase: false,
          color: "tag-color-lime",
          tags: ["Nature"],
          image_url: null,
          ai_data: null,
        },
      ],
    },
    {
      tag_name: "Food",
      icon_name: "ForkKnifeIcon",
      color_class: "tag-color-orange",
      count: 5,
      entries: [
        {
          id: 301,
          word: "Das Frühstück",
          translation: "Breakfast",
          wordDisplay: "Das Frühstück",
          isNativePhrase: false,
          color: "tag-color-orange",
          tags: ["Food"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 302,
          word: "Lecker",
          translation: "Delicious",
          wordDisplay: "Lecker",
          isNativePhrase: false,
          color: "tag-color-orange",
          tags: ["Food"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 303,
          word: "Bestellen",
          translation: "To order",
          wordDisplay: "Bestellen",
          isNativePhrase: false,
          color: "tag-color-orange",
          tags: ["Food"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 304,
          word: "Die Rechnung",
          translation: "The Bill",
          wordDisplay: "Die Rechnung",
          isNativePhrase: false,
          color: "tag-color-orange",
          tags: ["Food"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 305,
          word: "Das Gemüse",
          translation: "Vegetables",
          wordDisplay: "Das Gemüse",
          isNativePhrase: false,
          color: "tag-color-orange",
          tags: ["Food"],
          image_url: null,
          ai_data: null,
        },
      ],
    },
    {
      tag_name: "Essentials",
      icon_name: "StarIcon",
      color_class: "tag-color-teal",
      count: 5,
      entries: [
        {
          id: 401,
          word: "Vielleicht",
          translation: "Maybe",
          wordDisplay: "Vielleicht",
          isNativePhrase: false,
          color: "tag-color-teal",
          tags: ["Essentials"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 402,
          word: "Entschuldigung",
          translation: "Excuse me",
          wordDisplay: "Entschuldigung",
          isNativePhrase: false,
          color: "tag-color-teal",
          tags: ["Essentials"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 403,
          word: "Genau",
          translation: "Exactly",
          wordDisplay: "Genau",
          isNativePhrase: false,
          color: "tag-color-teal",
          tags: ["Essentials"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 404,
          word: "Hilfe",
          translation: "Help",
          wordDisplay: "Hilfe",
          isNativePhrase: false,
          color: "tag-color-teal",
          tags: ["Essentials"],
          image_url: null,
          ai_data: null,
        },
        {
          id: 405,
          word: "Danke",
          translation: "Thank you",
          wordDisplay: "Danke",
          isNativePhrase: false,
          color: "tag-color-teal",
          tags: ["Essentials"],
          image_url: null,
          ai_data: null,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfb] dark:bg-black text-foreground">
      <div className="bg-[#011C42] dark:bg-black relative overflow-hidden">
        <div className="relative w-full mx-auto max-w-[1600px]">
          <div className="relative w-full pt-[100%] sm:pt-[50%] my-10 sm:my-5">
            <InteractiveGridPattern
              className="absolute inset-0 h-full w-full"
              squares={[20, 10]}
              squaresClassName=""
            />
          </div>
        </div>

        <section className="absolute inset-0 text-center z-10 p-12 md:p-24 lg:p-32 xl:p-48 pointer-events-none">
          <div className="container px-4 md:px-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-screen-lg">
            <div className="flex flex-col items-center space-y-6">
              <h1 className="font-grotesk text-white text-4xl sm:text-5xl lg:text-[72px] !tracking-[-0.123rem] tracking-tighter leading-tight">
                Your German word inventory. Powered by AI.
              </h1>
              <p className="mx-auto max-w-[700px] text-white/80 md:text-xl leading-relaxed">
                Build your personal word inventory. Just drop in a word, and let
                AI automatically add grammar and real-world examples. Turn your
                inventory into interactive graphs and games to master the
                language faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                <Link
                  href={user ? "/inventory" : "/login"}
                  className="pointer-events-auto"
                >
                  <Button
                    className="bg-[#52eec8] text-black hover:bg-[#52eec8]/90 font-bold px-8 h-12"
                    size="lg"
                  >
                    {user ? "Go to Inventory" : "Get Started for Free"}
                  </Button>
                </Link>
                <Link
                  href={"#how-it-works"}
                  className="pointer-events-auto scroll-smooth"
                >
                  <Button
                    className="text-white text-sm bg-[#1B3355] hover:bg-[#1B3355]/90 h-12 px-8"
                    size="lg"
                  >
                    Discover More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        id="how-it-works"
        className="w-full bg-[#fbfbfb] dark:bg-black py-24 md:py-32 scroll-mt-20"
      >
        <div className="container px-4 md:px-6 mx-auto w-full max-w-screen-xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
            <span className="bg-[#c4e456] text-black px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
              Workflow
            </span>
            <h2 className="text-4xl font-grotesk tracking-tighter sm:text-6xl">
              How It Works
            </h2>
            <p className="max-w-[800px] text-muted-foreground text-lg md:text-xl leading-relaxed">
              A complete system designed to transform your vocabulary list into
              an intelligent learning engine.
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-start p-8 rounded-2xl border bg-card/50">
              <div className="p-4 bg-muted rounded-xl mb-6">
                <MagicWandIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Context-Aware AI</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Don&apos;t just save words; master them. Our Gemini-powered AI
                analyzes context instantly to provide tailored insights.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">
                      Deep Grammar:
                    </strong>{" "}
                    Auto-generated conjugation tables & noun declensions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">
                      Adaptive Level:
                    </strong>{" "}
                    Examples tailored to your specific CEFR level (A1–C2).
                  </span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-start p-8 rounded-2xl border bg-card/50">
              <div className="p-4 bg-muted rounded-xl mb-6">
                <PaletteIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Visual Knowledge Graph
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Language is a network, not a list. We help you visualize the
                connections between your vocabulary.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">
                      Semantic Mapping:
                    </strong>{" "}
                    Interactive force-directed graphs showing topic clusters.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">
                      Visual Anchors:
                    </strong>{" "}
                    Use color-coding strategies (e.g., Blue for Masculine).
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-start p-8 rounded-2xl border bg-card/50">
              <div className="p-4 bg-muted rounded-xl mb-6">
                <BrainIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Inventory Gamification
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Your study materials are automatically converted into playable
                challenges based on your personal list.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">
                      Active Recall:
                    </strong>{" "}
                    Dynamic flashcards and timed challenges.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 text-primary shrink-0" />
                  <span>
                    <strong className="text-foreground font-medium">
                      Targeted Practice:
                    </strong>{" "}
                    Games specifically for Article Guessing (Der/Die/Das).
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-24 md:py-32">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <span className="bg-[#e88dfb] text-black px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
              Organization
            </span>
            <h2 className="text-4xl font-grotesk tracking-tighter sm:text-6xl">
              Visual Knowledge Graph
            </h2>
            <p className="max-w-[900px] text-muted-foreground text-lg md:text-xl leading-relaxed">
              See how your vocabulary connects. Group words by topic and explore
              your learning journey visually.
            </p>
          </div>

          <div className="w-full">
            <TagNodeGraphFlow tagsData={fakeGraphData} />
          </div>
        </div>
      </section>

      <section className="w-full py-24 md:py-32">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <span className="bg-[#e88dfb] text-black px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
              Blog
            </span>
            <h2 className="text-4xl font-grotesk tracking-tighter sm:text-6xl">
              Latest from the Blog
            </h2>
            <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
              Tips and tricks to help you get the most out of your language
              learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-background border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="bg-[#c4e456] text-black px-2 py-0.5 rounded-full font-bold">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm font-bold text-primary mt-auto">
                    Read Article{" "}
                    <ArrowRightIcon className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="px-8">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
