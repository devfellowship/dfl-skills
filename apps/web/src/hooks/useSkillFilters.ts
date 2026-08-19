import { useCallback, useState } from "react";
import type { KindFilterValue, LeaderboardTab } from "@/types";
import { useSearchState } from "@/hooks/useSearchState";

export function useSkillFilters() {
  const { query, setQuery } = useSearchState();
  const [tab, setTab] = useState<LeaderboardTab>("all");
  const [topics, setTopics] = useState<string[]>([]);
  const [kind, setKind] = useState<KindFilterValue>("all");
  const [author, setAuthor] = useState<string | null>(null);
  const [coreOnly, setCoreOnly] = useState(false);

  const toggleTopic = useCallback((t: string) => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setTopics([]);
    setKind("all");
    setTab("all");
    setAuthor(null);
    setCoreOnly(false);
  }, [setQuery]);

  const active =
    Boolean(query) || topics.length > 0 || kind !== "all" || tab !== "all" || Boolean(author) || coreOnly;

  return {
    query,
    tab,
    setTab,
    topics,
    toggleTopic,
    kind,
    setKind,
    author,
    setAuthor,
    coreOnly,
    setCoreOnly,
    active,
    clear,
  };
}
