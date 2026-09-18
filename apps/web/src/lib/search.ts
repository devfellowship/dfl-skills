import type { CatalogueFacets, Pack, Skill } from "@/types";
import { ABSORB_MIN, skillPassesFacets, type CatalogueResults } from "./filter-skills";
import { adaptPack, packPassesFacets, type ApiPack } from "./packs";
import { adaptSkill, type ApiSkill } from "./skill-adapter";

/**
 * The catalogue search is a SERVER query (plan ADR-4). `GET
 * /api/v1/skills/search` runs the hybrid semantic+FTS search under the
 * caller's JWT, and it returns the matching PACKS as rows of the same list,
 * with `kind: "pack"`, above the skills. The `/api/search` alias serves the
 * stock CLI and stays skills-only, so the site never calls it.
 */

/** The server rejects a shorter `q` with a 400 (`MIN_SEARCH_Q` in dfl-services). */
export const SEARCH_MIN_CHARS = 3;

/** Wait this long after the last keystroke before the server search runs. */
export const SEARCH_DEBOUNCE_MS = 250;

export function isSearchable(query: string): boolean {
  return query.trim().length >= SEARCH_MIN_CHARS;
}

export function searchApiPath(query: string): string {
  return `/api/v1/skills/search?${new URLSearchParams({ q: query.trim() }).toString()}`;
}

/** A pack row of the search response: the pack, and which members also matched. */
export interface SearchPack {
  pack: Pack;
  /** Slugs of the members that are ALSO in this response, in manifest order. */
  matched: string[];
}

export interface SearchResults {
  /** In server rank order — a pack sorts above its own members. */
  packs: SearchPack[];
  /** In server rank order. Never re-sorted by name on the client. */
  skills: Skill[];
}

interface ApiSearchPack extends ApiPack {
  kind: "pack";
  matched_members?: unknown;
}

function isObject(row: unknown): row is Record<string, unknown> {
  return typeof row === "object" && row !== null && !Array.isArray(row);
}

/**
 * Split one search response into packs and skills.
 *
 * 🚨 A `kind: "pack"` row must NEVER reach `adaptSkill()`: its kind coercion
 * turns any unknown kind into "skill" with no error (plan ADR-6), so a pack
 * would render as a skill card that links to a `/s/` page that does not exist.
 */
export function splitSearchRows(rows: unknown): SearchResults {
  const packs: SearchPack[] = [];
  const skills: Skill[] = [];
  if (!Array.isArray(rows)) return { packs, skills };

  for (const row of rows) {
    if (!isObject(row)) continue;
    if (row.kind === "pack") {
      const raw = row as unknown as ApiSearchPack;
      if (typeof raw.pack !== "string" || typeof raw.source !== "string") continue;
      const matched = Array.isArray(raw.matched_members)
        ? raw.matched_members.filter((m): m is string => typeof m === "string")
        : [];
      packs.push({ pack: adaptPack(raw), matched });
      continue;
    }
    const raw = row as ApiSkill;
    if (typeof (raw.skill ?? raw.slug) !== "string") continue;
    skills.push(adaptSkill(raw));
  }
  return { packs, skills };
}

const key = (source: string, slug: string): string => `${source}/${slug}`;

/**
 * The home grid for one server search (plan ADR-4 + ADR-7).
 *
 * The facets (tab, topic, kind, author, core) still apply, on the client, to
 * the rows the server returned. A pack absorbs the members the SERVER says
 * matched (`matched_members`) — when two or more of them survive the facets —
 * and those leave the top level for this query only. Everything keeps the
 * server's rank order.
 */
export function groupSearchResults(results: SearchResults, facets: CatalogueFacets): CatalogueResults {
  const skills = results.skills.filter((s) => skillPassesFacets(s, facets));
  const byId = new Map(skills.map((s) => [key(s.source, s.slug), s]));
  const taken = new Set<string>();

  const groups = results.packs
    .filter(({ pack }) => packPassesFacets(pack, facets))
    .map(({ pack, matched }) => {
      const wanted = new Set(matched);
      // pack.members is in manifest order; the member's own source decides the
      // match, so a same-named skill from another repo is never absorbed.
      const absorbed = pack.members.flatMap((m) => {
        if (!wanted.has(m.slug)) return [];
        const hit = byId.get(key(m.source, m.slug));
        return hit ? [hit] : [];
      });
      if (absorbed.length < ABSORB_MIN) return { pack, absorbed: [] as Skill[] };
      for (const s of absorbed) taken.add(key(s.source, s.slug));
      return { pack, absorbed };
    });

  return { groups, skills: skills.filter((s) => !taken.has(key(s.source, s.slug))) };
}
