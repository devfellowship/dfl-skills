import type { PluginDetail, PluginNode } from "./plugins";
export interface PositionedPluginNode extends PluginNode { x: number; y: number; width: number; height: number }
/** Full labels get their own card. The canvas grows; labels are never truncated to force a small graph. */
export function layoutPluginGraph(detail: PluginDetail, availableWidth = 1068) {
  if (availableWidth < 640) {
    const canvasWidth = Math.max(280, availableWidth), width = canvasWidth - 96;
    let y = 20;
    const nodes = ["plugin", "pack", "skill"].flatMap(kind => detail.nodes.filter(n => n.kind === kind)).map(n => {
      const height = 105 + Math.max(1, Math.ceil(Array.from(n.name).length / 21)) * 24 + Math.ceil(n.source.length / 23) * 18;
      const card = { ...n, x: 48, y, width, height };
      y += height + 34;
      return card;
    });
    return { width: canvasWidth, height: y, nodes, edges: detail.edges, vertical: true };
  }
  const gap = 22, width = 250;
  const height = (n: PluginNode) => 100 + Math.max(1, Math.ceil(Array.from(n.name).length / 24)) * 22 + Math.ceil(n.source.length / 26) * 18;
  const columns = ["plugin", "pack", "skill"].map(kind => detail.nodes.filter(n => n.kind === kind));
  const totals = columns.map(nodes => nodes.reduce((sum, n) => sum + height(n) + gap, 0));
  const directCount = detail.edges.filter(e => e.role === "direct").length;
  const header = 40 + directCount * 24;
  const canvasHeight = Math.max(260, ...totals) + header + 40;
  const positioned: PositionedPluginNode[] = columns.flatMap((nodes, col) => {
    let y = header + (canvasHeight - header - 40 - (totals[col] ?? 0)) / 2;
    return nodes.map(n => {
      const card = { ...n, x: 24 + col * 385, y, width, height: height(n) };
      y += card.height + gap;
      return card;
    });
  });
  return { width: 1068, height: canvasHeight, nodes: positioned, edges: detail.edges, vertical: false };
}
export function incomingPluginEdges(detail: PluginDetail, id: string) {
  return detail.edges.filter(e => e.to === id).sort((a, b) => a.ordinal - b.ordinal);
}
export function compositionGroups(detail: PluginDetail) {
  return detail.nodes.filter(n => n.kind !== "skill").map(parent => ({
    parent,
    members: detail.edges.filter(e => e.from === parent.id).sort((a, b) => a.ordinal - b.ordinal)
      .map(edge => ({ edge, node: detail.nodes.find(n => n.id === edge.to)! })),
  }));
}
