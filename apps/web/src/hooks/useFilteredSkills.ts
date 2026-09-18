import { useMemo } from "react";
import type { Pack, SkillFilters } from "@/types";
import { filterCatalogue, type CatalogueResults } from "@/lib/filter-skills";

/**
 * The home grid for the current filters, GROUPED: pack cards (with the members
 * they absorbed for this query) and the loose skill cards. See ADR-7.
 */
export function useFilteredSkills(filters: SkillFilters & { packs: Pack[] }): CatalogueResults {
  const { skills, packs, query, tab, topics, kind, author, coreOnly } = filters;
  return useMemo(
    () => filterCatalogue({ skills, packs, query, tab, topics, kind, author, coreOnly }),
    [skills, packs, query, tab, topics, kind, author, coreOnly],
  );
}
