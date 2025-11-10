"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookText,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Logo from "./logo";

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="w-full border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
      <div className="container flex  items-center justify-between mx-auto px-4 md:px-6">
        <Logo className="w-auto mr-4 py-3" />
        <nav className="flex items-center gap-4 sm:gap-6">
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
          ) : user ? (
            <>
              <Link href="/inventory">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
              </Link>
              <Link href="/translations">
                <Button variant="ghost" size="sm">
                  <BookText className="h-4 w-4 mr-2" />
                  Translations
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
