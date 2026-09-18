import type { CatalogueFacets, Pack, Skill, SkillFilters } from "@/types";
import { skillAuthor } from "@/lib/format";
import { filterPacks } from "@/lib/packs";

/**
 * The facet filters for one skill. There is no free-text match here: the
 * query is a SERVER search (plan ADR-4, lib/search.ts), so the offline
 * substring filter is gone.
 */
export function skillPassesFacets(
  s: Skill,
  { tab, topics, kind, author, coreOnly }: CatalogueFacets,
): boolean {
  if (kind !== "all" && s.kind !== kind) return false;
  if (topics.length && !topics.some((t) => s.categories.includes(t))) return false;
  if (author && skillAuthor(s.author, s.source) !== author) return false;
  if (coreOnly && !s.tags.includes("core")) return false;
  if (tab === "official" && !s.source.startsWith("devfellowship/")) return false;
  return true;
}

/** The browse catalogue (no query): the facets, sorted by name. */
export function filterSkills({ skills, ...facets }: SkillFilters): Skill[] {
  return skills
    .filter((s) => skillPassesFacets(s, facets))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** A pack card and the matching members it absorbed for the current query. */
export interface PackGroup {
  pack: Pack;
  /** In manifest order. Empty when fewer than ABSORB_MIN members matched. */
  absorbed: Skill[];
}

export interface CatalogueResults {
  /** Rendered FIRST, so a pack sorts above its own members (ADR-4). */
  groups: PackGroup[];
  /** The loose skill cards: every match that no pack absorbed. */
  skills: Skill[];
}

/**
 * One matching member is not a near-duplicate problem, and folding it away
 * would hide the exact skill the reader typed. From two up, the pack absorbs.
 * The server uses the same threshold (`MEMBER_MATCH_MIN` in dfl-services).
 */
export const ABSORB_MIN = 2;

/**
 * The home catalogue with NO query — the browse state. Nothing is absorbed:
 * members stay on the home list, because people look skills up by name.
 * With a query, the grid comes from `groupSearchResults()` in lib/search.ts.
 */
export function filterCatalogue(filters: SkillFilters & { packs: Pack[] }): CatalogueResults {
  const { packs, ...skillFilters } = filters;
  const { skills: _skills, ...facets } = skillFilters;
  return {
    groups: filterPacks({ ...facets, packs }).map((pack) => ({ pack, absorbed: [] })),
    skills: filterSkills(skillFilters),
  };
}
