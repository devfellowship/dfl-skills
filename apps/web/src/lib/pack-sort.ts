import type { Pack, Skill } from "@/types";
import { packContributors } from "./pack-home";

export const PACK_SORTS = ["updated", "name", "author"] as const;
export type PackSort = (typeof PACK_SORTS)[number];

export const DEFAULT_PACK_SORT: PackSort = "updated";

export const PACK_SORT_LABEL: Record<PackSort, string> = {
  updated: "Recently updated",
  name: "Name",
  author: "Author",
};

export function parsePackSort(raw: string | null | undefined): PackSort {
  return (PACK_SORTS as readonly string[]).includes(raw ?? "") ? (raw as PackSort) : DEFAULT_PACK_SORT;
}

function time(value: string | null | undefined): number {
  if (!value) return Number.NaN;
  return Date.parse(value);
}

/**
 * When a pack last changed: the LATEST of its own row and every member skill's
 * row. The pack row moves only when the manifest changes (members, order,
 * description), so a pack whose skills were improved would otherwise look
 * stale. A member comes from the catalogue the page already loaded (the list
 * endpoint carries no member dates), or from the member itself on the detail
 * endpoint. A value that does not parse is ignored; with no valid date at all
 * the answer is "" and the card shows "unknown".
 */
export function packUpdatedAt(pack: Pack, skills: Skill[] = []): string {
  const catalogue = new Map(skills.map((s) => [`${s.source}/${s.slug}`, s.updatedAt]));
  const candidates = [
    pack.updatedAt,
    ...pack.members.flatMap((m) => [m.updatedAt, catalogue.get(`${m.source}/${m.slug}`)]),
  ];
  let best = "";
  let bestTime = Number.NEGATIVE_INFINITY;
  for (const value of candidates) {
    const t = time(value);
    if (!Number.isNaN(t) && t > bestTime) {
      best = value as string;
      bestTime = t;
    }
  }
  return best;
}

/** The pack's author: its root skill's, as every other card says it. */
export function packAuthorName(pack: Pack, skills: Skill[] = []): string {
  return packContributors(pack, skills).author;
}

/** Every distinct pack author, alphabetical and case-insensitive, for the filter. */
export function packAuthorOptions(packs: Pack[], skills: Skill[] = []): string[] {
  const names = new Set(packs.map((p) => packAuthorName(p, skills)));
  return [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

export interface PackView {
  sort: PackSort;
  /** Keep only the packs by this author. `null` keeps all. */
  author: string | null;
}

/**
 * The packs page order. `updated` is newest first; `name` and `author` are A-Z.
 * Every order falls back to the same tie-breaks (newest, then name, then id),
 * so equal keys never swap places between renders.
 */
export function viewPacks(packs: Pack[], skills: Skill[], { sort, author }: PackView): Pack[] {
  const rows = packs
    .map((pack) => ({
      pack,
      updated: time(packUpdatedAt(pack, skills)),
      author: packAuthorName(pack, skills),
    }))
    .filter((row) => !author || row.author === author);

  const newest = (a: (typeof rows)[number], b: (typeof rows)[number]) => {
    const x = Number.isNaN(a.updated) ? Number.NEGATIVE_INFINITY : a.updated;
    const y = Number.isNaN(b.updated) ? Number.NEGATIVE_INFINITY : b.updated;
    return y === x ? 0 : y > x ? 1 : -1;
  };
  const byName = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
    a.pack.name.localeCompare(b.pack.name, "en", { sensitivity: "base" });
  const byAuthor = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
    a.author.localeCompare(b.author, "en", { sensitivity: "base" });

  const primary = sort === "name" ? byName : sort === "author" ? byAuthor : newest;
  return rows
    .sort((a, b) => primary(a, b) || newest(a, b) || byName(a, b) || a.pack.id.localeCompare(b.pack.id))
    .map((row) => row.pack);
}
