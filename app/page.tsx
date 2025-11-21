import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  WrenchIcon,
  BrainIcon,
  CheckIcon,
} from "@phosphor-icons/react/ssr";
import { createClient } from "@/lib/supabase/server";
import { InteractiveGridPattern } from "@/components/interactive-grid-pattern";
import { cn } from "@/lib/utils";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        className="w-full bg-[#fbfbfb] dark:bg-black py-12 md:py-24 lg:py-32"
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
              A simple, powerful system designed for serious German language
              learners.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-muted/50 rounded-full border mb-2">
                <PlusIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Add Words and Phrases</h3>
              <p className="text-sm text-muted-foreground">
                Quickly add new words, translations, and notes to your personal
                German word inventory.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-muted/50 rounded-full border mb-2">
                <WrenchIcon size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Filter & Organize</h3>
              <p className="text-sm text-muted-foreground">
                Filter your library by language to focus on what matters most
                right now.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center p-4">
              <div className="p-4 bg-muted/50 rounded-full border mb-2">
                <BrainIcon size={32} className="text-primary" />
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

      <section id="pricing" className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <span className="bg-[#c4e456] text-black px-2.5 py-0.5 rounded-full text-xs font-medium font-mono uppercase tracking-wide">
              Plans
            </span>
            <h2 className="text-3xl font-grotesk tracking-tighter sm:text-5xl">
              Simple Pricing
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Start for free, upgrade when you're ready to master more
              languages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col p-6 bg-background rounded-md border",
                  tier.popular
                    ? "ring-primary relative md:-mt-4 md:mb-4 z-10"
                    : ""
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tier.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckIcon
                        className="size-5 text-primary shrink-0"
                        weight="bold"
                      />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={user ? "/inventory" : "/signup"} className="w-full">
                  <Button
                    variant={tier.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
