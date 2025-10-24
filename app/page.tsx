import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookText, PlusCircle, Settings2, BrainCircuit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 text-center px-5 mx-auto w-full max-w-screen-lg md:px-7">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Build Your Personal Language Library
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                The ultimate tool to collect, customize, and master vocabulary
                in any language you're learning. Your words, your rules.
              </p>
              <Link href={user ? "/inventory" : "/login"}>
                <Button size="lg">Get Started for Free</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 px-5 mx-auto w-full max-w-screen-lg md:px-7">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A simple, powerful system designed for serious language
                learners.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 text-center p-4">
                <div className="p-4 bg-background rounded-full border">
                  <PlusCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Add Words Easily</h3>
                <p className="text-sm text-muted-foreground">
                  Quickly add new words, translations, and notes to your
                  personal inventory for any language.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center p-4">
                <div className="p-4 bg-background rounded-full border">
                  <Settings2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Filter & Organize</h3>
                <p className="text-sm text-muted-foreground">
                  Filter your library by language to focus on what matters most
                  right now.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center p-4">
                <div className="p-4 bg-background rounded-full border">
                  <BrainCircuit className="h-8 w-8 text-primary" />
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
      </main>

      <footer className="w-full shrink-0 px-5 text-center">
        <div className="container flex flex-col items-center justify-center mx-auto w-full max-w-screen-lg md:px-7gap-2 py-6 px-4 sm:flex-row md:px-6">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 Word Inventory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
