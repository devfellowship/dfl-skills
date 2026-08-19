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
