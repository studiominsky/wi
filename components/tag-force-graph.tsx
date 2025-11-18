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

const iconComponentMap: Record<string, Icon> = TagIconMap;

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

function paintGraphNode(
  nodeObj: NodeObject,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  const node = nodeObj as GraphNode;
  const label =
    node.kind === "tag" ? node.tagName : (node as EntryGraphNode).wordDisplay;
  const fontSize = node.kind === "tag" ? 12 / globalScale : 10 / globalScale;

  if (node.kind === "tag") {
    const colors = getTagColors(node.colorClass ?? null);
    const radius = 14;

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = colors.bg;
    ctx.fill();
    ctx.lineWidth = 1.5 / globalScale;
    ctx.strokeStyle = "#020617";
    ctx.stroke();

    ctx.font = `${11 / globalScale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colors.text;
    const textInside =
      node.tagName.length > 0 ? node.tagName[0].toUpperCase() : "T";
    ctx.fillText(textInside, node.x!, node.y!);

    if (globalScale > 0.4) {
      ctx.font = `${fontSize}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(label, node.x!, node.y! + radius + 4 / globalScale);
    }
  } else {
    const entry = node as EntryGraphNode;
    const radius = 6;

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = entry.isNativePhrase ? "#0ea5e9" : "#22c55e";
    ctx.fill();

    if (globalScale > 1) {
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#cbd5f5";
      ctx.fillText(label, node.x!, node.y! - radius - 2 / globalScale);
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
    const radius = 16;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  } else {
    const radius = 8;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}

export function TagNodeGraphFlow({ tagsData }: { tagsData: TagData[] | null }) {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [hasInitialFit, setHasInitialFit] = useState(false);

  // Empty state
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

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    tagsToDisplay.forEach((tag) => {
      const tagId = `tag-${tag.tag_name}`;
      const colors = getTagColors(tag.color_class);

      nodes.push({
        id: tagId,
        kind: "tag",
        tagName: tag.tag_name,
        iconName: tag.icon_name,
        colorClass: tag.color_class,
        count: tag.count,
        name: tag.tag_name,
        color: colors.bg,
        val: 6 + Math.min(tag.entries.length, MAX_NODES_PER_TAG),
      } as TagGraphNode);

      tag.entries.slice(0, MAX_NODES_PER_TAG).forEach((entry, idx) => {
        const entryId = `entry-${tag.tag_name}-${entry.id}-${idx}`;

        nodes.push({
          id: entryId,
          kind: "entry",
          wordDisplay: entry.wordDisplay,
          translation: entry.translation,
          isNativePhrase: entry.isNativePhrase,
          name: entry.wordDisplay,
          color: entry.isNativePhrase ? "#0ea5e9" : "#22c55e",
          val: 2,
        } as EntryGraphNode);

        links.push({
          source: tagId,
          target: entryId,
        } as GraphLink);
      });
    });

    return { tagsToDisplay, graphData: { nodes, links } };
  }, [tagsData]);

  // If still nothing after filtering
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
    setHasInitialFit(false);
  }, [tagsData]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
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
      return `${node.tagName} (${node.count})`;
    }
    const e = node as EntryGraphNode;
    return `${e.wordDisplay} – ${e.translation}`;
  };

  const handleNodeClick = (nodeObj: NodeObject) => {
    const node = nodeObj as GraphNode;
    if (!fgRef.current || node.x == null || node.y == null) return;

    fgRef.current.centerAt(node.x, node.y, 600);
    fgRef.current.zoom(2, 600);
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
    fgRef.current.zoomToFit(400, 40);
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-card/60">
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: "60vh", minHeight: 380 }}
      >
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
          onEngineStop={() => {
            if (!fgRef.current) return;
            if (!hasInitialFit) {
              fgRef.current.zoomToFit(400, 40);
              setHasInitialFit(true);
            }
          }}
        />

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
          {MAX_NODES_PER_TAG} entries per tag.
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            Word
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
            Translation
          </span>
        </span>
      </div>
    </div>
  );
}
