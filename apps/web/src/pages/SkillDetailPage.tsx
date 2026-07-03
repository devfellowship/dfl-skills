import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import type { Scope } from "@/data/types";
import { installCommand } from "@/lib/format";
import { useSkill } from "@/hooks/useSkill";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { KindBadge } from "@/components/domain/KindBadge";
import { MarkdownView } from "@/components/domain/MarkdownView";
import { FileTree } from "@/components/domain/FileTree";
import { McpList, ConnectionList } from "@/components/domain/SkillResources";
import { InstallPanel } from "@/components/domain/InstallPanel";
import { SkillMetaPanel } from "@/components/domain/SkillMetaPanel";
import { SkillDetailSkeleton } from "@/components/domain/SkillDetailSkeleton";
import { readmeFor } from "@/lib/readme";

type DetailTab = "readme" | "files" | "mcps" | "connections";

function BackLink() {
  return (
    <Link
      to="/"
      className="mb-2 inline-flex items-center gap-[7px] py-2 text-[13px] font-medium text-[hsl(212_11%_58%)] transition-colors hover:text-foreground/80"
    >
      <ChevronLeft className="h-[15px] w-[15px]" />
      Back to registry
    </Link>
  );
}

export function SkillDetailPage() {
  const { source, slug } = useParams<{ source: string; slug: string }>();
  const [tab, setTab] = useState<DetailTab>("readme");
  const [agent, setAgent] = useState("claude-code");
  const [scope, setScope] = useState<Scope>("global");

  const { skill, loading } = useSkill(source, slug);

  const tabs: TabItem[] = skill
    ? [
        { id: "readme", label: "README" },
        { id: "files", label: "Files", count: skill.files.length },
        { id: "mcps", label: "MCPs", count: skill.mcps.length },
        { id: "connections", label: "Connections", count: skill.conns.length },
      ]
    : [];

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px] pt-6">
      <BackLink />

      {loading ? (
        <SkillDetailSkeleton />
      ) : !skill ? (
        <EmptyState
          icon={<Search className="h-6 w-6" strokeWidth={1.8} />}
          title="Skill not found"
          description="We couldn't find that skill in the registry. It may have been renamed or removed."
          action={
            <Link
              to="/"
              className="inline-flex h-[38px] items-center justify-center rounded-lg bg-primary px-4 text-[13.5px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
            >
              Back to registry
            </Link>
          }
        />
      ) : (
        <div>
          <div className="mb-[6px] flex flex-wrap items-start gap-[14px]">
            <KindBadge kind={skill.kind} className="mt-[9px]" />
            <div>
              <h1 className="m-0 font-mono text-[30px] font-semibold tracking-[-.01em] text-foreground">
                {skill.name}
              </h1>
              <div className="mt-[7px] flex items-center gap-2 text-[13px] text-[hsl(212_11%_58%)]">
                <span className="font-semibold text-[hsl(33_80%_60%)]">
                  {skill.source}/{skill.slug}
                </span>
                <span>·</span>
                <span>by {skill.author}</span>
              </div>
            </div>
          </div>
          <p className="m-0 mb-7 mt-[14px] max-w-[640px] text-[15px] leading-[1.6] text-[hsl(212_12%_66%)]">
            {skill.description}
          </p>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <Tabs
                items={tabs}
                active={tab}
                onChange={(id) => setTab(id as DetailTab)}
                className="mb-[22px]"
              />
              {tab === "readme" && <MarkdownView source={readmeFor(skill)} />}
              {tab === "files" && <FileTree files={skill.files} />}
              {tab === "mcps" && <McpList mcps={skill.mcps} />}
              {tab === "connections" && <ConnectionList conns={skill.conns} />}
            </div>

            <aside className="flex flex-col gap-[14px] lg:sticky lg:top-20">
              <InstallPanel
                command={installCommand(skill.source, skill.slug)}
                agent={agent}
                onAgentChange={setAgent}
                scope={scope}
                onScopeChange={setScope}
              />
              <SkillMetaPanel skill={skill} />
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
