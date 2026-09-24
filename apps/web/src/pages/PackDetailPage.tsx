import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ChevronLeft, Layers, Search } from "lucide-react";
import { Badge, Button } from "@devfellowship/components";
import type { Scope } from "@/types";
import { usePack } from "@/hooks/usePack";
import { packOwner, packProposeUrl } from "@/lib/maintainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkillDetailSkeleton } from "@/components/domain/SkillDetailSkeleton";
import { PackMemberTable } from "@/components/domain/PackMemberTable";
import { InstallPackPanel } from "@/components/domain/InstallPackPanel";
import { PackGraph } from "@/components/domain/PackGraph";
import { PackSummaryPanel } from "@/components/domain/PackSummaryPanel";
import { MaintainerPanel } from "@/components/domain/MaintainerPanel";
import { VisibilityBadge } from "@/components/domain/VisibilityBadge";
import { SignInPrompt } from "@/components/domain/SignInPrompt";

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

/**
 * A pack is its own entity at /p/:owner/:repo/:pack (plan ADR-6) — never a
 * skill row with a fourth kind, and never under /s/.
 */
export function PackDetailPage() {
  const { owner, repo, pack: slug } = useParams<{ owner: string; repo: string; pack: string }>();
  const source = owner && repo ? `${owner}/${repo}` : undefined;
  const [scope, setScope] = useState<Scope>("global");
  const { pack, loading, error, notFound, refetch } = usePack(source, slug);

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px] pt-6" data-testid="pack-page">
      <BackLink />

      {loading ? (
        <SkillDetailSkeleton />
      ) : notFound ? (
        <EmptyState
          icon={<Search className="h-6 w-6" strokeWidth={1.8} />}
          title="Pack not found"
          description="We couldn't find that pack. It may have been renamed, or you may need to sign in with GitHub to see it."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <SignInPrompt />
              <Button asChild variant="outline">
                <Link to="/">Back to registry</Link>
              </Button>
            </div>
          }
        />
      ) : error || !pack ? (
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
          title="Couldn't load this pack"
          description="The registry didn't respond. Check your connection and try again."
          action={<Button onClick={refetch}>Retry</Button>}
        />
      ) : (
        <div>
          <div className="mb-[6px] flex flex-wrap items-start gap-[14px]">
            <Badge variant="warning" shape="square" className="mt-[9px]" data-testid="pack-badge">
              <Layers className="mr-1 h-3 w-3" />
              PACK
            </Badge>
            <div className="min-w-0">
              <h1 className="m-0 font-heading text-[30px] font-semibold tracking-[-.01em] text-foreground" data-testid="pack-title">
                {pack.name}
              </h1>
              <div className="mt-[7px] flex flex-wrap items-center gap-x-[10px] gap-y-1 text-[13px]">
                <span className="break-all font-semibold text-[hsl(33_80%_60%)]">{pack.id}</span>
                <VisibilityBadge visibility={pack.visibility} />
              </div>
            </div>
          </div>

          <p className="m-0 mb-7 mt-[14px] max-w-[640px] text-[15px] leading-[1.6] text-[hsl(212_12%_66%)]">
            {pack.description}
          </p>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
                {pack.members.length} skills, in the order the pack reads
              </h2>
              <PackMemberTable pack={pack} />
            </section>

            <aside className="flex flex-col gap-[14px] lg:sticky lg:top-20">
              <PackSummaryPanel pack={pack} />
              <PackGraph pack={pack} />
              <MaintainerPanel
                owner={packOwner(pack)}
                kind="pack"
                proposeUrl={packProposeUrl(pack.source, pack.slug)}
              />
              <InstallPackPanel pack={pack} scope={scope} onScopeChange={setScope} />
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
