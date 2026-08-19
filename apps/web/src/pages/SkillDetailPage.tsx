import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ChevronLeft, Search } from "lucide-react";
import type { Scope } from "@/data/types";
import { installCommand } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useSkill } from "@/hooks/useSkill";
import { useSkillReadme } from "@/hooks/useSkillReadme";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { MarkdownView } from "@/components/domain/MarkdownView";
import { SkillDetailHeader } from "@/components/domain/SkillDetailHeader";
import { InstallPanel } from "@/components/domain/InstallPanel";
import { CopyPromptPanel } from "@/components/domain/CopyPromptPanel";
import { SkillMetaPanel } from "@/components/domain/SkillMetaPanel";
import { SkillDetailSkeleton } from "@/components/domain/SkillDetailSkeleton";
import { SkillReadmeSkeleton } from "@/components/domain/SkillReadmeSkeleton";
import { ReadmeUnavailable } from "@/components/domain/ReadmeUnavailable";

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

  const { session } = useAuth();

  const { skill, loading, error, notFound, refetch } = useSkill(source, slug);
  const {
    body: readme,
    raw: readmeRaw,
    author: readmeAuthor,
    status: readmeStatus,
    detail: readmeDetail,
  } = useSkillReadme(skill?.source, skill?.slug, skill?.visibility, session !== null);

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
          <SkillDetailHeader skill={skill} readmeAuthor={readmeAuthor} />

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              {readmeStatus === "loading" ? (
                <SkillReadmeSkeleton />
              ) : readmeStatus === "ok" && readme ? (
                <MarkdownView source={readme} />
              ) : (
                <ReadmeUnavailable
                  status={readmeStatus === "ok" ? "missing" : readmeStatus}
                  source={skill.source}
                  slug={skill.slug}
                  detail={readmeDetail}
                />
              )}
            </div>

            <aside className="flex flex-col gap-[14px] lg:sticky lg:top-20">
              <CopyPromptPanel
                source={skill.source}
                slug={skill.slug}
                markdown={readmeRaw}
                scope={scope}
                onScopeChange={setScope}
                needsSignIn={readmeStatus === "private"}
              />
              {/* `npx skills add` clones the whole source repo over the network, so
                  it can only work for a public one. Offering it for the internal
                  registry would be a command that fails every time. */}
              {skill.visibility !== "internal" && (
                <InstallPanel
                  command={installCommand(skill.source, skill.slug)}
                  agent={agent}
                  onAgentChange={setAgent}
                />
              )}
              <SkillMetaPanel skill={skill} />
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
