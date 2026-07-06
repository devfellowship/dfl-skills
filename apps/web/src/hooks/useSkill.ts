import { useCallback, useEffect, useState } from "react";
import type { Skill } from "@/data/types";
import { ApiError, fetchSkill } from "@/lib/api";

export interface SkillState {
  skill: Skill | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

export function useSkill(source: string | undefined, slug: string | undefined): SkillState {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!source || !slug) {
      setSkill(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchSkill(source, slug, controller.signal)
      .then((live) => {
        if (!active) return;
        setSkill(live);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setSkill(null);
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load skill");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [source, slug, nonce]);

  return { skill, loading, error, notFound, refetch };
}
