import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Skill } from "@/data/types";
import { SKILLS } from "@/data/skills";
import { fetchSkills } from "@/lib/api";

export interface SkillsState {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
}

export function useSkills(): SkillsState {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetchSkills(controller.signal)
      .then((live) => {
        if (!active) return;
        if (live.length === 0) {
          setSkills(SKILLS);
          setUsingFallback(true);
        } else {
          setSkills(live);
          setUsingFallback(false);
        }
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setSkills(SKILLS);
        setUsingFallback(true);
        setError(err instanceof Error ? err.message : "Failed to load registry");
        toast.error("Couldn't reach the registry — showing preview data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return { skills, loading, error, usingFallback };
}
