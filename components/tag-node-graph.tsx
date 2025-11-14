"use client";

import { TagIcon, Icon } from "@phosphor-icons/react";
import * as React from "react";
import { TagIconMap } from "@/lib/tag-icons";

interface TagEntry {
  id: string | number;
  word: string;
  translation: string;
  isNativePhrase: boolean;
  wordDisplay: string;
}

interface TagData {
  tag_name: string;
  icon_name: string;
  color_class: string | null;
  count: number;
  entries: TagEntry[];
}

const iconComponentMap: Record<string, Icon> = TagIconMap;

const NODE_RADIUS = 8;
const TAG_RADIUS = 12;
const MAX_NODES_PER_TAG = 3;
const SVG_HEIGHT = 600;
const SVG_WIDTH = 800;
const ORBIT_RADIUS = 100;
const SVG_PADDING = 80;

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const getColorClass = (colorClass: string | null) => {
  switch (colorClass) {
    case "tag-color-teal":
      return "bg-[#006666] text-[#b9f5e6]";
    case "tag-color-blue":
      return "bg-[#1c3987] text-[#d3ddff]";
    case "tag-color-orange":
      return "bg-[#994d00] text-[#ffe0c0]";
    case "tag-color-red":
      return "bg-[#a42424] text-[#ffcccc]";
    case "tag-color-purple":
      return "bg-[#751296] text-[#eed3ff]";
    default:
      return "bg-muted-foreground text-background";
  }
};

export function TagNodeGraph({ tagsData }: { tagsData: TagData[] | null }) {
  if (!tagsData || tagsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed rounded-lg p-8 bg-muted/20">
        <TagIcon className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No data to display.</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Add tags to your words and translations to start seeing your knowledge
          graph here.
        </p>
      </div>
    );
  }

  const tagsToDisplay = tagsData.slice(0, 8);

  const visualTags = tagsToDisplay.filter((t) => t.entries.length > 0);

  if (visualTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed rounded-lg p-8 bg-muted/20">
        <TagIcon className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No data to display.</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Add tags to your words and translations to start seeing your knowledge
          graph here.
        </p>
      </div>
    );
  }

  const tagPositions = visualTags.map((tag) => {
    const hash = simpleHash(tag.tag_name);

    const minX = SVG_PADDING + ORBIT_RADIUS;
    const maxX = SVG_WIDTH - SVG_PADDING - ORBIT_RADIUS;
    const minY = SVG_PADDING + ORBIT_RADIUS;
    const maxY = SVG_HEIGHT - SVG_PADDING - ORBIT_RADIUS;

    const x = minX + (hash % (maxX - minX));
    const y = minY + ((hash * 17) % (maxY - minY));

    return { x, y };
  });

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-background/50">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        width="100%"
        height={SVG_HEIGHT}
        className="block"
      >
        <g className="links stroke-current stroke-[2px] opacity-30 text-primary">
          {visualTags.flatMap((tag, tagIndex) => {
            const tagPos = tagPositions[tagIndex];
            const nodes = tag.entries.slice(0, MAX_NODES_PER_TAG);

            return nodes.map((_, nodeIndex) => {
              const angle = (nodeIndex / MAX_NODES_PER_TAG) * 2 * Math.PI;
              const nodeX = tagPos.x + ORBIT_RADIUS * Math.cos(angle);
              const nodeY = tagPos.y + ORBIT_RADIUS * Math.sin(angle);

              return (
                <line
                  key={`${tag.tag_name}-${nodeIndex}-line`}
                  x1={tagPos.x}
                  y1={tagPos.y}
                  x2={nodeX}
                  y2={nodeY}
                />
              );
            });
          })}
        </g>

        <g className="nodes">
          {visualTags.flatMap((tag, tagIndex) => {
            const tagPos = tagPositions[tagIndex];
            const nodes = tag.entries.slice(0, MAX_NODES_PER_TAG);

            return nodes.map((entry, nodeIndex) => {
              const angle = (nodeIndex / MAX_NODES_PER_TAG) * 2 * Math.PI;
              const nodeX = tagPos.x + ORBIT_RADIUS * Math.cos(angle);
              const nodeY = tagPos.y + ORBIT_RADIUS * Math.sin(angle);

              const fillColor = entry.isNativePhrase ? "#1c3987" : "#52eec8";

              return (
                <g
                  key={`${tag.tag_name}-${nodeIndex}-node`}
                  transform={`translate(${nodeX}, ${nodeY})`}
                  className="cursor-pointer group/node text-foreground"
                >
                  <circle
                    r={NODE_RADIUS}
                    fill={fillColor}
                    stroke="#000"
                    strokeWidth="1"
                  />
                  <text
                    y={-NODE_RADIUS - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    className="font-mono opacity-100 transition-opacity"
                  >
                    {entry.wordDisplay}
                  </text>
                  <title>
                    {entry.isNativePhrase ? "Translation" : "Word"}:{" "}
                    {entry.wordDisplay} - {entry.translation}
                  </title>
                </g>
              );
            });
          })}
        </g>

        <g className="tag-nodes">
          {visualTags.map((tag, tagIndex) => {
            const tagPos = tagPositions[tagIndex];
            const IconComponent = iconComponentMap[tag.icon_name] || TagIcon;
            const bgColor = tag.color_class
              ? getColorClass(tag.color_class)
                  .split(" ")[0]
                  .replace("bg-[", "")
                  .replace("]", "")
              : "#ccc";
            const textColor = tag.color_class
              ? getColorClass(tag.color_class)
                  .split(" ")[1]
                  .replace("text-[", "")
                  .replace("]", "")
              : "#000";

            return (
              <g
                key={tag.tag_name}
                transform={`translate(${tagPos.x}, ${tagPos.y})`}
                className="cursor-pointer group/tag"
              >
                <circle
                  r={TAG_RADIUS}
                  fill={bgColor}
                  stroke="#000"
                  strokeWidth="2"
                />
                <foreignObject
                  x={-TAG_RADIUS}
                  y={-TAG_RADIUS}
                  width={TAG_RADIUS * 2}
                  height={TAG_RADIUS * 2}
                >
                  <IconComponent
                    className="size-full p-1"
                    color={textColor === "text-background" ? "#000" : textColor}
                    weight="bold"
                  />
                </foreignObject>
                <text
                  y={TAG_RADIUS + 15}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  className="capitalize fill-foreground font-sans opacity-100 transition-opacity"
                >
                  {tag.tag_name} ({tag.count})
                </text>
                <title>
                  Tag: {tag.tag_name} ({tag.count} entries)
                </title>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="p-4 bg-muted/50 text-sm text-muted-foreground flex justify-between">
        <span>
          Displaying {visualTags.length} of {tagsData.length} unique tags and
          their first {MAX_NODES_PER_TAG} entries.
        </span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <circle cx="5" cy="5" r="5" fill="#52eec8" />
            </svg>
            Word
          </span>
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <circle cx="5" cy="5" r="5" fill="#1c3987" />
            </svg>
            Translation
          </span>
        </span>
      </div>
    </div>
  );
}
