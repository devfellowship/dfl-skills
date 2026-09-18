import { Link } from "react-router-dom";
import { AlertTriangle, Package, Search } from "lucide-react";
import { Button } from "@devfellowship/components";
import type { Skill } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkillCard } from "./SkillCard";
import { SkillCardSkeleton } from "./SkillCardSkeleton";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-4";

interface CatalogueGridProps {
  skills: Skill[];
  /** True while the catalogue or a server search loads. */
  loading: boolean;
  /** The catalogue failed to load. */
  error: string | null;
  /** The server search failed. */
  searchError: string | null;
  /** True when the registry carries no skill at all (not a filter miss). */
  empty: boolean;
  /** True when the section lists a pack above — so an empty grid is not "no matches". */
  packsShown: boolean;
  onRetry: () => void;
  onRetrySearch: () => void;
  onClear: () => void;
}

/** The loose skills only. A pack is never a card here — it lives in the hero showcase or the search results. */
export function CatalogueGrid(p: CatalogueGridProps) {
  if (p.loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }, (_, i) => (
          <SkillCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (p.error) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
        title="Couldn't reach the registry"
        description="The registry didn't respond. Check your connection and try again."
        action={<Button onClick={p.onRetry}>Retry</Button>}
      />
    );
  }
  if (p.searchError) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
        title="Search failed"
        description="The registry search didn't respond. Try again, or clear the search to browse the catalogue."
        action={<Button onClick={p.onRetrySearch}>Retry</Button>}
      />
    );
  }
  if (p.empty) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" strokeWidth={1.8} />}
        title="No public skills yet"
        description="No public skills have been published yet — the registry is indexing. Published skills will appear here automatically."
        action={
          <Link
            to="/docs"
            className="inline-flex h-[38px] items-center justify-center rounded-lg bg-primary px-4 text-[13.5px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
          >
            Read the docs
          </Link>
        }
      />
    );
  }
  if (p.skills.length > 0) {
    return (
      <div className={GRID}>
        {p.skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    );
  }
  return (
    <EmptyState
      icon={<Search className="h-6 w-6" strokeWidth={1.8} />}
      title={p.packsShown ? "Only packs matched" : "No matches found"}
      description={
        p.packsShown
          ? "Every skill that matched belongs to a pack above. Open the pack to reach it."
          : "Nothing in the registry matches your search and filters. Try broadening your query."
      }
      action={<Button onClick={p.onClear}>Clear all filters</Button>}
    />
  );
}
