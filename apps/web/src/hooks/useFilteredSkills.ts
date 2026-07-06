import { useMemo } from "react";
import type { LeaderboardTab, Skill } from "@/data/types";
import type { KindFilterValue } from "@/components/domain/KindFilter";

interface Filters {
  skills: Skill[];
  query: string;
  tab: LeaderboardTab;
  topics: string[];
  kind: KindFilterValue;
}

export function useFilteredSkills({ skills, query, tab, topics, kind }: Filters): Skill[] {
  return useMemo(() => {
    let list = skills.slice();
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter((s) =>
        `${s.name} ${s.description} ${s.tags.join(" ")} ${s.source}`.toLowerCase().includes(q),
      );
    }
    if (kind !== "all") list = list.filter((s) => s.kind === kind);
    if (topics.length) list = list.filter((s) => topics.some((t) => s.tags.includes(t)));
    if (tab === "official") list = list.filter((s) => s.source.startsWith("devfellowship/"));

    list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [skills, query, tab, topics, kind]);
}
