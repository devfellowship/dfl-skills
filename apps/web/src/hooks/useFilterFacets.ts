import { useMemo } from "react";
import type { Skill, SkillFacets } from "@/types";
import { computeFacets } from "@/lib/skill-facets";

export function useFilterFacets(skills: Skill[]): SkillFacets {
  return useMemo(() => computeFacets(skills), [skills]);
}
