import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface SearchState {
  query: string;
  setQuery: (q: string) => void;
}

const SearchContext = createContext<SearchState | null>(null);

function initialQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

export function SearchProvider({ children }: { children: ReactNode }) {
  // A shared link like `/?q=reels` opens with that search (HomePage keeps
  // the URL in step while the reader types).
  const [query, setQuery] = useState(initialQuery);

  const value = useMemo<SearchState>(() => ({ query, setQuery }), [query]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchState(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchState must be used within SearchProvider");
  }
  return ctx;
}
