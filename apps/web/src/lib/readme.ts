import { ApiError } from "./api-error";

const SOURCE_RE = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;
const FRONTMATTER = /^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export function readmeRawUrl(source: string, slug: string): string | null {
  if (!SOURCE_RE.test(source) || source.includes("..")) return null;
  if (!SLUG_RE.test(slug)) return null;
  return `https://raw.githubusercontent.com/${source}/main/skills/${slug}/SKILL.md`;
}

export function skillMdGithubUrl(source: string, slug: string): string | null {
  if (!SOURCE_RE.test(source) || source.includes("..") || !SLUG_RE.test(slug)) return null;
  return `https://github.com/${source}/blob/main/skills/${slug}/SKILL.md`;
}

/**
 * How (or whether) this skill's SKILL.md can be resolved from the browser.
 *
 * 🚨 Why `private` is its own outcome rather than "the fetch will just 404":
 * `raw.githubusercontent.com` is unauthenticated. For a PRIVATE source repo
 * (e.g. `devfellowship/internal-skills`) it answers **404, not 403** — GitHub
 * disguises "you have no access" as "this does not exist". So an anonymous
 * browser fetch for a private source is not a transient failure that might
 * succeed on retry; it is *structurally impossible* and will 404 forever.
 *
 * Attempting it anyway and falling into the generic "couldn't load" box is
 * exactly what made a private skill read as "this skill has no README". We
 * classify it up front instead, so the UI can state the real reason and the
 * console records it.
 *
 * We key off the registry's `visibility` field rather than hardcoding a repo
 * allowlist: `visibility` is the same value the registry API's security
 * boundary is built on, so a future private source needs no code change here.
 */
export type ReadmeSource =
  | { kind: "raw"; url: string }
  | { kind: "registry" }
  | { kind: "private"; reason: string }
  | { kind: "invalid"; reason: string };

/**
 * A signed-in fellow gets a fourth outcome: `registry` — "ask the API for the
 * body". The API reads the file server-side with a token the browser never
 * holds, so a private source becomes readable WITHOUT the browser ever being
 * able to reach the repo itself. Signing out puts it straight back to
 * `private`; the session is the only thing that changed.
 *
 * Malformed input is rejected BEFORE the visibility branch, so a bad slug can
 * never reach the registry path just because someone happened to be logged in.
 */
export function resolveReadmeSource(
  source: string | undefined,
  slug: string | undefined,
  visibility?: string,
  authenticated = false,
): ReadmeSource {
  if (!source || !slug) {
    return { kind: "invalid", reason: "missing source or slug" };
  }
  if (!SOURCE_RE.test(source) || source.includes("..") || !SLUG_RE.test(slug)) {
    return { kind: "invalid", reason: `unsafe or malformed source/slug: "${source}/${slug}"` };
  }
  // Every non-public tier lives in the private source repo, so the test is
  // "not public" rather than a list of tiers a new one could be added outside.
  if (visibility && visibility !== "public") {
    if (authenticated) return { kind: "registry" };
    return {
      kind: "private",
      reason: `${source} is a private registry; raw.githubusercontent.com cannot serve it anonymously`,
    };
  }
  const url = readmeRawUrl(source, slug);
  if (!url) {
    return { kind: "invalid", reason: `unsafe or malformed source/slug: "${source}/${slug}"` };
  }
  return { kind: "raw", url };
}

export function stripFrontmatter(md: string): string {
  return md.replace(FRONTMATTER, "").trimStart();
}

const AUTHOR_LINE = /^author:\s*["']?([a-z0-9][a-z0-9-]*)["']?\s*$/im;

export function parseAuthor(md: string): string | undefined {
  const block = FRONTMATTER.exec(md)?.[0];
  if (!block) return undefined;
  return AUTHOR_LINE.exec(block)?.[1];
}

/**
 * Terminal outcomes of a SKILL.md resolution. Every non-`ok` value MUST reach
 * the user as a distinguishable UI state and the console as a log line — a
 * failed resolution rendered as an empty panel is indistinguishable from "this
 * skill genuinely has no README", which is the bug this flow previously had.
 *
 *  - `ok`         body loaded and rendered
 *  - `private`    source repo is private and nobody is signed in
 *  - `restricted` signed in and allowed to SEE the skill, but its body is not
 *                 distributable (the registry's `core` gate). Visible-but-not-
 *                 readable is a real, permanent state, not an error or a 404.
 *  - `missing`    resolved, but there is no SKILL.md at that path (real 404)
 *  - `error`      network/HTTP failure, or an unbuildable URL — worth retrying
 */
export type ReadmeStatus = "loading" | "ok" | "private" | "restricted" | "missing" | "error";

export async function fetchRawReadme(url: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status);
  return res.text();
}

export function classifyReadmeFailure(
  err: unknown,
  url: string | null,
): { status: Exclude<ReadmeStatus, "loading" | "ok">; detail: string } {
  const where = url ? ` at ${url}` : " from the registry";
  if (err instanceof ApiError) {
    if (err.status === 403) {
      return {
        status: "restricted",
        detail: "this skill is visible to you but its contents are not distributable",
      };
    }
    if (err.status === 404) return { status: "missing", detail: `no SKILL.md${where} (HTTP 404)` };
    return { status: "error", detail: `fetch${where} failed — HTTP ${err.status}` };
  }
  const reason = err instanceof Error ? err.message : String(err);
  return { status: "error", detail: `fetch${where} failed — ${reason}` };
}
