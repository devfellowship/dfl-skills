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
  | { kind: "private"; reason: string }
  | { kind: "invalid"; reason: string };

export function resolveReadmeSource(
  source: string | undefined,
  slug: string | undefined,
  visibility?: string,
): ReadmeSource {
  if (!source || !slug) {
    return { kind: "invalid", reason: "missing source or slug" };
  }
  if (visibility === "internal") {
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
