import type { SkillFacets } from "@/types";
import type { useSkillFilters } from "@/hooks/useSkillFilters";
import { LeaderboardTabs } from "./LeaderboardTabs";
import { TopicFilterChips } from "./TopicFilterChips";
import { KindFilter } from "./KindFilter";
import { AuthorFilter } from "./AuthorFilter";
import { CoreToggle } from "./CoreToggle";
import { SearchBar } from "./SearchBar";

interface CatalogueToolbarProps {
  filters: ReturnType<typeof useSkillFilters>;
  facets: SkillFacets;
}

/** The facet row of the skills section: search and toggles on top, topic chips below. */
export function CatalogueToolbar({ filters: f, facets }: CatalogueToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-[14px] rounded-[14px] border border-[hsl(215_15%_14%)] bg-[hsl(215_21%_9%/.6)] p-4">
      {facets.owners.length > 1 && <LeaderboardTabs active={f.tab} onChange={f.setTab} />}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={f.query} onChange={f.setQuery} className="w-full min-w-[220px] flex-1 sm:w-auto sm:max-w-none" />
        {facets.kinds.length > 1 && <KindFilter value={f.kind} onChange={f.setKind} available={facets.kinds} />}
        {facets.authors.length > 1 && (
          <AuthorFilter value={f.author} onChange={f.setAuthor} authors={facets.authors} />
        )}
        {facets.coreCount > 0 && (
          <CoreToggle value={f.coreOnly} onChange={f.setCoreOnly} count={facets.coreCount} />
        )}
      </div>
      <TopicFilterChips topics={facets.topics} selected={f.topics} onToggle={f.toggleTopic} />
    </div>
  );
}
