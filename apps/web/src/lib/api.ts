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
  author?: string;
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

interface ContentResponse {
  skill?: ApiSkill;
  content?: string;
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

/**
 * The dfl-iam access token, in memory only. `AuthProvider` is the sole writer,
 * deriving it from the session, and nothing else reads it — so signing out
 * cannot leave a live token behind in some component's state.
 *
 * 🚨 It is attached ONLY to registry requests. Never send it to
 * `raw.githubusercontent.com` or any other origin: this token opens every DFL
 * app, and a bearer header on a third-party request is exactly how it leaks.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    signal,
  });
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }
  return (await res.json()) as T;
}

function skillPath(source: string, slug: string, suffix = ""): string {
  const [owner, repo] = source.split("/");
  if (!owner || !repo) {
    throw new ApiError(`Invalid skill source "${source}"`, 404);
  }
  return `/api/v1/skills/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/${encodeURIComponent(slug)}${suffix}`;
}

const KINDS: ReadonlySet<string> = new Set<Kind>(["skill", "mcp", "connection"]);

function toKind(raw: string | undefined): Kind {
  const value = (raw ?? "").toLowerCase();
  return KINDS.has(value) ? (value as Kind) : "skill";
}

export function adaptSkill(raw: ApiSkill): Skill {
  const slug = raw.skill ?? raw.slug ?? raw.name ?? "unknown";
  const source = raw.source ?? "devfellowship/skills";
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
    author: raw.author,
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
  const data = await getJson<SingleResponse>(skillPath(source, slug), signal);
  return adaptSkill(data.skill ?? (data as unknown as ApiSkill));
}

/**
 * The verbatim SKILL.md. The registry index stores no body, so this is a
 * separate round trip — and it is gated twice on the server: the caller must be
 * able to see the row at all, AND the skill must be tagged `core`. A 403 here
 * means "visible but not distributable", which is a different thing from 404.
 */
export async function fetchSkillContent(
  source: string,
  slug: string,
  signal?: AbortSignal,
): Promise<string> {
  const data = await getJson<ContentResponse>(skillPath(source, slug, "/content"), signal);
  if (typeof data.content !== "string") {
    throw new ApiError("Registry returned no content for this skill", 502);
  }
  return data.content;
}
