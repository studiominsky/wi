// app/page.tsx

import { Button } from "@/components/ui/button"; // Import the shadcn button

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-4">Shadcn is working!</h1>

      {/* This is your new component */}
      <Button>Click Me</Button>

      <Button variant="outline" className="mt-4">
        Outline Button
      </Button>

      <Button variant="ghost" className="mt-4">
        Ghost Button
      </Button>
    </main>
  );
}
