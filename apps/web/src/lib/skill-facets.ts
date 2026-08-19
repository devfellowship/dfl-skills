import type { Kind, Skill, SkillFacets } from "@/types";
import { authorOf } from "@/lib/format";

function byCountThenName(counts: Map<string, number>): string[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}

/**
 * `topics` reads the DERIVED `categories`, not the authored `tags`. Only a
 * handful of skills carry frontmatter tags, so tag-based chips were empty for
 * most of the catalogue — which is why the categories exist at all.
 */
export function computeFacets(skills: Skill[]): SkillFacets {
  const topicCounts = new Map<string, number>();
  const authorCounts = new Map<string, number>();
  const kinds = new Set<Kind>();
  const owners = new Set<string>();
  let coreCount = 0;

  for (const s of skills) {
    kinds.add(s.kind);
    owners.add(s.source.split("/")[0] ?? s.source);
    if (s.tags.includes("core")) coreCount += 1;
    for (const c of s.categories) topicCounts.set(c, (topicCounts.get(c) ?? 0) + 1);
    const author = s.author ?? authorOf(s.source);
    if (author) authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
  }

  return {
    topics: byCountThenName(topicCounts),
    kinds: [...kinds],
    owners: [...owners],
    authors: byCountThenName(authorCounts),
    coreCount,
  };
}
