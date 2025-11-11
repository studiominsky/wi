"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  mode = "light",
}: {
  className?: string;
  mode?: "light" | "dark";
}) {
  const isDark = mode === "dark";

  return (
    <Link
      href="/"
      aria-label="Word Inventory Home"
      className={cn("inline-block", className)}
    >
      <div
        className={cn(
          "flex items-center justify-center border text-md font-mono font-medium w-[48px] h-[48px]",
          isDark
            ? "bg-black text-white border-black"
            : "bg-white text-black border-black"
        )}
      >
        Wi
      </div>
    </Link>
  );
}
