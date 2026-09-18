import { useId, useMemo } from "react";
import { Share2 } from "lucide-react";
import { Card } from "@devfellowship/components";
import type { Pack } from "@/types";
import { EDGE_DASH } from "@/consts/pack-graph";
import { packGraph } from "@/lib/pack-graph";
import { PackGraphNode } from "./PackGraphNode";

/**
 * The pack as an Obsidian-style mini graph: a dot per skill,
 * its name, and its author's avatar. It is for reading the shape of the pack,
 * so it does not navigate — the member table below it does.
 */
export function PackGraph({ pack }: { pack: Pack }) {
  // useId yields colons, which break a `url(#…)` reference.
  const prefix = useId().replace(/:/g, "");
  const graph = useMemo(() => packGraph(pack), [pack]);
  if (graph.nodes.length < 2) return null;
  const at = new Map(graph.nodes.map((n) => [n.slug, n]));

  return (
    <Card className="p-[14px]" data-testid="pack-graph">
      <h2 className="mb-[6px] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
        <Share2 className="h-[13px] w-[13px]" />
        Skill graph
      </h2>
      <svg
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`${pack.name}: ${pack.root} linked to ${graph.edges.length} skills`}
      >
        {graph.edges.map((e) => {
          const a = at.get(e.from);
          const b = at.get(e.to);
          if (!a || !b) return null;
          return (
            <line
              key={e.to}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="hsl(212 12% 40%)"
              strokeOpacity={0.7}
              strokeWidth={1}
              strokeDasharray={EDGE_DASH[e.role]}
            />
          );
        })}
        {graph.nodes.map((n, i) => (
          <PackGraphNode key={n.slug} node={n} clipId={`${prefix}-${i}`} />
        ))}
      </svg>
      <p className="m-0 mt-[6px] text-[11px] text-[hsl(212_10%_52%)]">
        Solid: required · dashed: optional · dotted: suggested
      </p>
    </Card>
  );
}
