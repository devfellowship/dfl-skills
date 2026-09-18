import type { GraphEdge, GraphNode } from "@/types";
import { EDGE_COLOR, EDGE_DASH, FADED_OPACITY, RING_COLOR } from "@/consts/pack-graph";
import { edgePath } from "@/lib/pack-graph";

interface PackGraphEdgeProps {
  edge: GraphEdge;
  from: GraphNode;
  to: GraphNode;
  state: "idle" | "active" | "faded";
  delayMs: number;
}

export function PackGraphEdge({ edge, from, to, state, delayMs }: PackGraphEdgeProps) {
  const d = edgePath(from, to);
  const active = state === "active";
  return (
    <g
      className="transition-opacity duration-200"
      opacity={state === "faded" ? FADED_OPACITY : to.published ? 1 : 0.5}
      data-testid="pack-graph-edge"
    >
      <g className="animate-fadeUp" style={{ animationDelay: `${delayMs}ms` }}>
        <path
          d={d}
          fill="none"
          stroke={RING_COLOR[edge.role]}
          strokeWidth={6}
          strokeLinecap="round"
          className="transition-opacity duration-200"
          opacity={active ? 0.22 : 0}
        />
        <path
          d={d}
          fill="none"
          stroke={active ? RING_COLOR[edge.role] : EDGE_COLOR}
          strokeWidth={active ? 1.6 : 1.1}
          strokeLinecap="round"
          strokeDasharray={EDGE_DASH[edge.role]}
          className="transition-[stroke,stroke-width] duration-200"
        />
      </g>
    </g>
  );
}
