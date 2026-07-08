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

export function stripFrontmatter(md: string): string {
  return md.replace(FRONTMATTER, "").trimStart();
}

const AUTHOR_LINE = /^author:\s*["']?([a-z0-9][a-z0-9-]*)["']?\s*$/im;

export function parseAuthor(md: string): string | undefined {
  const block = FRONTMATTER.exec(md)?.[0];
  if (!block) return undefined;
  return AUTHOR_LINE.exec(block)?.[1];
}
