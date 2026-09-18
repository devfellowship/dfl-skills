import { EDGE_DASH, GRAPH_LEGEND, NODE_FILL, RING_COLOR } from "@/consts/pack-graph";

export function PackGraphLegend({ hasUnpublished }: { hasUnpublished: boolean }) {
  return (
    <ul className="m-0 mt-[8px] flex list-none flex-wrap items-center gap-x-[12px] gap-y-[4px] p-0 text-[10.5px] text-[hsl(212_10%_56%)]">
      <li className="flex items-center gap-[5px]">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" fill={NODE_FILL} stroke={RING_COLOR.root} strokeWidth="1.5" />
        </svg>
        root
      </li>
      {GRAPH_LEGEND.map(({ role, label }) => (
        <li key={role} className="flex items-center gap-[5px]">
          <svg width="18" height="6" viewBox="0 0 18 6" aria-hidden="true">
            <line
              x1="1"
              y1="3"
              x2="17"
              y2="3"
              stroke={RING_COLOR[role]}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={EDGE_DASH[role]}
            />
          </svg>
          {label}
        </li>
      ))}
      {hasUnpublished && (
        <li className="flex items-center gap-[5px]">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <circle
              cx="6"
              cy="6"
              r="4.5"
              fill={NODE_FILL}
              stroke={RING_COLOR.optional}
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          </svg>
          not published
        </li>
      )}
    </ul>
  );
}
