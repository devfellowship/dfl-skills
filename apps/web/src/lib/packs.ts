import type { Pack, PackMember, PackMemberStatus, PackRole, SkillFilters } from "@/types";
import { authorOf } from "@/lib/format";

/** One row of `GET /api/v1/packs`, or the `pack` key of the detail endpoint. */
export interface ApiPackMember {
  slug?: string;
  source?: string;
  role?: string;
  ordinal?: number;
  status?: string;
  name?: string | null;
  description?: string | null;
}

export interface ApiPack {
  source?: string;
  pack?: string;
  name?: string;
  description?: string;
  root?: string;
  visibility?: string;
  commit_sha?: string;
  updated_at?: string;
  member_count?: number;
  unpublished_count?: number;
  members?: ApiPackMember[];
}

const ROLES: ReadonlySet<string> = new Set<PackRole>(["root", "required", "optional", "suggested"]);

function toRole(raw: string | undefined): PackRole {
  return raw && ROLES.has(raw) ? (raw as PackRole) : "suggested";
}

/** Anything the API did not positively call `in_catalogue` is a gap. */
function toStatus(raw: string | undefined): PackMemberStatus {
  return raw === "in_catalogue" ? "in_catalogue" : "not_published";
}

function adaptMember(raw: ApiPackMember, packSource: string, index: number): PackMember {
  return {
    slug: raw.slug ?? "unknown",
    source: raw.source ?? packSource,
    role: toRole(raw.role),
    ordinal: typeof raw.ordinal === "number" ? raw.ordinal : index,
    status: toStatus(raw.status),
    name: raw.name,
    description: raw.description,
  };
}

export function adaptPack(raw: ApiPack): Pack {
  const slug = raw.pack ?? raw.name ?? "unknown";
  const source = raw.source ?? "devfellowship/skills";
  const members = (raw.members ?? [])
    .map((m, i) => adaptMember(m, source, i))
    .sort((a, b) => a.ordinal - b.ordinal);
  return {
    id: `${source}/${slug}`,
    slug,
    source,
    name: raw.name ?? slug,
    description: raw.description ?? "",
    root: raw.root ?? members.find((m) => m.role === "root")?.slug ?? "",
    visibility: raw.visibility ?? "public",
    commitSha: raw.commit_sha ?? "",
    updatedAt: raw.updated_at ?? "",
    memberCount: raw.member_count ?? members.length,
    unpublishedCount:
      raw.unpublished_count ?? members.filter((m) => m.status === "not_published").length,
    members,
  };
}

/** The UI route of a pack (plan ADR-6). A pack never lives under `/s/`. */
export function packHref({ source, slug }: Pick<Pack, "source" | "slug">): string {
  const [owner = "", repo = ""] = source.split("/");
  return `/p/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(slug)}`;
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export interface CatalogueCountInput {
  skills: number;
  packs: number;
  /** Pass both when a filter is active; omit both for the unfiltered line. */
  shownSkills?: number;
  shownPacks?: number;
}

/**
 * The results line. A pack is NOT a skill, so it never inflates the skill
 * number — "104 skills · 1 pack", never "105 skills". With no packs visible to
 * the caller (anonymous), the line keeps its old "N skills" form.
 */
export function catalogueCount({ skills, packs, shownSkills, shownPacks }: CatalogueCountInput): string {
  const filtered = shownSkills !== undefined;
  const skillPart = filtered
    ? `${shownSkills} of ${plural(skills, "skill", "skills")}`
    : plural(skills, "skill", "skills");
  if (packs === 0) return skillPart;
  const packPart = filtered
    ? `${shownPacks ?? 0} of ${plural(packs, "pack", "packs")}`
    : plural(packs, "pack", "packs");
  return `${skillPart} · ${packPart}`;
}

export type PackFilters = Omit<SkillFilters, "skills"> & { packs: Pack[] };

function haystack(p: Pack): string {
  return `${p.name} ${p.slug} ${p.description} ${p.source} ${p.members.map((m) => m.slug).join(" ")}`.toLowerCase();
}

/**
 * The home filters, applied to packs. A pack has no categories and no `core`
 * tag, so a topic or core filter hides it. It is a set of skills, so the kind
 * filter keeps it only for "all" and "skill".
 */
export function filterPacks({ packs, query, tab, topics, kind, author, coreOnly }: PackFilters): Pack[] {
  const q = query.trim().toLowerCase();
  let list = packs.slice();

  if (q) list = list.filter((p) => haystack(p).includes(q));
  if (kind !== "all" && kind !== "skill") list = [];
  if (topics.length || coreOnly) list = [];
  if (author) list = list.filter((p) => authorOf(p.source) === author);
  if (tab === "official") list = list.filter((p) => p.source.startsWith("devfellowship/"));

  return list.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
