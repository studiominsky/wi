"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon, SignOutIcon } from "@phosphor-icons/react";
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
  const { resolvedTheme } = useTheme();

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

  return (
    <header
      className={cn(
        "w-full border-b sticky top-0 backdrop-blur z-10 py-5",
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

              <Button onClick={handleSignOut} size="lg">
                <SignOutIcon className="h-4 w-4 mr-2" weight="regular" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
