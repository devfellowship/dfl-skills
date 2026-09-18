import { useCallback, useEffect, useState } from "react";
import type { Pack } from "@/types";
import { ApiError, fetchPack } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface PackState {
  pack: Pack | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

export function usePack(source: string | undefined, slug: string | undefined): PackState {
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [nonce, setNonce] = useState(0);
  const { token, loading: authLoading } = useAuth();

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    // An internal pack is a 404 to an anonymous caller, so fetching before the
    // session settles would render "not found" for a page the user can read.
    if (authLoading) return;

    if (!source || !slug) {
      setPack(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchPack(source, slug, controller.signal, token)
      .then((live) => {
        if (active) setPack(live);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setPack(null);
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load pack");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [source, slug, nonce, token, authLoading]);

  return { pack, loading, error, notFound, refetch };
}
