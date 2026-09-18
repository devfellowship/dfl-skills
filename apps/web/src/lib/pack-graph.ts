import type { GraphNode, Pack, PackGraph } from "@/types";
import { memberAuthor } from "./packs";

const LABEL_MAX = 18;

export function graphLabel(slug: string): string {
  return slug.length > LABEL_MAX ? `${slug.slice(0, LABEL_MAX - 1)}…` : slug;
}

/**
 * A pack is a router and the skills it sends the agent to, so the graph is a
 * star: the root in the centre, one edge to each member, spread evenly in
 * manifest order. Every other member is pulled in so neighbouring labels never
 * share a line. The role is carried by the edge and the ring, not the distance.
 */
export function packGraph(pack: Pack, width = 320, height = 280): PackGraph {
  const cx = width / 2;
  const cy = height / 2;
  // Room for a label under the lowest node and half a label beside the widest.
  const rx = cx - 52;
  const ry = cy - 26;

  const root = pack.members.find((m) => m.slug === pack.root) ?? pack.members[0];
  if (!root) return { width, height, nodes: [], edges: [] };
  const others = pack.members.filter((m) => m !== root);

  const nodes: GraphNode[] = [
    {
      slug: root.slug,
      label: graphLabel(root.slug),
      role: "root",
      author: memberAuthor(root),
      published: root.status === "in_catalogue",
      x: cx,
      y: cy,
      r: 13,
    },
  ];

  others.forEach((m, i) => {
    const step = (2 * Math.PI) / others.length;
    // Half a step off vertical, so no member sits right on top of the root's label.
    const angle = -Math.PI / 2 + step / 2 + step * i;
    const ring = i % 2 === 1 ? 0.62 : 1;
    nodes.push({
      slug: m.slug,
      label: graphLabel(m.slug),
      role: m.role,
      author: memberAuthor(m),
      published: m.status === "in_catalogue",
      x: round(cx + Math.cos(angle) * rx * ring),
      y: round(cy + Math.sin(angle) * ry * ring),
      r: m.role === "suggested" ? 7 : 9,
    });
  });

  const edges = others.map((m) => ({ from: root.slug, to: m.slug, role: m.role }));
  return { width, height, nodes, edges };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
