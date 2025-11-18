"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ImageWithErrorBoundaryProps {
  src: string;
  alt: string;
  className?: string;
  rounded?: boolean;
  fallbackText?: string;
}

export function ImageWithErrorBoundary({
  src,
  alt,
  className,
}: ImageWithErrorBoundaryProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (!target.src.includes("placehold.co")) {
          target.src =
            "https://placehold.co/600x400/e0e0e0/000?text=Image+Load+Error";
          target.onerror = null;
        }
      }}
    />
  );
}
