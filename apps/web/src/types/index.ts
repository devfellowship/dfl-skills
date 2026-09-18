export type Kind = "skill" | "mcp" | "connection";

/** Not an order of privilege — branch on the value, never compare with < or >. */
export type Visibility = "public" | "internal" | "leaders" | "private";

export interface Skill {
  id: string;
  name: string;
  slug: string;
  source: string;
  kind: Kind;
  description: string;
  /** Authored in the SKILL.md frontmatter. Most skills carry none. */
  tags: string[];
  /** Derived server-side at ingestion — this is what the topic filter reads. */
  categories: string[];
  updatedAt: string;
  visibility: string;
  author?: string;
  readme?: string;
}

/**
 * A pack is its OWN entity (plan ADR-6), never a `Skill` with another `kind`:
 * `toKind()` in api.ts coerces an unknown kind to "skill" with no error, so a
 * pack that travelled as a skill row would silently render as a skill.
 */
export type PackRole = "root" | "required" | "optional" | "suggested";

/** `not_published` is a member the manifest names and the catalogue lacks. */
export type PackMemberStatus = "in_catalogue" | "not_published";

export interface PackMember {
  slug: string;
  source: string;
  role: PackRole;
  /** Manifest reading order. Never sort members by name. */
  ordinal: number;
  status: PackMemberStatus;
  /** Present only on the detail endpoint, for a member the caller may read. */
  name?: string | null;
  description?: string | null;
}

export interface Pack {
  id: string;
  slug: string;
  source: string;
  name: string;
  description: string;
  /** Slug of the root member skill. */
  root: string;
  visibility: string;
  commitSha: string;
  updatedAt: string;
  memberCount: number;
  unpublishedCount: number;
  members: PackMember[];
}

export interface AgentTarget {
  id: string;
  label: string;
}

export type Scope = "global" | "project";

export type LeaderboardTab = "official" | "all";

export type KindFilterValue = "all" | Kind;

export interface SkillFacets {
  topics: string[];
  kinds: Kind[];
  owners: string[];
  authors: string[];
  coreCount: number;
}

export interface SkillFilters {
  skills: Skill[];
  query: string;
  tab: LeaderboardTab;
  topics: string[];
  kind: KindFilterValue;
  author: string | null;
  coreOnly: boolean;
}
