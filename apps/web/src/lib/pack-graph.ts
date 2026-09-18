import type { GraphNode, Pack, PackGraph } from "@/types";
import { memberAuthor } from "./packs";

const LABEL_MAX = 18;
const LABEL_HALF_WIDTH = 56;
const LABEL_HEIGHT = 26;
const ROW_HEIGHT = 30;
const MIN_HEIGHT = 240;
const MAX_HEIGHT = 380;

export function graphLabel(slug: string): string {
  return slug.length > LABEL_MAX ? `${slug.slice(0, LABEL_MAX - 1)}…` : slug;
}

export function graphHeight(memberCount: number): number {
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, 80 + ROW_HEIGHT * memberCount));
}

/**
 * A pack is a router and the skills it sends the agent to, so the graph is a
 * star: the root in the centre, one edge to each member. Members walk down an
 * ellipse in manifest order, alternating sides, so every node has its own
 * row and labels never share a line. The role is carried by the edge and the
 * ring, not the distance.
 */
export function packGraph(pack: Pack, width = 320, height?: number): PackGraph {
  const root = pack.members.find((m) => m.slug === pack.root) ?? pack.members[0];
  if (!root) return { width, height: height ?? MIN_HEIGHT, nodes: [], edges: [] };
  const others = pack.members.filter((m) => m !== root);
  const h = height ?? graphHeight(others.length);
  const cx = width / 2;
  const cy = h / 2;
  const rx = cx - LABEL_HALF_WIDTH;
  const ry = cy - LABEL_HEIGHT;

  const nodes: GraphNode[] = [
    {
      slug: root.slug,
      label: graphLabel(root.slug),
      role: "root",
      author: memberAuthor(root),
      published: root.status === "in_catalogue",
      x: cx,
      y: cy,
      r: 14,
    },
  ];

  others.forEach((m, i) => {
    const t = -1 + (2 * i + 1) / others.length;
    const side = i % 2 === 0 ? -1 : 1;
    const spread = Math.sqrt(1 - t * t);
    nodes.push({
      slug: m.slug,
      label: graphLabel(m.slug),
      role: m.role,
      author: memberAuthor(m),
      published: m.status === "in_catalogue",
      x: round(cx + side * rx * Math.max(spread, 0.35)),
      y: round(cy + ry * t),
      r: m.role === "suggested" ? 8 : 10,
    });
  });

  const edges = others.map((m) => ({ from: root.slug, to: m.slug, role: m.role }));
  return { width, height: h, nodes, edges };
}

/** A gently bowed path from the root to a member, so the star reads as organic rather than spoked. */
export function edgePath(a: GraphNode, b: GraphNode): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const mx = (a.x + b.x) / 2 - dy * 0.12;
  const my = (a.y + b.y) / 2 + dx * 0.12;
  return `M${a.x} ${a.y} Q${round(mx)} ${round(my)} ${b.x} ${b.y}`;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
