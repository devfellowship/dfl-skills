import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Package, Search } from "lucide-react";
import type { LeaderboardTab } from "@/data/types";
import { useSearchState } from "@/hooks/useSearchState";
import { useFilteredSkills } from "@/hooks/useFilteredSkills";
import { useSkills } from "@/hooks/useSkills";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeaderboardTabs } from "@/components/domain/LeaderboardTabs";
import { TopicFilterChips } from "@/components/domain/TopicFilterChips";
import { KindFilter, type KindFilterValue } from "@/components/domain/KindFilter";
import { SkillCard } from "@/components/domain/SkillCard";
import { SkillCardSkeleton } from "@/components/domain/SkillCardSkeleton";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-4";

function Hero({ count }: { count: number }) {
  return (
    <section className="animate-fadeUp py-[54px_40px] pb-10 pt-[54px]">
      <div className="mb-5 inline-flex items-center gap-[7px] rounded-full border border-[hsl(33_90%_55%/.22)] bg-[hsl(33_90%_55%/.1)] px-[11px] py-[5px]">
        <span className="h-[6px] w-[6px] rounded-full bg-primary shadow-[0_0_8px_hsl(33_90%_55%)]" />
        <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(33_85%_64%)]">
          DevFellowship Registry
        </span>
      </div>
      <h1 className="m-0 mb-4 max-w-[680px] font-heading text-[54px] font-bold uppercase leading-[.98] tracking-[.005em]">
        The DevFellowship
        <br />
        agent skills registry
      </h1>
      <p className="m-0 mb-[26px] max-w-[600px] text-[16.5px] leading-[1.6] text-[hsl(212_12%_64%)]">
        Discover and install agent skills, MCP servers and connections — straight into Claude Code,
        Cursor, Codex and the rest of your toolkit.
      </p>
      <div className="flex max-w-[560px] flex-wrap items-center gap-4">
        <CodeBlock
          command="npx skills add devfellowship/skills"
          className="min-w-[320px] flex-1 rounded-[11px] px-[15px] py-[13px]"
        />
        <Stat value={String(count)} label="Skills" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-heading text-[26px] font-bold leading-none text-foreground">{value}</div>
      <div className="mt-[3px] text-[11px] uppercase tracking-[.05em] text-[hsl(212_10%_52%)]">
        {label}
      </div>
    </div>
  );
}

export function HomePage() {
  const { query, setQuery } = useSearchState();
  const [tab, setTab] = useState<LeaderboardTab>("all");
  const [topics, setTopics] = useState<string[]>([]);
  const [kind, setKind] = useState<KindFilterValue>("all");

  const { skills, loading, error, refetch } = useSkills();
  const results = useFilteredSkills({ skills, query, tab, topics, kind });

  const allTopics = useMemo(
    () => [...new Set(skills.flatMap((s) => s.tags))].sort((a, b) => a.localeCompare(b)),
    [skills],
  );

  const toggleTopic = (t: string): void => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const clearFilters = (): void => {
    setQuery("");
    setTopics([]);
    setKind("all");
    setTab("all");
  };

  const hasSkills = skills.length > 0;

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px]">
      <Hero count={skills.length} />

      {hasSkills && (
        <>
          <LeaderboardTabs active={tab} onChange={setTab} />
          <div className="mb-[26px] flex flex-wrap items-center justify-between gap-[14px]">
            <TopicFilterChips topics={allTopics} selected={topics} onToggle={toggleTopic} />
            <KindFilter value={kind} onChange={setKind} />
          </div>
        </>
      )}

      {loading ? (
        <div className={GRID}>
          {Array.from({ length: 8 }, (_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
          title="Couldn't reach the registry"
          description="The registry didn't respond. Check your connection and try again."
          action={<Button onClick={refetch}>Retry</Button>}
        />
      ) : !hasSkills ? (
        <EmptyState
          icon={<Package className="h-6 w-6" strokeWidth={1.8} />}
          title="No public skills yet"
          description="No public skills have been published yet — the registry is indexing. Published skills will appear here automatically."
          action={
            <Link
              to="/docs"
              className="inline-flex h-[38px] items-center justify-center rounded-lg bg-primary px-4 text-[13.5px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
            >
              Read the docs
            </Link>
          }
        />
      ) : results.length > 0 ? (
        <div className={GRID}>
          {results.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" strokeWidth={1.8} />}
          title="No matches found"
          description="Nothing in the registry matches your search and filters. Try broadening your query."
          action={<Button onClick={clearFilters}>Clear all filters</Button>}
        />
      )}
    </main>
  );
}
