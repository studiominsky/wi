"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async () => {
    setMsg(null);
    setLoading(true);
    if (!email) {
      setMsg("Please enter your email address.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      setMsg(`Error: ${error.message}`);
    } else {
      setMsg(
        "✅ If an account exists for this email, a password reset link has been sent."
      );
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <main className="grid place-items-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <p className="text-center text-sm text-muted-foreground">
          Enter your email address below and we'll send you a link to reset your
          password.
        </p>

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
        </div>

        <Button
          onClick={handleResetRequest}
          className="w-full"
          disabled={loading || !email}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        {msg && <p className="text-center text-sm">{msg}</p>}

        <div className="text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
