import { useCallback, useEffect, useState } from "react";
import type { Skill } from "@/data/types";
import { fetchSkills } from "@/lib/api";

export interface SkillsState {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSkills(): SkillsState {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetchSkills(controller.signal)
      .then((live) => {
        if (!active) return;
        setSkills(live);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setSkills([]);
        setError(err instanceof Error ? err.message : "Failed to load registry");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [nonce]);

  return { skills, loading, error, refetch };
}
