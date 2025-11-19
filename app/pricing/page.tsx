import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Pricing - Word Inventory",
  description: "Choose the plan that fits your language learning journey.",
};

export default async function PricingPage() {
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
    <div className="min-h-screen bg-[#fbfbfb] dark:bg-[#000]">
      <div className="container px-4 md:px-6 py-12 md:py-24 mx-auto max-w-screen-lg">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <h1 className="text-4xl font-grotesk tracking-tighter sm:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Invest in your language skills with a plan that grows with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col p-6 bg-background rounded-xl border h-full"
              )}
            >
              {tier.popular && (
                <div className="self-center -mt-9 mb-5 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wide">
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
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
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
                  size="lg"
                >
                  {tier.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
