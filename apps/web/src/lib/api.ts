import type {
  AuditVerdict,
  ConnectionRef,
  Kind,
  McpTool,
  SearchMode,
  Skill,
  SkillFile,
} from "@/data/types";

const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "https://skills.devfellowship.com";

export interface ApiSkill {
  id?: string;
  name?: string;
  slug?: string;
  owner?: string;
  repo?: string;
  source?: string;
  kind?: string;
  type?: string;
  description?: string;
  summary?: string;
  topics?: string[];
  tags?: string[];
  installs?: number;
  install_count?: number;
  installCount?: number;
  updated_at?: string;
  updatedAt?: string;
  author?: string;
  hash?: string;
  audit?: ApiAudit;
  trend?: number[];
  mcps?: ApiNamed[];
  mcp_tools?: ApiNamed[];
  connections?: ApiNamed[];
  conns?: ApiNamed[];
  files?: ApiFile[];
  tree?: ApiFile[];
}

interface ApiAudit {
  score?: number;
  verdict?: string;
}

interface ApiNamed {
  name?: string;
  desc?: string;
  description?: string;
}

interface ApiFile {
  path?: string;
  name?: string;
  contents?: string;
  content?: string;
}

interface ListResponse {
  skills?: ApiSkill[];
  scope?: string;
}

interface SearchResponse {
  skills?: ApiSkill[];
  searchType?: string;
  scope?: string;
}

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }
  return (await res.json()) as T;
}

const KINDS: ReadonlySet<string> = new Set<Kind>(["skill", "mcp", "connection"]);
const VERDICTS: ReadonlySet<string> = new Set<AuditVerdict>(["trust", "caution", "warning"]);

function toKind(raw: string | undefined): Kind {
  const value = (raw ?? "").toLowerCase();
  return KINDS.has(value) ? (value as Kind) : "skill";
}

function toVerdict(raw: string | undefined, score: number): AuditVerdict {
  const value = (raw ?? "").toLowerCase();
  if (VERDICTS.has(value)) return value as AuditVerdict;
  if (score >= 90) return "trust";
  if (score >= 75) return "caution";
  return "warning";
}

function toNamedList(items: ApiNamed[] | undefined): McpTool[] {
  if (!items) return [];
  return items.map((it) => ({
    name: it.name ?? "",
    desc: it.desc ?? it.description ?? "",
  }));
}

function toConnList(items: ApiNamed[] | undefined): ConnectionRef[] {
  return toNamedList(items);
}

function toFiles(items: ApiFile[] | undefined): SkillFile[] {
  if (!items) return [];
  return items.map((f) => ({
    path: f.path ?? f.name ?? "",
    contents: f.contents ?? f.content ?? "",
  }));
}

export function adaptSkill(raw: ApiSkill): Skill {
  const slug = raw.slug ?? raw.repo ?? raw.name ?? "unknown";
  const source = raw.source ?? raw.owner ?? "devfellowship";
  const score = raw.audit?.score ?? 0;
  const mcps = toNamedList(raw.mcps ?? raw.mcp_tools);
  const conns = toConnList(raw.connections ?? raw.conns);
  return {
    id: raw.id ?? `${source}/${slug}`,
    name: raw.name ?? slug,
    slug,
    source,
    kind: toKind(raw.kind ?? raw.type),
    description: raw.description ?? raw.summary ?? "",
    topics: raw.topics ?? raw.tags ?? [],
    installs: raw.installs ?? raw.install_count ?? raw.installCount ?? 0,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "recently",
    author: raw.author ?? source,
    audit: { score, verdict: toVerdict(raw.audit?.verdict, score) },
    trend: raw.trend ?? [],
    mcps,
    conns,
    files: toFiles(raw.files ?? raw.tree),
  };
}

export async function fetchSkills(signal?: AbortSignal): Promise<Skill[]> {
  const data = await getJson<ListResponse>("/api/v1/skills", signal);
  return (data.skills ?? []).map(adaptSkill);
}

export async function fetchSkill(
  source: string,
  slug: string,
  signal?: AbortSignal,
): Promise<Skill> {
  const data = await getJson<ApiSkill>(
    `/api/v1/skills/${encodeURIComponent(source)}/${encodeURIComponent(slug)}/${encodeURIComponent(slug)}`,
    signal,
  );
  return adaptSkill(data);
}

export async function searchSkills(
  query: string,
  mode: SearchMode,
  signal?: AbortSignal,
): Promise<Skill[]> {
  const params = new URLSearchParams({ q: query, mode });
  const data = await getJson<SearchResponse>(
    `/api/v1/skills/search?${params.toString()}`,
    signal,
  );
  return (data.skills ?? []).map(adaptSkill);
}
