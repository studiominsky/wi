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
import { cn } from "@/lib/utils";
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

  const pricingTiers = [
    {
      name: "Free",
      price: "0€",
      description: "Perfect for casual learners",
      features: [
        "Up to 100 words",
        "Basic Flashcards",
        "Community Support",
        "1 Language",
      ],
      buttonText: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "5€",
      period: "/month",
      description: "For serious language students",
      features: [
        "Unlimited words",
        "AI-Powered Grammar Analysis",
        "All Mini-Games",
        "Unlimited Languages",
        "Priority Support",
      ],
      buttonText: "Start Free Trial",
      popular: true,
    },
    {
      name: "Lifetime",
      price: "50€",
      period: " one-time",
      description: "Pay once, learn forever",
      features: [
        "Everything in Pro",
        "No monthly subscription",
        "Early access to new features",
        "Support our development",
      ],
      buttonText: "Buy Lifetime",
      popular: false,
    },
  ];

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
            <div className="flex flex-col items-center space-y-4">
              <h1 className="font-grotesk text-white text-4xl sm:text-5xl lg:text-[72px] !tracking-[-0.123rem] tracking-tighter">
                Your German word inventory. Powered by AI.
              </h1>
              <p className="mx-auto max-w-[700px] text-white/80 md:text-xl">
                Build your personal word inventory. Just drop in a word, and let
                AI automatically add grammar and real-world examples. Turn your
                inventory into interactive graphs and games to master the
                language faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
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
        className="w-full bg-[#fbfbfb] dark:bg-black py-12 md:py-24 lg:py-32 scroll-mt-20 sm:scroll-mt-10"
      >
        <div className="container px-4 md:px-6 px-5 mx-auto w-full max-w-screen-lg md:px-7">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <span className="bg-[#c4e456] text-black px-2.5 py-0.5 rounded-full text-xs font-medium font-mono uppercase tracking-wide">
              Workflow
            </span>
            <h2 className="text-3xl font-grotesk tracking-tighter sm:text-5xl">
              How It Works
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              A complete system designed to take you from a blank page to
              fluency.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-muted/50 rounded-full border mb-2">
                <MagicWandIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Enrichment</h3>
              <p className="text-sm text-muted-foreground">
                Just type a word. AI instantly adds translations, grammar
                tables, and example sentences tailored to your exact level
                (A1–C2).
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-muted/50 rounded-full border mb-2">
                <PaletteIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Visual & Connected</h3>
              <p className="text-sm text-muted-foreground">
                Make memories stick. Upload your own images, color-code genders
                (e.g. blue for masculine), and link words with Tags to build a
                visual knowledge graph.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-muted/50 rounded-full border mb-2">
                <BrainIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Gamified Mastery</h3>
              <p className="text-sm text-muted-foreground">
                Your inventory powers the game engine. Automatically generate
                Memory Cards, Article Guessing games, and Quick Recall
                challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <span className="bg-[#e88dfb] text-black px-2.5 py-0.5 rounded-full text-xs font-medium font-mono uppercase tracking-wide">
              Organization
            </span>
            <h2 className="text-3xl font-grotesk tracking-tighter sm:text-5xl">
              Visual Knowledge Graph
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              See how your vocabulary connects. Group words by topic and explore
              your learning journey visually.
            </p>
          </div>

          <div className="w-full">
            <TagNodeGraphFlow tagsData={fakeGraphData} />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <span className="bg-[#e88dfb] text-black px-2.5 py-0.5 rounded-full text-xs font-medium font-mono uppercase tracking-wide">
              Blog
            </span>
            <h2 className="text-3xl font-grotesk tracking-tighter sm:text-5xl">
              Latest from the Blog
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Tips and tricks to help you get the most out of your language
              learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-background border rounded-md overflow-hidden hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="bg-[#c4e456] text-black px-2 py-0.5 rounded-full font-medium">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm font-medium text-primary mt-auto">
                    Read Article{" "}
                    <ArrowRightIcon className="ml-1 size-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/blog">
              <Button variant="outline" size="lg">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
