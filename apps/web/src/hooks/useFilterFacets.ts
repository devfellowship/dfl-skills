import { useMemo } from "react";
import type { Kind, Skill } from "@/data/types";

export function useFilterFacets(skills: Skill[]): {
  topics: string[];
  kinds: Kind[];
  owners: string[];
} {
  return useMemo(() => {
    const counts = new Map<string, number>();
    const kinds = new Set<Kind>();
    const owners = new Set<string>();

    for (const s of skills) {
      kinds.add(s.kind);
      owners.add(s.source.split("/")[0] ?? s.source);
      for (const tag of s.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }

    const topics = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([topic]) => topic);

    return { topics, kinds: [...kinds], owners: [...owners] };
  }, [skills]);
}
