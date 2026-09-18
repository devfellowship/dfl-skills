import { Layers } from "lucide-react";
import type { Skill } from "@/types";
import type { PackGroup } from "@/lib/filter-skills";
import { packsGridClass } from "@/lib/pack-home";
import { PackCard } from "./PackCard";
import { PackCardSkeleton } from "./PackCardSkeleton";

interface PackSearchResultsProps {
  groups: PackGroup[];
  skills: Skill[];
  loading: boolean;
  query: string;
}

/**
 * The packs the server matched for the query, ABOVE the loose skills (plan
 * ADR-4), each with the members it absorbed (ADR-7). Nothing here in the
 * browse state — the hero showcase is the packs' place then.
 */
export function PackSearchResults({ groups, skills, loading, query }: PackSearchResultsProps) {
  if (!loading && groups.length === 0) return null;

  return (
    <div className="mb-8 animate-fadeUp" data-testid="pack-search-results">
      <div className="mb-3 flex items-center gap-[7px] text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(33_85%_64%)]">
        <Layers className="h-[13px] w-[13px]" />
        {loading ? "Packs" : `${groups.length} ${groups.length === 1 ? "pack matches" : "packs match"} “${query}”`}
      </div>
      {loading && groups.length === 0 ? (
        <div className={packsGridClass(1)}>
          <PackCardSkeleton />
        </div>
      ) : (
        <div className={packsGridClass(groups.length)}>
          {groups.map(({ pack, absorbed }) => (
            <PackCard key={`pack:${pack.id}`} pack={pack} skills={skills} absorbed={absorbed} />
          ))}
        </div>
      )}
    </div>
  );
}
