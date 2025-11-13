import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon, WrenchIcon, BrainIcon } from "@phosphor-icons/react/ssr";
import { createClient } from "@/lib/supabase/server";
import { InteractiveGridPattern } from "@/components/interactive-grid-pattern";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="bg-[#011C42] dark:bg-background relative overflow-hidden">
        <div className="relative w-full mx-auto max-w-[1600px]">
          <div className="relative w-full" style={{ paddingTop: "50%" }}>
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
              <h1 className="font-grotesk text-white leading-19 text-[72px] !tracking-[-0.123rem] tracking-tighter">
                Inventory for your Language Learning Journey
              </h1>
              <p className="mx-auto max-w-[700px] text-white text-foreground md:text-xl">
                The ultimate tool to collect, customize, and master vocabulary
                in German language learning.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Link
                  href={user ? "/inventory" : "/login"}
                  className="pointer-events-auto"
                >
                  <Button
                    className="bg-[#52eec8] text-black hover:bg-[#52eec8]/90"
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
                    className="text-white text-sm bg-[#1B3355] hover:bg-[#1B3355]/90"
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
        className="w-full bg-background py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6 px-5 mx-auto w-full max-w-screen-lg md:px-7">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-grotesk tracking-tighter sm:text-5xl">
              How It Works
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              A simple, powerful system designed for serious German language
              learners.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-background rounded-full border">
                <PlusIcon size={32} />
              </div>
              <h3 className="text-xl font-bold">Add Words and Phrases</h3>
              <p className="text-sm text-muted-foreground">
                Quickly add new words, translations, and notes to your personal
                inventory.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-background rounded-full border">
                <WrenchIcon size={32} />
              </div>
              <h3 className="text-xl font-bold">Filter & Organize</h3>
              <p className="text-sm text-muted-foreground">
                Filter your library by language to focus on what matters most
                right now.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-background rounded-full border">
                <BrainIcon size={32} />
              </div>
              <h3 className="text-xl font-bold">Master Your Vocabulary</h3>
              <p className="text-sm text-muted-foreground">
                Review your words, check your notes, and build a lasting
                personal language library.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
