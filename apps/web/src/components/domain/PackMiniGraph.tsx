import { useId, useMemo } from "react";
import type { Pack } from "@/types";
import { EDGE_COLOR, EDGE_DASH, NODE_FILL, RING_COLOR, UNPUBLISHED_OPACITY } from "@/consts/pack-graph";
import { miniGraph } from "@/lib/pack-home";

interface PackMiniGraphProps {
  pack: Pack;
  size?: number;
  className?: string;
}

/** The pack page graph as a glyph: same colours and dashes, no labels. */
export function PackMiniGraph({ pack, size, className = "" }: PackMiniGraphProps) {
  const prefix = useId().replace(/:/g, "");
  const g = useMemo(() => miniGraph(pack, size), [pack, size]);
  if (!g.root) return null;
  const { root } = g;

  return (
    <svg
      viewBox={`0 0 ${g.size} ${g.size}`}
      width={g.size}
      height={g.size}
      className={`block shrink-0 ${className}`}
      aria-hidden="true"
      data-testid="pack-mini-graph"
    >
      <defs>
        <radialGradient id={`${prefix}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={RING_COLOR.root} stopOpacity={0.16} />
          <stop offset="1" stopColor={RING_COLOR.root} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={root.x} cy={root.y} r={g.size / 2} fill={`url(#${prefix}-halo)`} />
      {g.members.map((m) => (
        <line
          key={`e-${m.slug}`}
          x1={root.x}
          y1={root.y}
          x2={m.x}
          y2={m.y}
          stroke={EDGE_COLOR}
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray={EDGE_DASH[m.role]}
          opacity={m.published ? 0.9 : UNPUBLISHED_OPACITY}
        />
      ))}
      {g.members.map((m) => (
        <g key={m.slug} opacity={m.published ? 1 : UNPUBLISHED_OPACITY}>
          <circle cx={m.x} cy={m.y} r={m.r + 2} fill="var(--color-card)" />
          <circle
            cx={m.x}
            cy={m.y}
            r={m.r}
            fill={NODE_FILL}
            stroke={RING_COLOR[m.role]}
            strokeWidth={1.3}
            strokeDasharray={m.published ? undefined : "2 2"}
          />
        </g>
      ))}
      <circle cx={root.x} cy={root.y} r={root.r + 6} fill={RING_COLOR.root} opacity={0.14} />
      <circle cx={root.x} cy={root.y} r={root.r + 2.5} fill="var(--color-card)" />
      <circle cx={root.x} cy={root.y} r={root.r} fill={NODE_FILL} stroke={RING_COLOR.root} strokeWidth={2} />
      <circle cx={root.x} cy={root.y} r={root.r * 0.36} fill={RING_COLOR.root} />
    </svg>
  );
}
