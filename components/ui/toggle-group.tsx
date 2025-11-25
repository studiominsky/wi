"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

import {
  type ForceGraphMethods,
  type NodeObject,
  type LinkObject,
} from "react-force-graph-2d";

import {
  TagIcon,
  Icon,
  PlusIcon,
  MinusIcon,
  ArrowsOutSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { TagIconMap } from "@/lib/tag-icons";
import { Toggle } from "./toggle";

interface TagEntry {
  id: string | number;
  word: string;
  translation: string;
  tags: string[] | null;
  color: string | null;
  image_url: string | null;
  ai_data: any;
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

const _iconComponentMap: Record<string, Icon> = TagIconMap;

const MAX_NODES_PER_TAG = 4;

type TagGraphNode = NodeObject & {
  id: string;
  kind: "tag";
  tagName: string;
  iconName: string;
  colorClass: string | null;
  count: number;
};

type EntryGraphNode = NodeObject & {
  id: string;
  kind: "entry";
  wordDisplay: string;
  translation: string;
  isNativePhrase: boolean;
  colorClass: string | null;
};

type GraphNode = TagGraphNode | EntryGraphNode;
type GraphLink = LinkObject & {
  source: string | GraphNode;
  target: string | GraphNode;
};

const getColorPalette = (
  colorClass: string | null,
  resolvedTheme: string | undefined
) => {
  const isDark = resolvedTheme === "dark";

  const colorMap = {
    "tag-color-teal": isDark
      ? { bg: "#006666", text: "rgba(30, 232, 232, 1)", border: "#049595" }
      : { bg: "#b9f5e6", text: "#035959", border: "#008080" },
    "tag-color-lime": isDark
      ? { bg: "#455807", text: "#d7ef89", border: "#c4e456" }
      : { bg: "#dff695", text: "#2b3704", border: "#5a720b" },
    "tag-color-blue": isDark
      ? { bg: "#1c3987", text: "#bdd2ff", border: "#0a45c4" }
      : { bg: "#d3ddff", text: "#082684", border: "#082684" },
    "tag-color-orange": isDark
      ? { bg: "#994d00", text: "#f0c187", border: "#bc6c0a" }
      : { bg: "#ffe0c0", text: "#8a4603", border: "#b35900" },
    "tag-color-red": isDark
      ? { bg: "#a42424", text: "#fdd", border: "#5c0b0b" }
      : { bg: "#ffcccc", text: "#840000", border: "#840000" },
    "tag-color-purple": isDark
      ? { bg: "#751296", text: "#ddbbfb", border: "#9a3dec" }
      : { bg: "#eed3ff", text: "#660884", border: "#660884" },
  };

  const defaultColors = isDark
    ? { bg: "#262626", text: "#a3a3a3", border: "#333333" }
    : { bg: "#e5e7eb", text: "#4b5563", border: "#9ca3af" };

  if (!colorClass || !Object.keys(colorMap).includes(colorClass)) {
    return defaultColors;
  }

  return colorMap[colorClass as keyof typeof colorMap] || defaultColors;
};

function paintGraphNode(
  nodeObj: NodeObject,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  resolvedTheme: string | undefined,
  activeTag: string | null,
  relatedNodeIdsByTag: Map<string, Set<string>>
) {
  const node = nodeObj as GraphNode;

  const id = String(node.id);
  const activeSet = activeTag
    ? relatedNodeIdsByTag.get(activeTag) ?? null
    : null;

  const isDimmed = activeSet != null && !activeSet.has(id);

  ctx.save();
  ctx.globalAlpha = isDimmed ? 0.15 : 1;

  if (node.kind === "tag") {
    const label = node.tagName;
    const colors = getColorPalette(node.colorClass ?? null, resolvedTheme);
    const radius = 16;
    const fontSize = 12 / globalScale;

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = colors.bg;
    ctx.fill();
    ctx.lineWidth = 1.5 / globalScale;
    ctx.strokeStyle = colors.border;
    ctx.stroke();

    ctx.font = `${10 / globalScale}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colors.text;
    ctx.fillText(label, node.x!, node.y!);

    if (globalScale > 0.4) {
      ctx.font = `${fontSize}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = colors.text;
      ctx.fillText(label, node.x!, node.y! + radius + 4 / globalScale);
    }
  } else {
    const entry = node as EntryGraphNode;
    const colors = getColorPalette(entry.colorClass ?? null, resolvedTheme);
    const radius = 7;
    const fontSize = 10 / globalScale;

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = colors.bg;
    ctx.fill();

    ctx.lineWidth = 1 / globalScale;
    ctx.strokeStyle = colors.border;
    ctx.stroke();

    if (globalScale > 1) {
      const german = entry.isNativePhrase
        ? entry.translation
        : entry.wordDisplay;
      const native = entry.isNativePhrase
        ? entry.wordDisplay
        : entry.translation;

      ctx.font = `${fontSize}px system-ui`;
      ctx.textAlign = "center";

      ctx.textBaseline = "bottom";
      ctx.fillStyle = colors.text;
      ctx.fillText(german, node.x!, node.y! - radius - 2 / globalScale);

      ctx.textBaseline = "top";
      ctx.fillStyle = resolvedTheme === "dark" ? "#888" : "#9ca3af";
      ctx.fillText(native, node.x!, node.y! + radius + 2 / globalScale);
    }
  }

  ctx.restore();
}

function paintPointerArea(
  nodeObj: NodeObject,
  color: string,
  ctx: CanvasRenderingContext2D
) {
  const node = nodeObj as GraphNode;
  ctx.fillStyle = color;

  if (node.kind === "tag") {
    const radius = 20;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  } else {
    const radius = 10;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}

export function TagNodeGraphFlow({ tagsData }: { tagsData: TagData[] | null }) {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [forcesConfigured, setForcesConfigured] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const initialSpread = 200;

  const getRandomInitialPosition = () => ({
    x: (Math.random() - 0.5) * initialSpread,
    y: (Math.random() - 0.5) * initialSpread,
    vx: 0,
    vy: 0,
  });

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

  const { tagsToDisplay, graphData, relatedNodeIdsByTag, totalItems } =
    useMemo(() => {
      const tagsToDisplay = tagsData
        .filter((t) => t.entries.length > 0)
        .sort((a, b) => a.tag_name.localeCompare(b.tag_name))
        .slice(0, 10);

      const nodesMap = new Map<string, GraphNode>();
      const links: GraphLink[] = [];
      const relatedNodeIdsByTag = new Map<string, Set<string>>();
      let totalEntriesCount = 0;

      const entryKeyToId = new Map<string, string>();
      let entryCounter = 0;

      tagsToDisplay.forEach((tag) => {
        const tagId = `tag-${tag.tag_name}`;
        const tagColors = getColorPalette(tag.color_class, resolvedTheme);

        let relatedSet = relatedNodeIdsByTag.get(tag.tag_name);
        if (!relatedSet) {
          relatedSet = new Set<string>();
          relatedNodeIdsByTag.set(tag.tag_name, relatedSet);
        }

        if (!nodesMap.has(tagId)) {
          nodesMap.set(tagId, {
            id: tagId,
            kind: "tag",
            tagName: tag.tag_name,
            iconName: tag.icon_name,
            colorClass: tag.color_class,
            count: tag.count,
            name: tag.tag_name,
            color: tagColors.bg,
            val: 30,
            ...getRandomInitialPosition(),
          } as TagGraphNode);
        }
        relatedSet.add(tagId);

        tag.entries.slice(0, MAX_NODES_PER_TAG).forEach((entry) => {
          const key = `${entry.wordDisplay}::${entry.translation}`;
          let entryId = entryKeyToId.get(key);

          if (!entryId) {
            entryId = `entry-${entryCounter++}`;
            entryKeyToId.set(key, entryId);
            const entryColors = getColorPalette(entry.color, resolvedTheme);
            totalEntriesCount++;

            nodesMap.set(entryId, {
              id: entryId,
              kind: "entry",
              wordDisplay: entry.wordDisplay,
              translation: entry.translation,
              isNativePhrase: entry.isNativePhrase,
              name: entry.wordDisplay,
              colorClass: entry.color,
              color: entryColors.bg,
              val: 3,
              ...getRandomInitialPosition(),
            } as EntryGraphNode);
          }

          relatedSet.add(entryId);

          links.push({
            source: tagId,
            target: entryId,
          } as GraphLink);
        });
      });

      return {
        tagsToDisplay,
        graphData: { nodes: Array.from(nodesMap.values()), links },
        relatedNodeIdsByTag,
        totalItems: totalEntriesCount,
      };
    }, [tagsData, resolvedTheme, shuffleKey]);

  const handleLegendClick = (tagName: string) => {
    setActiveTag((prev) => (prev === tagName ? null : tagName));
  };

  const TagLegendItem = ({ tag }: { tag: TagData }) => {
    const IconComponent = _iconComponentMap[tag.icon_name] || TagIcon;
    const colors = getColorPalette(tag.color_class, resolvedTheme);
    const isSelected = activeTag === tag.tag_name;
    const opacity = activeTag && !isSelected ? 0.4 : 1;

    const baseClasses =
      "cursor-pointer relative inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-muted/50 text-muted-foreground opacity-80";

    const customClasses = "h-8 px-3 gap-1.5 shrink-0";

    const activeClasses = isSelected
      ? "bg-background shadow-md ring-2 ring-primary/30 opacity-100 border-primary text-foreground"
      : "bg-background/40 hover:bg-muted/70";

    const tagTextElementColor = isSelected ? colors.text : "var(--foreground)";
    const tagCountElementColor = isSelected
      ? colors.text
      : "var(--muted-foreground)";

    return (
      <Toggle
        type="button"
        onClick={() => handleLegendClick(tag.tag_name)}
        className={cn(baseClasses, customClasses, activeClasses, "group/item")}
        style={{ opacity: opacity }}
        data-state={isSelected ? "on" : "off"}
        aria-pressed={isSelected}
      >
        <div
          className="size-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
          }}
        >
          <IconComponent
            className="w-3 h-3 transition-colors"
            style={{ color: colors.text }}
            weight="bold"
          />
        </div>
        <span
          className="capitalize transition-colors"
          style={{ color: tagTextElementColor }}
        >
          {tag.tag_name}
        </span>
        <span
          className="transition-colors"
          style={{ color: tagCountElementColor }}
        >
          ({tag.count})
        </span>
      </Toggle>
    );
  };

  const randomizeLayout = () => {
    setForcesConfigured(false);
    setShuffleKey((prev) => prev + 1);
    fgRef.current?.zoomToFit(0, 400);
  };

  if (tagsToDisplay.length === 0) {
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

  useEffect(() => {
    setForcesConfigured(false);
  }, [graphData]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        setSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const nodeCanvasObject = useCallback(
    (
      nodeObj: NodeObject,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      paintGraphNode(
        nodeObj,
        ctx,
        globalScale,
        resolvedTheme,
        activeTag,
        relatedNodeIdsByTag
      );
    },
    [resolvedTheme, activeTag, relatedNodeIdsByTag]
  );

  const linkColor = useCallback(
    (linkObj: LinkObject) => {
      const baseStrong =
        resolvedTheme === "dark"
          ? "rgba(148,163,184,0.9)"
          : "rgba(148,163,184,0.9)";
      const baseDim =
        resolvedTheme === "dark"
          ? "rgba(55,65,81,0.2)"
          : "rgba(148,163,184,0.15)";

      if (!activeTag) {
        return baseStrong;
      }

      const activeSet = relatedNodeIdsByTag.get(activeTag);
      if (!activeSet) return baseStrong;

      const link = linkObj as GraphLink;

      const sourceId =
        typeof link.source === "object"
          ? String((link.source as any).id)
          : String(link.source);
      const targetId =
        typeof link.target === "object"
          ? String((link.target as any).id)
          : String(link.target);

      const isInActive = activeSet.has(sourceId) && activeSet.has(targetId);

      if (isInActive) {
        const tagNode = graphData.nodes.find(
          (n) => n.id === `tag-${activeTag}`
        ) as TagGraphNode;
        if (tagNode?.colorClass) {
          const colors = getColorPalette(tagNode.colorClass, resolvedTheme);
          return colors.border;
        }
        return baseStrong;
      } else {
        return baseDim;
      }
    },
    [activeTag, relatedNodeIdsByTag, resolvedTheme, graphData.nodes]
  );

  const nodeLabel = (nodeObj: NodeObject) => {
    const node = nodeObj as GraphNode;
    if (node.kind === "tag") {
      return `${node.tagName} (${node.count} entries)`;
    }
    const e = node as EntryGraphNode;
    const german = e.isNativePhrase ? e.translation : e.wordDisplay;
    const native = e.isNativePhrase ? e.wordDisplay : e.translation;
    return `German: ${german}\nNative: ${native}`;
  };

  const handleNodeClick = (nodeObj: NodeObject) => {
    const node = nodeObj as GraphNode;
    if (!fgRef.current || node.x == null || node.y == null) return;

    fgRef.current.centerAt(node.x, node.y, 400);
  };

  const zoomIn = () => {
    if (!fgRef.current) return;
    const currZoom = fgRef.current.zoom();
    fgRef.current.zoom(currZoom * 1.2, 300);
  };

  const zoomOut = () => {
    if (!fgRef.current) return;
    const currZoom = fgRef.current.zoom();
    fgRef.current.zoom(currZoom / 1.2, 300);
  };

  const fitView = () => {
    if (!fgRef.current) return;
    fgRef.current.zoomToFit(0, 40);
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-card">
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: "60vh", minHeight: 380 }}
      >
        {size.width > 0 && size.height > 0 && (
          <ForceGraph2D
            key={shuffleKey}
            ref={fgRef as any}
            graphData={graphData}
            width={size.width}
            height={size.height}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={paintPointerArea}
            nodeLabel={nodeLabel}
            backgroundColor="transparent"
            linkColor={linkColor as any}
            linkWidth={1.2}
            linkCurvature={0}
            linkDirectionalParticles={0}
            cooldownTicks={70}
            d3VelocityDecay={0.9}
            onNodeClick={handleNodeClick}
            onEngineTick={() => {
              if (forcesConfigured || !fgRef.current) return;
              const fg = fgRef.current as any;

              const chargeForce = fg.d3Force?.("charge");
              if (chargeForce && typeof chargeForce.strength === "function") {
                chargeForce.strength(-800).distanceMax(600);
              }

              const linkForce = fg.d3Force?.("link");
              if (linkForce && typeof linkForce.distance === "function") {
                linkForce.distance(40).strength(0.8);
              }

              fg.d3ReheatSimulation?.();
              setForcesConfigured(true);
            }}
          />
        )}

        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={randomizeLayout}
            className="flex items-center justify-center rounded-md border border-border bg-background/90 shadow-sm w-8 h-8 hover:bg-accent transition-colors"
            aria-label="Rearrange graph"
            title="Rearrange graph layout"
          >
            <SparkleIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="flex items-center justify-center rounded-md border border-border bg-background/90 shadow-sm w-8 h-8 hover:bg-accent transition-colors"
            aria-label="Zoom in"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className="flex items-center justify-center rounded-md border border-border bg-background/90 shadow-sm w-8 h-8 hover:bg-accent transition-colors"
            aria-label="Zoom out"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={fitView}
            className="flex items-center justify-center rounded-md border border-border bg-background/90 shadow-sm w-8 h-8 hover:bg-accent transition-colors"
            aria-label="Center graph"
          >
            <ArrowsOutSimpleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-muted/60 text-xs md:text-sm text-muted-foreground flex flex-col gap-2">
        <span className="text-base font-medium text-foreground/80">
          Displaying {tagsToDisplay.length} of {tagsData.length} tags and{" "}
          {totalItems} unique entries (max {MAX_NODES_PER_TAG} per tag).
        </span>
        <h4 className="text-sm font-semibold mt-1 mb-0 text-foreground">
          Tags Legend (Click to Filter)
        </h4>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {tagsToDisplay.map((tag) => (
            <TagLegendItem key={tag.tag_name} tag={tag} />
          ))}
          {activeTag && (
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1.5 shrink-0 text-destructive hover:text-destructive/80 transition-opacity"
            >
              <span className="underline">Clear Filter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
