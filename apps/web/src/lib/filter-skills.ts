import type { Pack, Skill, SkillFilters } from "@/types";
import { authorOf } from "@/lib/format";
import { filterPacks } from "@/lib/packs";

function haystack(s: Skill): string {
  return `${s.name} ${s.description} ${s.tags.join(" ")} ${s.categories.join(" ")} ${s.source}`.toLowerCase();
}

export function filterSkills({
  skills,
  query,
  tab,
  topics,
  kind,
  author,
  coreOnly,
}: SkillFilters): Skill[] {
  const q = query.trim().toLowerCase();
  let list = skills.slice();

  if (q) list = list.filter((s) => haystack(s).includes(q));
  if (kind !== "all") list = list.filter((s) => s.kind === kind);
  if (topics.length) list = list.filter((s) => topics.some((t) => s.categories.includes(t)));
  if (author) list = list.filter((s) => (s.author ?? authorOf(s.source)) === author);
  if (coreOnly) list = list.filter((s) => s.tags.includes("core"));
  if (tab === "official") list = list.filter((s) => s.source.startsWith("devfellowship/"));

  return list.sort((a, b) => a.name.localeCompare(b.name));
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
 */
export const ABSORB_MIN = 2;

/**
 * The home catalogue for one set of filters, grouped (plan ADR-7).
 *
 * When a query matches a pack AND two or more of its members, the pack card
 * absorbs those members and they leave the top level — for that query only.
 * A member that matches while its pack does not keeps its own card. With no
 * query, nothing is absorbed: members stay on the home list, because people
 * look skills up by name.
 */
export function filterCatalogue(filters: SkillFilters & { packs: Pack[] }): CatalogueResults {
  const { packs, ...skillFilters } = filters;
  const skills = filterSkills(skillFilters);
  const matchedPacks = filterPacks({ ...skillFilters, packs });

  if (!filters.query.trim()) {
    return { groups: matchedPacks.map((pack) => ({ pack, absorbed: [] })), skills };
  }

  const key = (s: { source: string; slug: string }): string => `${s.source}/${s.slug}`;
  const byId = new Map(skills.map((s) => [key(s), s]));
  const taken = new Set<string>();

  const groups = matchedPacks.map((pack) => {
    // pack.members is already in manifest order.
    const matched = pack.members.flatMap((m) => {
      const hit = byId.get(key(m));
      return hit ? [hit] : [];
    });
    if (matched.length < ABSORB_MIN) return { pack, absorbed: [] };
    for (const s of matched) taken.add(key(s));
    return { pack, absorbed: matched };
  });

  return { groups, skills: skills.filter((s) => !taken.has(key(s))) };
}
