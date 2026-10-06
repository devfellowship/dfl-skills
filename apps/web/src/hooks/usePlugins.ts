import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { ApiError, pluginClient } from "@/lib/api";
import type { Plugin, PluginDetail } from "@/lib/plugins";

export function usePluginCatalogue(source?: string, slug?: string, query = "") {
  const { token, loading: authLoading } = useAuth();
  const key = JSON.stringify([source, slug, query, token]);
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{ key: string; data: PluginDetail | Plugin[] | null; loading: boolean; status: number | null }>({ key, data: null, loading: true, status: null });
  const refetch = useCallback(() => setNonce(n => n + 1), []);
  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    let active = true;
    setState({ key, data: null, loading: true, status: null });
    const read = source && slug ? pluginClient.detail(source, slug, controller.signal, token) : pluginClient.list(query, controller.signal, token);
    read.then(data => { if (active) setState({ key, data, loading: false, status: null }); })
      .catch(error => { if (active && !controller.signal.aborted) setState({ key, data: null, loading: false, status: error instanceof ApiError ? error.status : 500 }); });
    return () => { active = false; controller.abort(); };
  }, [source, slug, query, token, authLoading, key, nonce]);
  // A former caller's private labels must not remain visible until an effect clears them.
  return { ...(state.key === key && !authLoading ? state : { data: null, loading: true, status: null }), refetch };
}
