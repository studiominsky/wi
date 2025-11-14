"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  SignOutIcon,
  MoonIcon,
  SunIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Logo from "./logo";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isHomePage = pathname === "/";

  const dynamicHeaderClasses = isHomePage
    ? "bg-[#011c42] dark:bg-background border-b-transparent text-white"
    : "bg-background/95 border-b-border text-foreground";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const buttonClasses = cn(isHomePage && "font-mono text-white");

  const logoMode = !mounted
    ? isHomePage
      ? "light"
      : "dark"
    : isHomePage
    ? "light"
    : resolvedTheme === "dark"
    ? "light"
    : "dark";

  const navItem = (href: string, label: string) => (
    <Link href={href}>
      <Button
        variant="link"
        size="link"
        className={cn(
          buttonClasses,
          "relative after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-current after:origin-left after:transition-transform after:duration-200",
          pathname === href
            ? "after:scale-x-100"
            : "after:scale-x-0 hover:after:scale-x-100"
        )}
      >
        {label}
      </Button>
    </Link>
  );

  const ThemeToggle = () => {
    if (!mounted) return null;

    const handleToggle = () => {
      setTheme(theme === "dark" ? "light" : "dark");
    };

    const Icon = resolvedTheme === "dark" ? SunIcon : MoonIcon;

    const toggleClasses = cn(
      "hover:bg-transparent h-9 w-9",
      isHomePage ? "text-white hover:text-white/80" : "text-foreground"
    );

    return (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        aria-label="Toggle theme"
        className={toggleClasses}
      >
        <Icon className="size-5" />
      </Button>
    );
  };

  return (
    <header
      className={cn(
        "w-full border-b sticky top-0 backdrop-blur z-10 py-7",
        dynamicHeaderClasses
      )}
    >
      <div className="container flex items-center justify-between mx-auto px-4 md:px-6">
        <Logo mode={logoMode} />

        <nav className="flex items-center gap-4 sm:gap-6">
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
          ) : user ? (
            <>
              {navItem("/inventory", "Inventory")}
              {navItem("/translations", "Translations")}
              {navItem("/tags", "Tags")}
              {navItem("/settings", "Settings")}
              <Link href="/profile">
                <Button
                  variant="link"
                  size="link"
                  className={cn(
                    buttonClasses,
                    "relative after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-current after:origin-left after:transition-transform after:duration-200",
                    pathname === "/profile"
                      ? "after:scale-x-100"
                      : "after:scale-x-0 hover:after:scale-x-100"
                  )}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                variant="link"
                size="link"
                className={cn(isHomePage && "bg-transparent text-white")}
              >
                <SignOutIcon className="h-4 w-4 mr-2" weight="regular" />
                Logout
              </Button>
            </>
          ) : (
            <>
              {navItem("/#how-it-works", "How It Works")}
              {navItem("/blog", "Blog")}
              {navItem("/pricing", "Pricing")}
              <ThemeToggle />

              <Link href="/login">
                <Button size="lg" className="shrink-0">
                  Login
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
