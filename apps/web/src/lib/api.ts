import type { Pack, Skill, Visibility } from "@/types";
import { adaptSkill, type ApiSkill } from "./skill-adapter";
import { searchApiPath, splitSearchRows, type SearchResults } from "./search";
import { ApiError } from "./api-error";
import { adaptPack, adaptPackRefs, packApiPath, type ApiPack, type ApiPackMember } from "./packs";

const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "https://skills.devfellowship.com";

interface ListResponse {
  skills?: ApiSkill[];
  scope?: string;
}

interface SingleResponse {
  skill?: ApiSkill;
  /** The derived reverse edge — the packs that list this skill, capped at three. */
  part_of?: unknown;
  scope?: string;
}

interface PackResponse {
  pack?: ApiPack;
  members?: ApiPackMember[];
  scope?: string;
}

interface ContentResponse {
  skill?: ApiSkill;
  content?: string;
  scope?: string;
}

export { ApiError, adaptSkill };
export type { ApiSkill };

/**
 * 🚨 The dfl-iam token is passed in per call and attached ONLY to registry
 * requests. Never forward it to `raw.githubusercontent.com` or any other
 * origin: it opens every DFL app, and a bearer header on a third-party request
 * is exactly how it leaks.
 *
 * It is an argument rather than module state because module state is written by
 * an effect, and React runs child effects before parent ones — the token would
 * be missing on the very first fetch after a sign-in.
 */
async function getJson<T>(path: string, signal?: AbortSignal, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function fetchSkills(signal?: AbortSignal, token?: string | null): Promise<Skill[]> {
  const data = await getJson<ListResponse>("/api/v1/skills", signal, token);
  return (data.skills ?? []).map(adaptSkill);
}

export async function fetchSkill(
  source: string,
  slug: string,
  signal?: AbortSignal,
  token?: string | null,
): Promise<Skill> {
  const data = await getJson<SingleResponse>(skillPath(source, slug), signal, token);
  return {
    ...adaptSkill(data.skill ?? (data as unknown as ApiSkill)),
    partOf: adaptPackRefs(data.part_of),
  };
}

/**
 * The catalogue search (plan ADR-4): the server's hybrid search, packs
 * included, under the caller's token. Pack rows come back separated from the
 * skill rows — see `splitSearchRows()` for why they must never mix.
 */
export async function searchCatalogue(
  query: string,
  signal?: AbortSignal,
  token?: string | null,
): Promise<SearchResults> {
  const data = await getJson<{ skills?: unknown }>(searchApiPath(query), signal, token);
  return splitSearchRows(data.skills);
}

/**
 * One pack with its members in MANIFEST order. The detail endpoint returns the
 * members beside the pack, not inside it. 404 for a pack the caller may not
 * read — an internal pack is a 404 to an anonymous caller (decision 2A).
 */
export async function fetchPack(
  source: string,
  slug: string,
  signal?: AbortSignal,
  token?: string | null,
): Promise<Pack> {
  const data = await getJson<PackResponse>(packApiPath(source, slug), signal, token);
  if (!data.pack) throw new ApiError("Registry returned no pack", 502);
  return adaptPack({ ...data.pack, members: data.members ?? data.pack.members ?? [] });
}

/**
 * Every pack the caller may see. An internal pack answers only to a signed-in
 * member; an anonymous caller gets an empty list, never an error.
 */
export async function fetchPacks(signal?: AbortSignal, token?: string | null): Promise<Pack[]> {
  const data = await getJson<{ packs?: ApiPack[] }>("/api/v1/packs", signal, token);
  return (data.packs ?? []).map(adaptPack);
}

/**
 * The verbatim SKILL.md. The registry index stores no body, so this is a
 * separate round trip — gated on the server by `visibility` alone: whoever can
 * resolve the row may read it.
 */
export async function fetchSkillContent(
  source: string,
  slug: string,
  signal?: AbortSignal,
  token?: string | null,
): Promise<string> {
  const data = await getJson<ContentResponse>(skillPath(source, slug, "/content"), signal, token);
  if (typeof data.content !== "string") {
    throw new ApiError("Registry returned no content for this skill", 502);
  }
  return data.content;
}

/**
 * Retier a skill. Nothing here checks whether the caller is a leader: the API
 * runs the UPDATE carrying this very token and lets the RLS policy decide, so a
 * non-leader comes back 403. Hiding the control would be cosmetic, not a gate.
 */
export async function updateSkillVisibility(
  source: string,
  slug: string,
  visibility: Visibility,
  token: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}${skillPath(source, slug, "/visibility")}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // No owner is sent: the API reads "private" with no owner as "private to
    // me", which is the only owner this UI could mean.
    body: JSON.stringify({ visibility }),
  });
  // The reply carries only the four columns the UPDATE returned, so it is a
  // partial row — never feed it through adaptSkill().
  const body = (await res.json().catch(() => ({}))) as {
    skill?: { visibility?: string };
    error?: string;
  };
  if (!res.ok) throw new ApiError(body.error ?? "Could not change visibility", res.status);
  return body.skill?.visibility ?? visibility;
}
