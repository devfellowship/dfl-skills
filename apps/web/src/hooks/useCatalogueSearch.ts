import { useCallback, useEffect, useState } from "react";
import { searchCatalogue } from "@/lib/api";
import { SEARCH_DEBOUNCE_MS, isSearchable, type SearchResults } from "@/lib/search";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export interface CatalogueSearchState {
  /** The debounced query that the server search runs with. */
  query: string;
  /** True when a server search drives the grid; false = the browse catalogue. */
  active: boolean;
  /** Something is typed, but it is shorter than the server accepts. */
  tooShort: boolean;
  /** The last results. Kept while the next query loads, so the grid does not flash. */
  results: SearchResults | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * The home search as a SERVER query (plan ADR-4), debounced. Runs under the
 * caller's token, so an internal pack or skill appears only to a member —
 * the server applies the visibility gate, not this hook.
 */
export function useCatalogueSearch(typed: string): CatalogueSearchState {
  const query = useDebouncedValue(typed.trim(), SEARCH_DEBOUNCE_MS);
  const active = isSearchable(query);
  const { token, loading: authLoading } = useAuth();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!active) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }
    // Same reason as useSkills: do not search as anonymous and then swap.
    if (authLoading) return;

    const controller = new AbortController();
    let live = true;
    setLoading(true);
    setError(null);

    searchCatalogue(query, controller.signal, token)
      .then((r) => {
        if (live) setResults(r);
      })
      .catch((err: unknown) => {
        if (!live || controller.signal.aborted) return;
        setResults(null);
        setError(err instanceof Error ? err.message : "Search failed");
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
      controller.abort();
    };
  }, [query, active, token, authLoading, nonce]);

  const tooShort = typed.trim().length > 0 && !isSearchable(typed);
  return { query, active, tooShort, results, loading, error, retry };
}
