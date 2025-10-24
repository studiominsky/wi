"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useTheme } from "next-themes"; // Import useTheme

type ProfileSettings = {
  native_language: string;
  theme: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  settings: ProfileSettings | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme, theme: activeTheme } = useTheme(); // Get theme functions

  useEffect(() => {
    const fetchSessionAndProfile = async (session: Session | null) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("native_language, theme")
          .eq("id", currentUser.id)
          .single();

        const userSettings = {
          native_language: profile?.native_language || "English",
          theme: profile?.theme || "system",
        };
        setSettings(userSettings);
      } else {
        setSettings(null);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchSessionAndProfile(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchSessionAndProfile(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // This useEffect syncs the DB theme to the client
  useEffect(() => {
    if (settings && settings.theme && settings.theme !== activeTheme) {
      setTheme(settings.theme);
    }
  }, [settings, activeTheme, setTheme]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSettings(null);
    setTheme("system"); // Reset theme on logout
  };

  const value = {
    user,
    session,
    settings,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
