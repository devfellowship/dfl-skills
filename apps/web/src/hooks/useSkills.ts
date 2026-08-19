import { useCallback, useEffect, useState } from "react";
import type { Skill } from "@/types";
import { fetchSkills } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

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
  const { token, loading: authLoading } = useAuth();

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    // Holding here is what keeps the list from rendering the 6 public skills
    // and then swapping to the full internal set a moment later.
    if (authLoading) return;

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetchSkills(controller.signal, token)
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
  }, [nonce, token, authLoading]);

  return { skills, loading, error, refetch };
}
