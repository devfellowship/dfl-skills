import { useMemo } from "react";
import type { CatalogueFacets, Pack, Skill } from "@/types";
import { filterCatalogue, type CatalogueResults } from "@/lib/filter-skills";
import { groupSearchResults, type SearchResults } from "@/lib/search";

interface Input extends CatalogueFacets {
  skills: Skill[];
  packs: Pack[];
  /** The server search results, or null for the browse catalogue (no query). */
  search: SearchResults | null;
}

const NONE: CatalogueResults = { groups: [], skills: [] };

/**
 * The home grid, GROUPED: pack cards (with the members they absorbed for this
 * query) and the loose skill cards. With a query, the rows come from the
 * server search (ADR-4); without one, from the full catalogue (ADR-7).
 */
export function useFilteredSkills(
  { skills, packs, search, tab, topics, kind, author, coreOnly }: Input,
  searching: boolean,
): CatalogueResults {
  return useMemo(() => {
    const facets = { tab, topics, kind, author, coreOnly };
    if (searching) return search ? groupSearchResults(search, facets) : NONE;
    return filterCatalogue({ skills, packs, ...facets });
  }, [skills, packs, search, searching, tab, topics, kind, author, coreOnly]);
}
