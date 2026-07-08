import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Package, Search } from "lucide-react";
import type { LeaderboardTab } from "@/data/types";
import { useSearchState } from "@/hooks/useSearchState";
import { useFilteredSkills } from "@/hooks/useFilteredSkills";
import { useFilterFacets } from "@/hooks/useFilterFacets";
import { useSkills } from "@/hooks/useSkills";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeaderboardTabs } from "@/components/domain/LeaderboardTabs";
import { TopicFilterChips } from "@/components/domain/TopicFilterChips";
import { KindFilter, type KindFilterValue } from "@/components/domain/KindFilter";
import { SkillCard } from "@/components/domain/SkillCard";
import { SkillCardSkeleton } from "@/components/domain/SkillCardSkeleton";
import { Hero } from "@/components/domain/Hero";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-4";

export function HomePage() {
  const { query, setQuery } = useSearchState();
  const [tab, setTab] = useState<LeaderboardTab>("all");
  const [topics, setTopics] = useState<string[]>([]);
  const [kind, setKind] = useState<KindFilterValue>("all");

  const { skills, loading, error, refetch } = useSkills();
  const results = useFilteredSkills({ skills, query, tab, topics, kind });
  const facets = useFilterFacets(skills);

  const toggleTopic = (t: string): void => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const clearFilters = (): void => {
    setQuery("");
    setTopics([]);
    setKind("all");
    setTab("all");
  };

  const hasSkills = skills.length > 0;
  const hasActiveFilters = Boolean(query) || topics.length > 0 || kind !== "all" || tab !== "all";
  const showKindFilter = facets.kinds.length > 1;
  const showTabs = facets.owners.length > 1;

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px]">
      <Hero count={skills.length} />

      {hasSkills && (
        <>
          {showTabs && <LeaderboardTabs active={tab} onChange={setTab} />}
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[14px]">
            <TopicFilterChips topics={facets.topics} selected={topics} onToggle={toggleTopic} />
            {showKindFilter && <KindFilter value={kind} onChange={setKind} available={facets.kinds} />}
          </div>
          <div className="mb-[26px] flex items-center gap-3 text-[13px] text-[hsl(212_11%_58%)]">
            <span>
              {results.length === skills.length
                ? `${skills.length} skills`
                : `${results.length} of ${skills.length} skills`}
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </>
      )}

      {loading ? (
        <div className={GRID}>
          {Array.from({ length: 8 }, (_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
          title="Couldn't reach the registry"
          description="The registry didn't respond. Check your connection and try again."
          action={<Button onClick={refetch}>Retry</Button>}
        />
      ) : !hasSkills ? (
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
      ) : results.length > 0 ? (
        <div className={GRID}>
          {results.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" strokeWidth={1.8} />}
          title="No matches found"
          description="Nothing in the registry matches your search and filters. Try broadening your query."
          action={<Button onClick={clearFilters}>Clear all filters</Button>}
        />
      )}
    </main>
  );
}
