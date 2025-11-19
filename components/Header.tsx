"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SignOutIcon,
  MoonIcon,
  SunIcon,
  ListIcon,
  XIcon,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isHomePage = pathname === "/";

  const dynamicHeaderClasses =
    isHomePage && !mobileMenuOpen
      ? "bg-[#011c42] dark:bg-background border-b-transparent text-white"
      : "bg-background/95 border-b-border text-foreground";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const buttonClasses = cn(
    isHomePage && !mobileMenuOpen && "font-mono text-white"
  );

  const logoMode = !mounted
    ? isHomePage
      ? "light"
      : "dark"
    : mobileMenuOpen
    ? resolvedTheme === "dark"
      ? "light"
      : "dark"
    : isHomePage
    ? "light"
    : resolvedTheme === "dark"
    ? "light"
    : "dark";

  const navItem = (href: string, label: string) => (
    <Link href={href} key={href}>
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

  const mobileNavItem = (href: string, label: string) => (
    <Link href={href} key={href} className="w-full block">
      <Button variant="ghost" className="w-full justify-start h-10 text-base">
        {label}
      </Button>
    </Link>
  );

  const ThemeToggle = ({ className }: { className?: string }) => {
    if (!mounted) return null;

    const handleToggle = () => {
      setTheme(theme === "dark" ? "light" : "dark");
    };

    const Icon = resolvedTheme === "dark" ? SunIcon : MoonIcon;

    const toggleClasses = cn(
      "hover:bg-transparent h-9 w-9",
      isHomePage && !mobileMenuOpen
        ? "text-white hover:text-white/80"
        : "text-foreground",
      className
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
        "w-full border-b sticky top-0 backdrop-blur z-50 py-4 md:py-7 transition-colors duration-200",
        dynamicHeaderClasses
      )}
    >
      <div className="container flex items-center justify-between mx-auto px-4 md:px-6">
        <Logo mode={logoMode} />

        <nav className="hidden lg:flex items-center gap-4 sm:gap-6">
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
          ) : user ? (
            <>
              {navItem("/inventory", "Inventory")}
              {navItem("/translations", "Translations")}
              {navItem("/tags", "Tags")}
              {navItem("/games", "Games")}
              {navItem("/settings", "Settings")}

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

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              isHomePage && !mobileMenuOpen
                ? "text-white hover:bg-white/10"
                : "text-foreground hover:bg-accent"
            )}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XIcon className="size-6" />
            ) : (
              <ListIcon className="size-6" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background text-foreground border-b shadow-lg animate-in slide-in-from-top-2 border-t">
          <nav className="container mx-auto p-4 flex flex-col gap-2">
            {loading ? (
              <div className="h-9 w-full animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <>
                {mobileNavItem("/inventory", "Inventory")}
                {mobileNavItem("/translations", "Translations")}
                {mobileNavItem("/tags", "Tags")}
                {mobileNavItem("/games", "Games")}
                {mobileNavItem("/settings", "Settings")}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start h-10 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <SignOutIcon className="h-4 w-4 mr-2" weight="regular" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {mobileNavItem("/#how-it-works", "How It Works")}
                {mobileNavItem("/blog", "Blog")}
                {mobileNavItem("/pricing", "Pricing")}

                <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 mt-2">
                  <span className="font-medium">Theme</span>
                  <ThemeToggle className="text-foreground" />
                </div>

                <Link href="/login" className="w-full mt-2">
                  <Button size="lg" className="w-full">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
