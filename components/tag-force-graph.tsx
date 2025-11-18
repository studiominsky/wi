"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import dynamic from "next/dynamic";

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
} from "@phosphor-icons/react";
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
type GraphLink = LinkObject & { source: string; target: string };

const getTagColors = (colorClass: string | null) => {
  switch (colorClass) {
    case "tag-color-teal":
      return { bg: "#0f766e", text: "#e5f9f4" };
    case "tag-color-blue":
      return { bg: "#1d4ed8", text: "#e0ecff" };
    case "tag-color-orange":
      return { bg: "#c2410c", text: "#ffe7d1" };
    case "tag-color-red":
      return { bg: "#b91c1c", text: "#ffe2e2" };
    case "tag-color-purple":
      return { bg: "#7e22ce", text: "#f3e8ff" };
    default:
      return { bg: "#111827", text: "#e5e7eb" };
  }
};

const getEntryColors = (colorClass: string | null) => {
  switch (colorClass) {
    case "tag-color-teal":
      return { bg: "#2d9c94", text: "#e5f9f4" };
    case "tag-color-blue":
      return { bg: "#4277f0", text: "#e0ecff" };
    case "tag-color-orange":
      return { bg: "#d97706", text: "#ffe7d1" };
    case "tag-color-red":
      return { bg: "#dc2626", text: "#ffe2e2" };
    case "tag-color-purple":
      return { bg: "#9333ea", text: "#f3e8ff" };
    default:
      return { bg: "#6b7280", text: "#e5e7eb" };
  }
};

function paintGraphNode(
  nodeObj: NodeObject,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  const node = nodeObj as GraphNode;

  if (node.kind === "tag") {
    const label = node.tagName;
    const colors = getTagColors(node.colorClass ?? null);
    const radius = 16;
    const fontSize = 12 / globalScale;

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = colors.bg;
    ctx.fill();
    ctx.lineWidth = 1.5 / globalScale;
    ctx.strokeStyle = "#020617";
    ctx.stroke();

    ctx.font = `${10 / globalScale}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colors.text;
    const glyph = label;
    ctx.fillText(glyph, node.x!, node.y!);

    if (globalScale > 0.4) {
      ctx.font = `${fontSize}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(label, node.x!, node.y! + radius + 4 / globalScale);
    }
  } else {
    const entry = node as EntryGraphNode;
    const colors = getEntryColors(entry.colorClass ?? null);
    const radius = 7;
    const fontSize = 10 / globalScale;

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = colors.bg;
    ctx.fill();

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
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(german, node.x!, node.y! - radius - 2 / globalScale);

      ctx.textBaseline = "top";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(native, node.x!, node.y! + radius + 2 / globalScale);
    }
  }
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

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [forcesConfigured, setForcesConfigured] = useState(false);

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

  const { tagsToDisplay, graphData } = useMemo(() => {
    const tagsToDisplay = tagsData
      .filter((t) => t.entries.length > 0)
      .sort((a, b) => a.tag_name.localeCompare(b.tag_name))
      .slice(0, 10);

    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    const entryKeyToId = new Map<string, string>();
    let entryCounter = 0;

    tagsToDisplay.forEach((tag) => {
      const tagId = `tag-${tag.tag_name}`;
      const tagColors = getTagColors(tag.color_class);

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
        } as TagGraphNode);
      }

      tag.entries.slice(0, MAX_NODES_PER_TAG).forEach((entry) => {
        const key = `${entry.wordDisplay}::${entry.translation}`;
        let entryId = entryKeyToId.get(key);

        if (!entryId) {
          entryId = `entry-${entryCounter++}`;
          entryKeyToId.set(key, entryId);

          const entryColors = getEntryColors(tag.color_class);

          nodesMap.set(entryId, {
            id: entryId,
            kind: "entry",
            wordDisplay: entry.wordDisplay,
            translation: entry.translation,
            isNativePhrase: entry.isNativePhrase,
            name: entry.wordDisplay,
            colorClass: tag.color_class,
            color: entryColors.bg,
            val: 3,
          } as EntryGraphNode);
        }

        links.push({
          source: tagId,
          target: entryId,
        } as GraphLink);
      });
    });

    return {
      tagsToDisplay,
      graphData: { nodes: Array.from(nodesMap.values()), links },
    };
  }, [tagsData]);

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
      paintGraphNode(nodeObj, ctx, globalScale);
    },
    []
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
    <div className="border rounded-lg shadow-lg overflow-hidden bg-card/60">
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: "60vh", minHeight: 380 }}
      >
        {size.width > 0 && size.height > 0 && (
          <ForceGraph2D
            ref={fgRef as any}
            graphData={graphData}
            width={size.width}
            height={size.height}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={paintPointerArea}
            nodeLabel={nodeLabel}
            backgroundColor="transparent"
            linkColor={() => "rgba(148,163,184,0.6)"}
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

      <div className="p-4 bg-muted/60 text-xs md:text-sm text-muted-foreground flex justify-between flex-wrap gap-2">
        <span>
          Displaying {tagsToDisplay.length} of {tagsData.length} tags and up to{" "}
          {MAX_NODES_PER_TAG} entries per tag (deduplicated).
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: getEntryColors(
                  tagsToDisplay[0]?.color_class || null
                ).bg,
              }}
            />
            Entry nodes (German + native)
          </span>
        </span>
      </div>
    </div>
  );
}
