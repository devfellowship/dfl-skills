import { useMemo } from "react";
import type { Skill, SkillFilters } from "@/types";
import { filterSkills } from "@/lib/filter-skills";

export function useFilteredSkills(filters: SkillFilters): Skill[] {
  const { skills, query, tab, topics, kind, author, coreOnly } = filters;
  return useMemo(
    () => filterSkills({ skills, query, tab, topics, kind, author, coreOnly }),
    [skills, query, tab, topics, kind, author, coreOnly],
  );
}
