import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@devfellowship/components";
import type { Pack } from "@/types";
import { PackMiniGraph } from "./PackMiniGraph";

interface PackShowcaseListProps {
  packs: Pack[];
  hidden: number;
  onFeature: (id: string) => void;
}

/** The packs waiting behind the spotlight. Picking one swaps it in — nothing rotates on its own. */
export function PackShowcaseList({ packs, hidden, onFeature }: PackShowcaseListProps) {
  if (packs.length === 0 && hidden === 0) return null;

  return (
    <ul data-testid="pack-showcase-list" className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
      {packs.map((p) => (
        <li key={p.id}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onFeature(p.id)}
            data-testid="pack-showcase-item"
            data-pack={p.id}
            className="flex h-auto w-full items-center justify-start gap-3 rounded-[12px] border border-[hsl(215_15%_16%)] bg-card px-3 py-2 text-left font-normal transition-colors hover:border-[hsl(33_90%_55%/.4)] hover:bg-[hsl(33_90%_55%/.05)]"
          >
            <PackMiniGraph pack={p} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading text-[16px] font-bold uppercase leading-none text-foreground">
                {p.name}
              </span>
              <span className="mt-[3px] block truncate text-[12px] text-[hsl(212_12%_60%)]">
                {p.memberCount} {p.memberCount === 1 ? "skill" : "skills"} · {p.description}
              </span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[.05em] text-[hsl(33_82%_66%)]">Feature</span>
          </Button>
        </li>
      ))}
      {hidden > 0 && (
        <li className="text-[12.5px] text-[hsl(212_11%_58%)]">
          <Link to="/packs" className="inline-flex items-center gap-[5px] font-semibold text-[hsl(33_82%_66%)] hover:underline">
            {hidden} more {hidden === 1 ? "pack" : "packs"}
            <ArrowRight className="h-[13px] w-[13px]" />
          </Link>
        </li>
      )}
    </ul>
  );
}
