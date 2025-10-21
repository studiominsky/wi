"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleLogin = async () => {
    setMsg(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const next = searchParams.get("next") || "/dashboard";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });

    setMsg(
      error
        ? `Error: ${error.message}`
        : "✅ Check your email for a magic link!"
    );
  };

  return (
    <main className="grid place-items-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full border rounded p-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded bg-black text-white py-2"
        >
          Send Magic Link
        </button>

        {msg && <p className="text-center text-sm">{msg}</p>}
      </div>
    </main>
  );
}
