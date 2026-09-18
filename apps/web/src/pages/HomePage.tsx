import { Sparkles } from "lucide-react";
import { Button } from "@devfellowship/components";
import { useSkillFilters } from "@/hooks/useSkillFilters";
import { useCatalogueSearch } from "@/hooks/useCatalogueSearch";
import { useFilteredSkills } from "@/hooks/useFilteredSkills";
import { useFilterFacets } from "@/hooks/useFilterFacets";
import { useQueryInUrl } from "@/hooks/useQueryInUrl";
import { useSkills } from "@/hooks/useSkills";
import { usePacks } from "@/hooks/usePacks";
import { catalogueCount } from "@/lib/packs";
import { SEARCH_MIN_CHARS } from "@/lib/search";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Hero } from "@/components/domain/Hero";
import { PackShowcase } from "@/components/domain/PackShowcase";
import { PackSearchResults } from "@/components/domain/PackSearchResults";
import { CatalogueToolbar } from "@/components/domain/CatalogueToolbar";
import { CatalogueGrid } from "@/components/domain/CatalogueGrid";

export function HomePage() {
  const f = useSkillFilters();
  const { skills, loading, error, refetch } = useSkills();
  const facets = useFilterFacets(skills);
  // Packs are a SEPARATE array: nothing below may count one as a skill.
  const { packs, loading: packsLoading } = usePacks();
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
    looseSkills.length + new Set(groups.flatMap((g) => g.absorbed.map((s) => s.id))).size;
  const filtered = shownSkills !== skills.length || groups.length !== packs.length;
  const hasSkills = skills.length > 0;

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px]">
      <Hero
        skills={skills.length}
        packs={packs.length}
        aside={
          hasSkills && (packsLoading || packs.length > 0) ? (
            <PackShowcase packs={packs} skills={skills} loading={packsLoading} />
          ) : undefined
        }
      />

      <section aria-labelledby="skills-heading">
        {hasSkills && (
          <>
            <SectionHeader
              id="skills-heading"
              icon={<Sparkles className="h-[13px] w-[13px]" />}
              eyebrow="Catalogue"
              title={search.active ? `Skills matching “${search.query}”` : "Skills"}
              description={
                search.active
                  ? undefined
                  : "Standalone skills, MCP servers and connections. Each one installs on its own."
              }
              aside={
                <span data-testid="catalogue-count" className="text-[13px] text-[hsl(212_11%_58%)]">
                  {catalogueCount({
                    skills: skills.length,
                    packs: packs.length,
                    ...(filtered ? { shownSkills, shownPacks: groups.length } : {}),
                  })}
                </span>
              }
            />
            <CatalogueToolbar filters={f} facets={facets} />
            {(search.tooShort || f.active) && (
              <div className="mb-5 flex items-center gap-3 text-[13px] text-[hsl(212_11%_58%)]">
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
            )}
          </>
        )}

        {search.active && (
          <PackSearchResults
            groups={searchPending ? [] : groups}
            skills={skills}
            loading={searchPending}
            query={search.query}
          />
        )}

        <CatalogueGrid
          skills={looseSkills}
          loading={loading || searchPending}
          error={error}
          searchError={search.active ? search.error : null}
          empty={!loading && !error && !hasSkills}
          packsShown={groups.length > 0}
          onRetry={refetch}
          onRetrySearch={search.retry}
          onClear={f.clear}
        />
      </section>
    </main>
  );
}
