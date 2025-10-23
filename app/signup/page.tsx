"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setMsg(null);
    setLoading(true);
    if (!email || !password) {
      setMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setMsg(`Error: ${error.message}`);
    } else {
      setMsg("✅ Success! Please check your email to confirm your account.");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <main className="grid place-items-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <Button
          onClick={handleSignUp}
          className="w-full"
          disabled={loading || !email || !password || password.length < 6}
        >
          {loading ? "Signing Up..." : "Sign Up with Email"}
        </Button>

        {msg && <p className="text-center text-sm">{msg}</p>}

        <div className="text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
