export type Kind = "skill" | "mcp" | "connection";

export type AuditVerdict = "trust" | "caution" | "warning";

export interface SkillFile {
  path: string;
  contents: string;
}

export interface McpTool {
  name: string;
  desc: string;
}

export interface ConnectionRef {
  name: string;
  desc: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  source: string;
  kind: Kind;
  description: string;
  topics: string[];
  installs: number;
  updatedAt: string;
  author: string;
  audit: { score: number; verdict: AuditVerdict };
  trend: number[];
  mcps: McpTool[];
  conns: ConnectionRef[];
  files: SkillFile[];
}

export interface AgentTarget {
  id: string;
  label: string;
}

export type Scope = "global" | "project";

export type LeaderboardTab = "trending" | "hot" | "official" | "all";

export type SearchMode = "fuzzy" | "semantic";
