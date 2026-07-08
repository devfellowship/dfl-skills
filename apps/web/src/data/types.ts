export type Kind = "skill" | "mcp" | "connection";

export interface Skill {
  id: string;
  name: string;
  slug: string;
  source: string;
  kind: Kind;
  description: string;
  tags: string[];
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
