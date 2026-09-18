import type { MiniGraph, MiniGraphNode, Pack, PackAuthors, PackRole, PackShowcase, Skill } from "@/types";
import {
  MINI_GRAPH_MEMBER_R,
  MINI_GRAPH_ORBIT,
  MINI_GRAPH_ROOT_R,
  MINI_GRAPH_SIZE,
  MINI_GRAPH_SUGGESTED_R,
  SHOWCASE_LIST_LIMIT,
} from "@/consts/pack-home";
import { skillAuthor } from "./format";
import { ROLE_ORDER } from "./packs";

const key = (source: string, slug: string): string => `${source}/${slug}`;

/**
 * The list endpoint carries no member author, so the home resolves each
 * member against the catalogue it already loaded. A member the catalogue
 * lacks (or that names no one) contributes nothing — the owner default is
 * NOT applied per member, or every DFL pack would list its curator twice.
 */
export function packContributors(pack: Pack, skills: Skill[]): PackAuthors {
  const byId = new Map(skills.map((s) => [key(s.source, s.slug), s]));
  const authorOf = (source: string, slug: string, fallback?: string | null): string | null => {
    const hit = byId.get(key(source, slug));
    const named = hit ? hit.author : fallback;
    return named && named.trim() ? skillAuthor(named, source) : null;
  };
  const contributors: string[] = [];
  for (const m of pack.members) {
    const a = authorOf(m.source, m.slug, m.author);
    if (a && !contributors.includes(a)) contributors.push(a);
  }
  const root = pack.members.find((m) => m.slug === pack.root);
  const rootAuthor = root ? authorOf(root.source, root.slug, root.author) : null;
  return {
    author: rootAuthor ?? contributors[0] ?? skillAuthor(null, pack.source),
    contributors,
  };
}

/** Member share per role, in ROLE_ORDER, roles with none left out. Sums to 1. */
export function roleShares(pack: Pack): Array<{ role: PackRole; count: number; share: number }> {
  const total = pack.members.length;
  if (total === 0) return [];
  return ROLE_ORDER.map((role) => {
    const count = pack.members.filter((m) => m.role === role).length;
    return { role, count, share: count / total };
  }).filter((r) => r.count > 0);
}

/**
 * The card thumbnail: the root in the centre, every other member on one
 * orbit in manifest order, starting at the top. It is the pack page graph
 * shrunk to a glyph — same colours, no labels, nothing to hover.
 */
export function miniGraph(pack: Pack, size = MINI_GRAPH_SIZE): MiniGraph {
  const rootMember = pack.members.find((m) => m.slug === pack.root) ?? pack.members[0];
  if (!rootMember) return { size, root: null, members: [] };
  const c = size / 2;
  const scale = size / MINI_GRAPH_SIZE;
  const root: MiniGraphNode = {
    slug: rootMember.slug,
    role: "root",
    published: rootMember.status === "in_catalogue",
    x: c,
    y: c,
    r: MINI_GRAPH_ROOT_R * scale,
  };
  const others = pack.members.filter((m) => m !== rootMember);
  const orbit = MINI_GRAPH_ORBIT * scale;
  const members = others.map((m, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / others.length;
    return {
      slug: m.slug,
      role: m.role,
      published: m.status === "in_catalogue",
      x: round(c + orbit * Math.cos(angle)),
      y: round(c + orbit * Math.sin(angle)),
      r: (m.role === "suggested" ? MINI_GRAPH_SUGGESTED_R : MINI_GRAPH_MEMBER_R) * scale,
    };
  });
  return { size, root, members };
}

/** "11 skills · by taigfs +1" — the one-line summary under a pack name. */
export function packByline(pack: Pack, authors: PackAuthors): string {
  const others = authors.contributors.filter((c) => c !== authors.author).length;
  const skills = `${pack.memberCount} ${pack.memberCount === 1 ? "skill" : "skills"}`;
  return `${skills} · by ${authors.author}${others > 0 ? ` +${others}` : ""}`;
}

/**
 * The hero showcase: the pack the reader picked (else the most recently
 * updated) in the spotlight, the next few by recency in the list under it,
 * and how many more only the packs page shows. Packs are never sorted by
 * name here — the showcase is an advert, and the freshest pack leads.
 */
export function showcase(packs: Pack[], featuredId: string | null): PackShowcase {
  const byRecency = [...packs].sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name),
  );
  const featured = byRecency.find((p) => p.id === featuredId) ?? byRecency[0] ?? null;
  const rest = byRecency.filter((p) => p !== featured);
  return {
    featured,
    list: rest.slice(0, SHOWCASE_LIST_LIMIT),
    hidden: Math.max(0, rest.length - SHOWCASE_LIST_LIMIT),
  };
}

/** The grid class: one pack takes the full row, two or more share it. */
export function packsGridClass(count: number): string {
  return count > 1 ? "grid gap-4 lg:grid-cols-2" : "grid gap-4";
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
