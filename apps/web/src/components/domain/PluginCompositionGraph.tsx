import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card } from "@devfellowship/components";
import type { PluginDetail, PluginNode } from "@/lib/plugins";
import { pluginNodeHref, pluginNodeSourceHref } from "@/lib/plugins";
import { compositionGroups, incomingPluginEdges, layoutPluginGraph } from "@/lib/plugin-graph";

function NodeLinks({ node }: { node: PluginNode }) {
  return <div className="mt-2 flex flex-wrap gap-4 text-sm">
    {node.kind !== "plugin" && <Link className="text-primary underline" to={pluginNodeHref(node)}>Current {node.kind} details</Link>}
    <a className="text-primary underline" href={pluginNodeSourceHref(node)} target="_blank" rel="noopener noreferrer">Pinned source</a>
  </div>;
}

/** The main graph and its linear equivalent read the same authorized release response. */
export function PluginCompositionGraph({ detail }: { detail: PluginDetail }) {
  const arrowId = `plugin-arrow-${useId().replace(/:/g, "")}`;
  const container = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(1068);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width) setAvailableWidth(Math.floor(width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const graph = useMemo(() => layoutPluginGraph(detail, availableWidth), [detail, availableWidth]);
  const at = new Map(graph.nodes.map(n => [n.id, n]));
  const [active, setActive] = useState<string | null>(null);
  const selectedNode = detail.nodes.find(n => n.id === active);
  const incoming = active ? incomingPluginEdges(detail, active) : [];
  return <section aria-labelledby="plugin-composition-heading" className="mt-8">
    <h2 id="plugin-composition-heading" className="text-xl font-semibold">Release composition</h2>
    <p className="mt-2 text-sm text-muted-foreground">Packs group their skills. Direct skills connect to the plugin. A shared skill appears once with all its connections.</p>
    <div className="my-4 flex flex-wrap gap-2 text-sm" aria-label="Composition legend">
      <Badge variant="outline">Plugin</Badge><Badge variant="outline">Pack</Badge><Badge variant="outline">Skill</Badge>
      <span>Solid: selected in this release. Dashed: candidate.</span>
    </div>
    <Card className="overflow-hidden">
      <div ref={container} className="lo-scroll overflow-x-auto p-2" tabIndex={0} role="region" aria-label="Scrollable plugin graph. An equivalent composition list follows.">
        <svg width={graph.width} height={graph.height} viewBox={`0 0 ${graph.width} ${graph.height}`} role="group" aria-label="Plugin, packs and skills" data-testid="plugin-graph" className="block">
          <defs><marker id={arrowId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#8492a6" /></marker></defs>
          {graph.edges.map(e => {
            const a = at.get(e.from)!, b = at.get(e.to)!;
            const incomingEdges = graph.edges.filter(edge => edge.to === b.id);
            const port = incomingEdges.indexOf(e);
            const x1 = graph.vertical && e.role !== "direct" ? a.x : a.x + a.width, y1 = a.y + a.height / 2, x2 = graph.vertical && e.role === "direct" ? b.x + b.width : b.x,
              y2 = b.y + b.height * (port + 1) / (incomingEdges.length + 1);
            const lane = 20 + graph.edges.filter(edge => edge.role === "direct").indexOf(e) * 24;
            const railEdges = graph.edges.filter(edge => (edge.role === "direct") === (e.role === "direct"));
            const railIndex = railEdges.indexOf(e);
            const rail = graph.vertical ? (e.role === "direct" ? graph.width - 12 - railIndex * 26 / Math.max(1, railEdges.length - 1) : 12 + railIndex * 26 / Math.max(1, railEdges.length - 1)) : 0;
            const path = graph.vertical
              ? `M${x1} ${y1} L${rail} ${y1} L${rail} ${y2} L${x2} ${y2}`
              : e.role === "direct"
              ? `M${x1} ${y1} C${x1 + 30} ${y1},${x1 + 30} ${lane},${x1 + 70} ${lane} L${x2 - 70} ${lane} C${x2 - 25} ${lane},${x2 - 25} ${y2},${x2} ${y2}`
              : `M${x1} ${y1} C${x1 + 65} ${y1},${x2 - 65} ${y2},${x2} ${y2}`;
            const highlighted = active === e.to || active === e.from;
            return <g key={`${e.from}:${e.to}`} data-testid="plugin-graph-edge" data-role={e.role} data-selected={e.selected}>
              <path d={path} markerEnd={`url(#${arrowId})`} fill="none" stroke={highlighted ? "var(--p-color-brand-500, #e6a34b)" : "#8492a6"} strokeWidth={highlighted ? 3 : 1.5} strokeDasharray={e.selected ? undefined : "6 5"} opacity={active && !highlighted ? .3 : .8} />
              {!graph.vertical && <text x={graph.vertical ? (e.role === "direct" ? x2 - 50 : x2 + 4) : e.role === "direct" ? (x1 + x2) / 2 : x2 - 64} y={graph.vertical ? y2 - 5 : e.role === "direct" ? lane - 5 : y2 - 5} fontSize="11" fill="#a7b3c4">{e.role}</text>}
              <title>{a.name} → {b.name}: {e.role}, {e.selected ? "selected in release" : "candidate"}</title>
            </g>;
          })}
          {graph.nodes.map(n => <foreignObject key={n.id} x={n.x} y={n.y} width={n.width} height={n.height} data-testid="plugin-graph-node" data-node-id={n.id}>
            <div className={`h-full rounded-xl border p-3 ${active === n.id ? "border-primary bg-card ring-1 ring-primary" : "border-border bg-card"}`}>
              <p className="mb-1 text-xs uppercase text-muted-foreground">{n.kind}</p>
              <Button variant="ghost" aria-pressed={active === n.id} onClick={() => setActive(active === n.id ? null : n.id)} className="h-auto w-full justify-start whitespace-normal p-0 text-left text-sm font-semibold [overflow-wrap:anywhere]">{n.name}</Button>
              <p className="mt-2 text-xs text-muted-foreground [overflow-wrap:anywhere]">{n.source}</p>
              <p className="mt-2 text-xs">{n.selected ? "Selected in release" : "Candidate"}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">Revision {n.commit_sha.slice(0, 10)}</p>
            </div>
          </foreignObject>)}
        </svg>
      </div>
    </Card>
    <div aria-live="polite" aria-atomic="true" className="my-4 rounded-lg border border-border p-4" data-testid="plugin-node-inspector">
      {selectedNode ? <>
        <h3 className="font-semibold [overflow-wrap:anywhere]">{selectedNode.name}</h3>
        <p className="mt-1 text-sm">{selectedNode.selected ? "Selected in this release" : "Candidate for a later release"}. Client acceptance remains pending.</p>
        <ul className="mt-2 space-y-1 text-sm">{incoming.map(e => <li key={e.from}>{at.get(e.from)!.name}: {e.role} · {e.selected ? "selected in release" : "candidate"}</li>)}</ul>
        <NodeLinks node={selectedNode} />
      </> : <p className="text-sm text-muted-foreground">Select a node to inspect its connections. Use Tab and Enter to select nodes.</p>}
    </div>
    <h3 id="composition-list-heading" className="mb-4 text-lg font-semibold">Composition list</h3>
    <div aria-labelledby="composition-list-heading" className="space-y-4" data-testid="plugin-composition-list">
      {compositionGroups(detail).map(({ parent, members }) => <Card key={parent.id} className="p-5">
        <h4 className="font-semibold [overflow-wrap:anywhere]">{parent.kind}: {parent.name}</h4>
        <NodeLinks node={parent} />
        <ul className="mt-4 divide-y divide-border">
          {members.map(({ node, edge }) => <li key={`${edge.from}:${edge.to}`} className="py-4" data-testid="plugin-composition-member">
            <div className="flex flex-wrap items-start gap-2"><span className="font-medium [overflow-wrap:anywhere]">{node.name}</span><Badge variant="outline">{edge.role}</Badge><span className="text-sm text-muted-foreground">{edge.selected ? "Selected in release" : "Candidate"}</span></div>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{node.source} · revision {node.commit_sha}</p>
            <NodeLinks node={node} />
          </li>)}
        </ul>
      </Card>)}
    </div>
  </section>;
}
