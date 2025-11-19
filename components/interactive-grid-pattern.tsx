"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number];
  className?: string;
  squaresClassName?: string;
}

const TAG_COLOR_FILL_MAP: Record<string, string> = {
  "tag-color-red": "fill-[#ffcccc] dark:fill-[#a42424]",
  "tag-color-blue": "fill-[#d3ddff] dark:fill-[#1c3987]",
  "tag-color-orange": "fill-[#ffe0c0] dark:fill-[#994d00]",
  "tag-color-purple": "fill-[#eed3ff] dark:fill-[#751296]",
  "tag-color-lime": "fill-[#dff695] dark:fill-[#455807]",
};

const TAG_COLOR_CLASSES = Object.keys(TAG_COLOR_FILL_MAP);
const TAG_INDICES = [23, 31, 58, 143, 155];

export function InteractiveGridPattern({
  width = 120,
  height = 120,
  squares = [15, 7],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

  const squareStyles = React.useMemo(() => {
    const totalSquares = horizontal * vertical;
    return Array.from({ length: totalSquares }).map((_, index) => {
      const isPreColored = TAG_INDICES.includes(index);

      const tagColorIndex = isPreColored
        ? TAG_INDICES.indexOf(index) % TAG_COLOR_CLASSES.length
        : Math.floor(Math.random() * TAG_COLOR_CLASSES.length);

      const tagColorClass = TAG_COLOR_CLASSES[tagColorIndex];
      const tagFillClass = TAG_COLOR_FILL_MAP[tagColorClass];

      return {
        initialFill: isPreColored ? tagFillClass : "fill-transparent",
        initialStroke: isPreColored
          ? "stroke-transparent"
          : "stroke-gray-100/10",
        hoverFill: tagFillClass,
        isPreColored,
      };
    });
  }, [horizontal, vertical]);

  return (
    <svg
      viewBox={`0 0 ${horizontal} ${vertical}`}
      width="100%"
      height="100%"
      className={cn("absolute inset-0 h-full w-full", className)}
      {...props}
    >
      {squareStyles.map((style, index) => {
        const x = index % horizontal;
        const y = Math.floor(index / horizontal);
        const isHovered = hoveredSquare === index;

        let fillClass = style.initialFill;
        let strokeColorClass = "stroke-gray-600 dark:stroke-gray-700";
        let strokeOpacityStyle: React.CSSProperties = {};

        const maxOpacity = 0.5;
        const minOpacity = 0.05;
        const center = horizontal / 2;

        const distanceFromCenter = Math.abs(x + 0.5 - center);
        const normalizedDistance = distanceFromCenter / center;

        const range = maxOpacity - minOpacity;
        const fadeOpacity = Math.max(
          minOpacity,
          maxOpacity - normalizedDistance * range
        );

        if (isHovered) {
          fillClass = style.hoverFill;
          strokeColorClass = "stroke-transparent";
        } else if (style.isPreColored) {
          strokeColorClass = "stroke-transparent";
        } else {
          strokeOpacityStyle.strokeOpacity = fadeOpacity;
        }

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={1}
            height={1}
            strokeWidth={0.005}
            className={cn(
              "transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
              fillClass,
              strokeColorClass,
              squaresClassName
            )}
            style={strokeOpacityStyle}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}
export type { InteractiveGridPatternProps };
