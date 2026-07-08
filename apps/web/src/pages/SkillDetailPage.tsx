import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ChevronLeft, Search } from "lucide-react";
import type { Scope } from "@/data/types";
import { installCommand } from "@/lib/format";
import { useSkill } from "@/hooks/useSkill";
import { useSkillReadme } from "@/hooks/useSkillReadme";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { KindBadge } from "@/components/domain/KindBadge";
import { MarkdownView } from "@/components/domain/MarkdownView";
import { InstallPanel } from "@/components/domain/InstallPanel";
import { SkillMetaPanel } from "@/components/domain/SkillMetaPanel";
import { SkillDetailSkeleton } from "@/components/domain/SkillDetailSkeleton";
import { SkillReadmeSkeleton } from "@/components/domain/SkillReadmeSkeleton";

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
  const { owner, repo, slug } = useParams<{ owner: string; repo: string; slug: string }>();
  const source = owner && repo ? `${owner}/${repo}` : undefined;
  const [agent, setAgent] = useState("claude-code");
  const [scope, setScope] = useState<Scope>("global");

  const { skill, loading, error, notFound, refetch } = useSkill(source, slug);
  const { body: readme, loading: readmeLoading } = useSkillReadme(skill?.source, skill?.slug);

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px] pt-6">
      <BackLink />

      {loading ? (
        <SkillDetailSkeleton />
      ) : notFound ? (
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
      ) : error || !skill ? (
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
          title="Couldn't load this skill"
          description="The registry didn't respond. Check your connection and try again."
          action={<Button onClick={refetch}>Retry</Button>}
        />
      ) : (
        <div>
          <div className="mb-[6px] flex flex-wrap items-start gap-[14px]">
            <KindBadge kind={skill.kind} className="mt-[9px]" />
            <div>
              <h1 className="m-0 font-mono text-[30px] font-semibold tracking-[-.01em] text-foreground">
                {skill.name}
              </h1>
              <div className="mt-[7px] text-[13px] font-semibold text-[hsl(33_80%_60%)]">
                {skill.source}/{skill.slug}
              </div>
            </div>
          </div>
          <p className="m-0 mb-4 mt-[14px] max-w-[640px] text-[15px] leading-[1.6] text-[hsl(212_12%_66%)]">
            {skill.description}
          </p>
          {skill.tags.length > 0 && (
            <div className="mb-7 flex flex-wrap gap-[6px]">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] px-[9px] py-[3px] text-[12px] text-[hsl(212_12%_66%)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              {readmeLoading ? (
                <SkillReadmeSkeleton />
              ) : readme ? (
                <MarkdownView source={readme} />
              ) : (
                <div className="animate-fadeUp rounded-[11px] border border-dashed border-[hsl(215_15%_18%)] px-5 py-12 text-center text-[13.5px] text-[hsl(212_10%_52%)]">
                  Couldn't load this skill's SKILL.md. Install the skill to read it locally.
                </div>
              )}
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
