import type { Kind, Skill } from "@/data/types";

const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "https://skills.devfellowship.com";

export interface ApiSkill {
  name?: string;
  source?: string;
  skill?: string;
  slug?: string;
  kind?: string;
  description?: string;
  tags?: string[];
  visibility?: string;
  updated_at?: string;
  readme?: string;
}

interface ListResponse {
  skills?: ApiSkill[];
  scope?: string;
}

interface SingleResponse {
  skill?: ApiSkill;
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

function toKind(raw: string | undefined): Kind {
  const value = (raw ?? "").toLowerCase();
  return KINDS.has(value) ? (value as Kind) : "skill";
}

export function adaptSkill(raw: ApiSkill): Skill {
  const slug = raw.skill ?? raw.slug ?? raw.name ?? "unknown";
  const source = raw.source ?? "devfellowship";
  return {
    id: `${source}/${slug}`,
    name: raw.name ?? slug,
    slug,
    source,
    kind: toKind(raw.kind),
    description: raw.description ?? "",
    tags: raw.tags ?? [],
    updatedAt: raw.updated_at ?? "",
    visibility: raw.visibility ?? "public",
    readme: raw.readme,
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
  const [owner, repo] = source.split("/");
  const path = `/api/v1/skills/${encodeURIComponent(owner ?? source)}/${encodeURIComponent(
    repo ?? "",
  )}/${encodeURIComponent(slug)}`;
  const data = await getJson<SingleResponse>(path, signal);
  return adaptSkill(data.skill ?? (data as unknown as ApiSkill));
}
