"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) return;

    const color = resolvedTheme === "dark" ? "#000000" : "#fbfbfb";
    meta.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}
