"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    console.log("ResetPasswordPage: useEffect running.");

    const hash = window.location.hash;
    if (hash.includes("error_code=")) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription =
        params.get("error_description") || "Invalid or expired recovery link.";
      console.error(
        "ResetPasswordPage: Error found in URL hash:",
        errorDescription
      );
      setMsg(`Error: ${errorDescription}`);
      setShowForm(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`ResetPasswordPage: Auth event received: ${event}`);

      if (event === "PASSWORD_RECOVERY") {
        console.log(
          "ResetPasswordPage: PASSWORD_RECOVERY event detected. Showing form."
        );
        setShowForm(true);
        setMsg(null);
      } else if (event === "SIGNED_OUT") {
        console.log("ResetPasswordPage: SIGNED_OUT event detected.");
        setShowForm(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user?.recovery_sent_at && !showForm && !msg) {
        console.log(
          "ResetPasswordPage: Initial session check found likely recovery session. Showing form."
        );
        setShowForm(true);
      } else if (!session) {
        console.log(
          "ResetPasswordPage: Initial session check found no session."
        );
        setTimeout(() => {
          if (!showForm && !msg) {
            console.log(
              "ResetPasswordPage: Timeout reached, assuming invalid link."
            );
            setMsg("Invalid or expired password recovery link.");
          }
        }, 3000);
      }
    });

    return () => {
      console.log("ResetPasswordPage: Unsubscribing auth listener.");
      subscription?.unsubscribe();
    };
  }, []);

  const handlePasswordReset = async () => {
    setMsg(null);
    if (!password) {
      setMsg("Please enter a new password.");
      return;
    }
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) {
      setMsg(`Error updating password: ${error.message}`);
    } else {
      setMsg("✅ Password updated successfully! Redirecting to login...");
      setPassword("");
      setConfirmPassword("");
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  };

  if (!showForm && !msg) {
    return (
      <div className="grid place-items-center min-h-screen p-8">
        Verifying link...
      </div>
    );
  }

  return (
    <main className="grid place-items-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Reset Your Password</h1>
        {showForm ? (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Enter your new password below.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button
              onClick={handlePasswordReset}
              className="w-full"
              disabled={
                loading ||
                !password ||
                password !== confirmPassword ||
                password.length < 6
              }
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </>
        ) : null}
        {msg && <p className="text-center text-sm">{msg}</p>}
        {!loading && (
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              {" "}
              Back to Login{" "}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
