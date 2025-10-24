"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/dashboard/profile");
    } else if (user) {
      const fetchProfile = async () => {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (data?.username) {
          setUsername(data.username);
          setCurrentUsername(data.username);
        } else if (error && error.code !== "PGRST116") {
          setProfileMessage(`Error fetching profile: ${error.message}`);
        }
        setLoadingProfile(false);
      };
      fetchProfile();
    }
  }, [user, authLoading, router, supabase]);

  const handleUpdateUsername = async () => {
    setProfileMessage("");
    if (!user) return;
    if (!username || username.length < 3) {
      setProfileMessage("Username must be at least 3 characters.");
      return;
    }
    if (username === currentUsername) {
      setProfileMessage("Username is unchanged.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: username, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        setProfileMessage("Error: Username already taken.");
      } else {
        setProfileMessage(`Error updating username: ${error.message}`);
      }
    } else {
      setProfileMessage("Username updated successfully!");
      setCurrentUsername(username);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMessage("");
    if (!password) {
      setPasswordMessage("Please enter a new password.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setPasswordMessage(`Error updating password: ${error.message}`);
    } else {
      setPasswordMessage("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="container mx-auto p-4 md:p-6">Loading profile...</div>
    );
  }

  if (!user) {
    return <div className="container mx-auto p-4 md:p-6">Please log in.</div>;
  }

  return (
    <div className="container mx-auto max-w-xl p-4 md:p-6 space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Email</h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Update Username</h2>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Choose a username (min 3 chars)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <Button
          onClick={handleUpdateUsername}
          disabled={username === currentUsername || username.length < 3}
        >
          Update Username
        </Button>
        {profileMessage && <p className="text-sm">{profileMessage}</p>}
      </div>

      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Update Password</h2>
        <p className="text-sm text-muted-foreground">
          Set a password to enable email/password login.
        </p>
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="New password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          />
        </div>
        <Button
          onClick={handleUpdatePassword}
          disabled={
            !password || password !== confirmPassword || password.length < 6
          }
        >
          Update Password
        </Button>
        {passwordMessage && <p className="text-sm">{passwordMessage}</p>}
      </div>
    </div>
  );
}
