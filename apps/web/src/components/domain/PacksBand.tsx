import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import type { Skill } from "@/types";
import type { PackGroup } from "@/lib/filter-skills";
import { HOME_PACKS_LIMIT } from "@/consts/pack-home";
import { packsGridClass } from "@/lib/pack-home";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PackCard } from "./PackCard";
import { PackCardSkeleton } from "./PackCardSkeleton";

interface PacksBandProps {
  groups: PackGroup[];
  /** Every pack the caller can see, for the "all packs" count. */
  total: number;
  skills: Skill[];
  loading: boolean;
  /** The active server query, if any: the band then shows the packs that matched it. */
  query?: string;
}

/**
 * The packs' own place on the home, above the skills: featured cards, never
 * mixed into the skill grid. With a query, it holds the packs the server
 * matched (with the members they absorbed, ADR-7); without one, the packs the
 * facets keep. Empty and not loading = nothing, so an anonymous reader (who
 * sees no internal pack) gets a plain skills page.
 */
export function PacksBand({ groups, total, skills, loading, query }: PacksBandProps) {
  if (!loading && groups.length === 0) return null;
  const shown = query ? groups : groups.slice(0, HOME_PACKS_LIMIT);
  const hidden = groups.length - shown.length;

  return (
    <section aria-labelledby="packs-heading" className="mb-14 animate-fadeUp" data-testid="packs-band">
      <SectionHeader
        id="packs-heading"
        icon={<Layers className="h-[13px] w-[13px]" />}
        eyebrow="Packs"
        title={query ? `Packs matching “${query}”` : "Skill packs"}
        description={
          query
            ? "A pack ranks above its own members. Open one to see which members matched."
            : "Curated sets of skills that route to each other and install as one."
        }
        aside={
          <Link
            to="/packs"
            className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[hsl(33_82%_66%)] transition-colors hover:text-[hsl(33_90%_74%)]"
          >
            All packs{total > 0 && <span className="text-[hsl(212_10%_52%)]"> · {total}</span>}
            <ArrowRight className="h-[14px] w-[14px]" />
          </Link>
        }
      />
      {loading && groups.length === 0 ? (
        <div className={packsGridClass(1)}>
          <PackCardSkeleton />
        </div>
      ) : (
        <div className={packsGridClass(shown.length)}>
          {shown.map(({ pack, absorbed }) => (
            <PackCard key={`pack:${pack.id}`} pack={pack} skills={skills} absorbed={absorbed} />
          ))}
        </div>
      )}
      {hidden > 0 && (
        <div className="mt-4 text-[13px] text-[hsl(212_11%_58%)]">
          <Link to="/packs" className="font-semibold text-[hsl(33_82%_66%)] hover:underline">
            {hidden} more {hidden === 1 ? "pack" : "packs"}
          </Link>{" "}
          on the packs page.
        </div>
      )}
    </section>
  );
}
