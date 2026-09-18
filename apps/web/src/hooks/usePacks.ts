import { useEffect, useState } from "react";
import type { Pack } from "@/types";
import { fetchPacks } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface PacksState {
  packs: Pack[];
  loading: boolean;
}

/**
 * Packs load BESIDE the skills, never inside the skills array: the home
 * counters read `skills.length`, and a pack in that array would be counted as
 * a skill. A failed pack read degrades to "no packs" — the skill catalogue
 * must never go down because the pack endpoint did.
 */
export function usePacks(): PacksState {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true);

    fetchPacks(controller.signal, token)
      .then((live) => {
        if (active) setPacks(live);
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setPacks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, authLoading]);

  return { packs, loading };
}
