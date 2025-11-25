"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SignOutIcon,
  MoonIcon,
  SunIcon,
  ListIcon,
  XIcon,
  SignInIcon,
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/";
  const isTransparentHeroState =
    isHomePage && !isScrolled && !mobileMenuOpen && !user;

  const dynamicHeaderClasses = isTransparentHeroState
    ? "bg-[#011c42] dark:bg-black border-b-transparent text-white shadow-none"
    : isHomePage && isScrolled
    ? "bg-[#fbfbfb] dark:bg-[#000] border-b-border text-foreground"
    : "dark:bg-black border-b-border text-foreground";

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const buttonClasses = cn(
    isTransparentHeroState && "font-mono text-white hover:text-white"
  );

  const underlineClasses =
    "font-mono relative after:absolute after:left-0 after:bottom-0 after:h-[1px]";

  const logoMode = !mounted
    ? isHomePage
      ? "light"
      : "dark"
    : isTransparentHeroState
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
          "font-mono relative after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-current",
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
    <Link
      href={href}
      key={href}
      className="w-full block"
      onClick={() => setMobileMenuOpen(false)}
    >
      <Button
        variant="link"
        className={cn(
          "w-full justify-start h-10 text-base w-fit p-0",
          underlineClasses,
          pathname === href
            ? "after:scale-x-100 text-accent-foreground font-medium"
            : "after:scale-x-0 hover:after:scale-x-100"
        )}
      >
        {label}
      </Button>
    </Link>
  );

  const ThemeToggle = ({ className }: { className?: string }) => {
    if (!mounted) return null;

    const handleToggle = () => {
      setTheme(theme === "dark" ? "light" : "dark");
      setMobileMenuOpen(false);
    };

    const Icon = resolvedTheme === "dark" ? SunIcon : MoonIcon;

    const toggleClasses = cn(
      "hover:bg-transparent h-9 w-9",
      isTransparentHeroState
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
    <>
      <header
        className={cn(
          "w-full border-b sticky top-0 z-50 py-4 md:py-7",
          dynamicHeaderClasses,
          mobileMenuOpen
            ? "z-[60] bg-[#fbfbfb] dark:bg-[#000] text-foreground border-b-border"
            : "z-50"
        )}
      >
        <div className="container flex items-center justify-between mx-auto px-4 md:px-6">
          <Logo
            mode={
              mobileMenuOpen
                ? resolvedTheme === "dark"
                  ? "light"
                  : "dark"
                : logoMode
            }
          />

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
                  className={cn(
                    isTransparentHeroState &&
                      "bg-transparent text-white hover:text-white/80"
                  )}
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
                !mobileMenuOpen && isTransparentHeroState
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
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#fbfbfb] dark:bg-[#000] text-foreground border-b animate-in slide-in-from-top-2 border-t z-[60]">
            <nav className="container mx-auto p-4 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
              {loading ? (
                <div className="h-9 w-full animate-pulse rounded-md" />
              ) : user ? (
                <>
                  {mobileNavItem("/inventory", "Inventory")}
                  {mobileNavItem("/translations", "Translations")}
                  {mobileNavItem("/tags", "Tags")}
                  {mobileNavItem("/games", "Games")}
                  {mobileNavItem("/settings", "Settings")}
                  <Button
                    onClick={handleSignOut}
                    size="lg"
                    variant="destructive"
                    className="w-full mt-4 uppercase"
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

                  <div className="flex items-center justify-between p-0 border-border/50 mt-2">
                    <span className="font-medium">Theme</span>
                    <ThemeToggle className="text-foreground" />
                  </div>

                  <Link
                    href="/login"
                    className="w-full mt-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button size="lg" className="w-full">
                      <SignInIcon className="h-4 w-4 mr-2" weight="regular" />
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 animate-in fade-in-0"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
