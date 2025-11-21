"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const LIGHT_COLOR = "#fbfbfb";
const DARK_COLOR = "#000000";

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content = resolvedTheme === "dark" ? DARK_COLOR : LIGHT_COLOR;
  }, [resolvedTheme]);

  return null;
}
