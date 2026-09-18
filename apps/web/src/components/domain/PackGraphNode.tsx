import type { GraphNode } from "@/types";
import {
  FADED_OPACITY,
  LABEL_ACTIVE_COLOR,
  LABEL_COLOR,
  NODE_FILL,
  RING_COLOR,
  UNPUBLISHED_OPACITY,
} from "@/consts/pack-graph";
import { githubAvatarUrl } from "@/lib/format";

interface PackGraphNodeProps {
  node: GraphNode;
  clipId: string;
  state: "idle" | "active" | "faded";
  delayMs: number;
  onHover: (slug: string | null) => void;
}

export function PackGraphNode({ node, clipId, state, delayMs, onHover }: PackGraphNodeProps) {
  const { x, y, r } = node;
  const color = RING_COLOR[node.role];
  const active = state === "active";
  const isRoot = node.role === "root";
  const opacity = state === "faded" ? FADED_OPACITY : node.published ? 1 : UNPUBLISHED_OPACITY;
  const avatarR = r - 2;

  return (
    <g
      data-testid="pack-graph-node"
      data-slug={node.slug}
      className="cursor-default transition-opacity duration-200"
      opacity={opacity}
      onMouseEnter={() => onHover(node.slug)}
      onMouseLeave={() => onHover(null)}
    >
      <title>
        {node.slug} · {node.role}
        {node.author ? ` · by ${node.author}` : ""}
        {node.published ? "" : " · not published"}
      </title>
      <g className="animate-fadeUp" style={{ animationDelay: `${delayMs}ms` }}>
        <circle
          cx={x}
          cy={y}
          r={r + (isRoot ? 8 : 5)}
          fill={color}
          className="transition-opacity duration-200"
          opacity={active ? 0.28 : isRoot ? 0.14 : 0}
        />
        <circle cx={x} cy={y} r={r + 3} fill="var(--color-card)" />
        <circle cx={x} cy={y} r={r} fill={NODE_FILL} />
        {node.author && (
          <>
            <clipPath id={clipId}>
              <circle cx={x} cy={y} r={avatarR} />
            </clipPath>
            <image
              href={githubAvatarUrl(node.author)}
              x={x - avatarR}
              y={y - avatarR}
              width={avatarR * 2}
              height={avatarR * 2}
              clipPath={`url(#${clipId})`}
              preserveAspectRatio="xMidYMid slice"
            />
          </>
        )}
        <circle
          cx={x}
          cy={y}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={isRoot || active ? 2 : 1.5}
          strokeDasharray={node.published ? undefined : "2.5 2.5"}
          className="transition-[stroke-width] duration-200"
        />
        <text
          x={x}
          y={y + r + 12}
          textAnchor="middle"
          strokeWidth={3}
          fill={active ? LABEL_ACTIVE_COLOR : LABEL_COLOR}
          fontSize={isRoot ? 10.5 : 9.5}
          fontWeight={isRoot || active ? 600 : 450}
          className="stroke-card transition-[fill] duration-200 [paint-order:stroke]"
        >
          {node.label}
        </text>
      </g>
    </g>
  );
}
