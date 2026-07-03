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
        `${s.name} ${s.description} ${s.topics.join(" ")} ${s.author}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (kind !== "all") list = list.filter((s) => s.kind === kind);
    if (topics.length) list = list.filter((s) => topics.some((t) => s.topics.includes(t)));
    if (tab === "official") list = list.filter((s) => s.source === "devfellowship");

    if (tab === "hot") {
      list.sort((a, b) => b.installs - a.installs);
    } else if (tab === "trending") {
      list.sort(
        (a, b) =>
          (b.trend[9] ?? 0) - (b.trend[6] ?? 0) - ((a.trend[9] ?? 0) - (a.trend[6] ?? 0)),
      );
    } else if (tab === "all") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [skills, query, tab, topics, kind]);
}
