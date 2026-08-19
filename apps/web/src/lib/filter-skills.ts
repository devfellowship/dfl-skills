import type { Skill, SkillFilters } from "@/types";
import { authorOf } from "@/lib/format";

function haystack(s: Skill): string {
  return `${s.name} ${s.description} ${s.tags.join(" ")} ${s.categories.join(" ")} ${s.source}`.toLowerCase();
}

export function filterSkills({
  skills,
  query,
  tab,
  topics,
  kind,
  author,
  coreOnly,
}: SkillFilters): Skill[] {
  const q = query.trim().toLowerCase();
  let list = skills.slice();

  if (q) list = list.filter((s) => haystack(s).includes(q));
  if (kind !== "all") list = list.filter((s) => s.kind === kind);
  if (topics.length) list = list.filter((s) => topics.some((t) => s.categories.includes(t)));
  if (author) list = list.filter((s) => (s.author ?? authorOf(s.source)) === author);
  if (coreOnly) list = list.filter((s) => s.tags.includes("core"));
  if (tab === "official") list = list.filter((s) => s.source.startsWith("devfellowship/"));

  return list.sort((a, b) => a.name.localeCompare(b.name));
}
