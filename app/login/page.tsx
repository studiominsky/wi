"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: "http://localhost:3000/add-word",
      },
    });

    if (error) {
      setMessage(`Could not authenticate: ${error.message}`);
    } else {
      setMessage("Check your email for a magic link!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Login / Sign Up</h1>
        <p className="text-sm text-center text-muted-foreground">
          Enter an email to sign up or log in.
        </p>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button onClick={handleLogin} className="w-full">
          Send Magic Link
        </Button>

        {message && <p className="text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}
