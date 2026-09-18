import { useId, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { Card } from "@devfellowship/components";
import type { Pack } from "@/types";
import { ENTRANCE_STEP_MS, RING_COLOR } from "@/consts/pack-graph";
import { packGraph } from "@/lib/pack-graph";
import { PackGraphEdge } from "./PackGraphEdge";
import { PackGraphLegend } from "./PackGraphLegend";
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
  const [active, setActive] = useState<string | null>(null);
  if (graph.nodes.length < 2) return null;

  const at = new Map(graph.nodes.map((n) => [n.slug, n]));
  const rootSlug = graph.nodes[0]?.slug;
  const stateOf = (slug: string) =>
    active === null ? "idle" : slug === active ? "active" : slug === rootSlug ? "idle" : "faded";
  const hasUnpublished = graph.nodes.some((n) => !n.published);

  return (
    <Card className="p-[14px]" data-testid="pack-graph">
      <h2 className="mb-[4px] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
        <Share2 className="h-[13px] w-[13px]" />
        Skill graph
      </h2>
      <svg
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`${pack.name}: ${pack.root} linked to ${graph.edges.length} skills`}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <radialGradient id={`${prefix}-halo`} cx="50%" cy="50%" r="46%">
            <stop offset="0" stopColor={RING_COLOR.root} stopOpacity={0.07} />
            <stop offset="1" stopColor={RING_COLOR.root} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={graph.width} height={graph.height} rx={10} fill={`url(#${prefix}-halo)`} />
        {graph.edges.map((e, i) => {
          const a = at.get(e.from);
          const b = at.get(e.to);
          if (!a || !b) return null;
          return (
            <PackGraphEdge
              key={e.to}
              edge={e}
              from={a}
              to={b}
              state={stateOf(e.to)}
              delayMs={(i + 1) * ENTRANCE_STEP_MS}
            />
          );
        })}
        {graph.nodes.map((n, i) => (
          <PackGraphNode
            key={n.slug}
            node={n}
            clipId={`${prefix}-${i}`}
            state={stateOf(n.slug)}
            delayMs={i * ENTRANCE_STEP_MS}
            onHover={setActive}
          />
        ))}
      </svg>
      <PackGraphLegend hasUnpublished={hasUnpublished} />
    </Card>
  );
}
