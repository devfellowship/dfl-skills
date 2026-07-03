import { useState } from "react";
import { Search } from "lucide-react";
import { TOPICS } from "@/data/skills";
import type { LeaderboardTab, Skill } from "@/data/types";
import { formatCount } from "@/lib/format";
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
import { PreviewBanner } from "@/components/domain/PreviewBanner";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-4";

function Hero({ skills }: { skills: Skill[] }) {
  const totalInstalls = skills.reduce((acc, s) => acc + s.installs, 0);
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
        Discover, audit and install agent skills, MCP servers and connections — straight into
        Claude Code, Cursor, Codex and the rest of your toolkit.
      </p>
      <div className="flex max-w-[560px] flex-wrap items-center gap-4">
        <CodeBlock
          command="npx skills add devfellowship/skills"
          className="min-w-[320px] flex-1 rounded-[11px] px-[15px] py-[13px]"
        />
        <div className="flex gap-[22px]">
          <Stat value={String(skills.length)} label="Skills" />
          <Stat value={formatCount(totalInstalls)} label="Installs" />
        </div>
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
  const [tab, setTab] = useState<LeaderboardTab>("trending");
  const [topics, setTopics] = useState<string[]>([]);
  const [kind, setKind] = useState<KindFilterValue>("all");

  const { skills, loading, usingFallback } = useSkills();
  const results = useFilteredSkills({ skills, query, tab, topics, kind });

  const toggleTopic = (t: string): void => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const clearFilters = (): void => {
    setQuery("");
    setTopics([]);
    setKind("all");
    setTab("trending");
  };

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px]">
      <Hero skills={skills} />

      {usingFallback && <PreviewBanner />}

      <LeaderboardTabs active={tab} onChange={setTab} />

      <div className="mb-[26px] flex flex-wrap items-center justify-between gap-[14px]">
        <TopicFilterChips topics={TOPICS} selected={topics} onToggle={toggleTopic} />
        <KindFilter value={kind} onChange={setKind} />
      </div>

      {loading ? (
        <div className={GRID}>
          {Array.from({ length: 8 }, (_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
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
          action={
            <Button onClick={clearFilters}>Clear all filters</Button>
          }
        />
      )}
    </main>
  );
}
