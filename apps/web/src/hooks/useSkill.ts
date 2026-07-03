import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Skill } from "@/data/types";
import { SKILLS } from "@/data/skills";
import { ApiError, fetchSkill } from "@/lib/api";

export interface SkillState {
  skill: Skill | null;
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
}

export function useSkill(source: string | undefined, slug: string | undefined): SkillState {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!source || !slug) {
      setSkill(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    const mockMatch = SKILLS.find((s) => s.slug === slug && s.source === source) ?? null;

    setLoading(true);
    setError(null);

    fetchSkill(source, slug, controller.signal)
      .then((live) => {
        if (!active) return;
        setSkill(live);
        setUsingFallback(false);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        if (mockMatch) {
          setSkill(mockMatch);
          setUsingFallback(true);
        } else {
          setSkill(null);
          if (!(err instanceof ApiError) || err.status !== 404) {
            toast.error("Couldn't load this skill");
          }
        }
        setError(err instanceof Error ? err.message : "Failed to load skill");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [source, slug]);

  return { skill, loading, error, usingFallback };
}
