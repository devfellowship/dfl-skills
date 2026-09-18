import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Package, Search } from "lucide-react";
import { Button } from "@devfellowship/components";
import { useSkillFilters } from "@/hooks/useSkillFilters";
import { useCatalogueSearch } from "@/hooks/useCatalogueSearch";
import { useFilteredSkills } from "@/hooks/useFilteredSkills";
import { useFilterFacets } from "@/hooks/useFilterFacets";
import { useSkills } from "@/hooks/useSkills";
import { usePacks } from "@/hooks/usePacks";
import { catalogueCount } from "@/lib/packs";
import { SEARCH_MIN_CHARS } from "@/lib/search";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeaderboardTabs } from "@/components/domain/LeaderboardTabs";
import { TopicFilterChips } from "@/components/domain/TopicFilterChips";
import { KindFilter } from "@/components/domain/KindFilter";
import { AuthorFilter } from "@/components/domain/AuthorFilter";
import { CoreToggle } from "@/components/domain/CoreToggle";
import { SkillCard } from "@/components/domain/SkillCard";
import { PackCard } from "@/components/domain/PackCard";
import { SkillCardSkeleton } from "@/components/domain/SkillCardSkeleton";
import { Hero } from "@/components/domain/Hero";
import { SearchBar } from "@/components/domain/SearchBar";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-4";

export function HomePage() {
  const f = useSkillFilters();
  const { skills, loading, error, refetch } = useSkills();
  const facets = useFilterFacets(skills);
  // Packs are a SEPARATE array: nothing below may count one as a skill.
  const packs = usePacks();
  // The query is a SERVER search (plan ADR-4): debounced, packs included,
  // visibility-filtered by the caller's token. No query = the browse grid.
  const search = useCatalogueSearch(f.query);
  useQueryInUrl(search.query);
  const { groups, skills: looseSkills } = useFilteredSkills(
    { skills, packs, search: search.results, ...f },
    search.active,
  );
  const searchPending = search.active && !search.results && !search.error;
  // An absorbed member is still a matching skill — it moved into its pack's
  // card, it did not stop matching. A member in two packs counts once.
  const shownSkills =
    looseSkills.length +
    new Set(groups.flatMap((g) => g.absorbed.map((s) => s.id))).size;
  const filtered = shownSkills !== skills.length || groups.length !== packs.length;

  const hasSkills = skills.length > 0;
  const showKindFilter = facets.kinds.length > 1;
  const showTabs = facets.owners.length > 1;

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px]">
      <Hero skills={skills.length} packs={packs.length} />

      {hasSkills && (
        <>
          {showTabs && <LeaderboardTabs active={f.tab} onChange={f.setTab} />}
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[14px]">
            <TopicFilterChips topics={facets.topics} selected={f.topics} onToggle={f.toggleTopic} />
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              {facets.coreCount > 0 && (
                <CoreToggle value={f.coreOnly} onChange={f.setCoreOnly} count={facets.coreCount} />
              )}
              {facets.authors.length > 1 && (
                <AuthorFilter value={f.author} onChange={f.setAuthor} authors={facets.authors} />
              )}
              {showKindFilter && (
                <KindFilter value={f.kind} onChange={f.setKind} available={facets.kinds} />
              )}
              <SearchBar
                value={f.query}
                onChange={f.setQuery}
                className="w-full min-w-[200px] flex-1 sm:w-auto"
              />
            </div>
          </div>
          <div className="mb-[26px] flex items-center gap-3 text-[13px] text-[hsl(212_11%_58%)]">
            <span data-testid="catalogue-count">
              {catalogueCount({
                skills: skills.length,
                packs: packs.length,
                ...(filtered ? { shownSkills, shownPacks: groups.length } : {}),
              })}
            </span>
            {search.tooShort && (
              <span data-testid="search-too-short">
                Type {SEARCH_MIN_CHARS} or more characters to search
              </span>
            )}
            {f.active && (
              <Button variant="ghost" size="sm" onClick={f.clear}>
                Clear filters
              </Button>
            )}
          </div>
        </>
      )}

      {loading || searchPending ? (
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
      ) : search.active && search.error ? (
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
          title="Search failed"
          description="The registry search didn't respond. Try again, or clear the search to browse the catalogue."
          action={<Button onClick={search.retry}>Retry</Button>}
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
      ) : looseSkills.length + groups.length > 0 ? (
        <div className={GRID}>
          {/* Packs first: for one query a pack sorts above its own members. */}
          {groups.map(({ pack, absorbed }) => (
            <PackCard key={`pack:${pack.id}`} pack={pack} absorbed={absorbed} />
          ))}
          {looseSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" strokeWidth={1.8} />}
          title="No matches found"
          description="Nothing in the registry matches your search and filters. Try broadening your query."
          action={<Button onClick={f.clear}>Clear all filters</Button>}
        />
      )}
    </main>
  );
}

/**
 * Keeps `?q=` in the address bar in step with the search, so a search is a
 * link: `/?q=reels` opens the same grid. It replaces the history entry, so a
 * typed query does not add one Back step per keystroke.
 */
function useQueryInUrl(query: string) {
  const [params, setParams] = useSearchParams();
  const current = params.get("q") ?? "";
  useEffect(() => {
    if (current === query) return;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (query) next.set("q", query);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }, [query, current, setParams]);
}
