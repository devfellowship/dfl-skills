import type { GraphNode } from "@/types";
import { RING_COLOR } from "@/consts/pack-graph";
import { githubAvatarUrl } from "@/lib/format";

export function PackGraphNode({ node, clipId }: { node: GraphNode; clipId: string }) {
  const { x, y, r } = node;
  return (
    <g data-testid="pack-graph-node" data-slug={node.slug} opacity={node.published ? 1 : 0.55}>
      <title>
        {node.slug} · {node.role}
        {node.author ? ` · by ${node.author}` : ""}
        {node.published ? "" : " · not published"}
      </title>
      <circle cx={x} cy={y} r={r} fill="hsl(215 18% 16%)" />
      {node.author && (
        <>
          <clipPath id={clipId}>
            <circle cx={x} cy={y} r={r} />
          </clipPath>
          <image
            href={githubAvatarUrl(node.author)}
            x={x - r}
            y={y - r}
            width={r * 2}
            height={r * 2}
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
        stroke={RING_COLOR[node.role]}
        strokeWidth={node.role === "root" ? 2 : 1.5}
        strokeDasharray={node.published ? undefined : "2 2"}
      />
      <text
        x={x}
        y={y + r + 11}
        textAnchor="middle"
        strokeWidth={3}
        className="fill-[hsl(212_13%_72%)] stroke-card text-[9.5px] [paint-order:stroke]"
        fontWeight={node.role === "root" ? 600 : 400}
      >
        {node.label}
      </text>
    </g>
  );
}
