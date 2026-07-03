import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SearchMode } from "@/data/types";

interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  mode: SearchMode;
  setMode: (m: SearchMode) => void;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("fuzzy");

  const value = useMemo<SearchState>(
    () => ({ query, setQuery, mode, setMode }),
    [query, mode],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchState(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchState must be used within SearchProvider");
  }
  return ctx;
}
