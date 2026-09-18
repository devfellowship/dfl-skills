import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Keeps `?q=` in the address bar in step with the search, so a search is a
 * link: `/?q=reels` opens the same grid. It replaces the history entry, so a
 * typed query does not add one Back step per keystroke.
 */
export function useQueryInUrl(query: string): void {
  const [params, setParams] = useSearchParams();
  const current = params.get("q") ?? "";
  useEffect(() => {
    if (current === query) return;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (query) next.set("q", query);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }, [query, current, setParams]);
}
