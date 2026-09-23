import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, ExternalLink, User } from "lucide-react";
import { Button } from "@devfellowship/components";
import { useSkills } from "@/hooks/useSkills";
import { usePacks } from "@/hooks/usePacks";
import { githubAvatarUrl } from "@/lib/format";
import { isCoreHandle, maintainerLabel, packsByMaintainer, skillsByMaintainer } from "@/lib/maintainer";
import { packsGridClass } from "@/lib/pack-home";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkillCard } from "@/components/domain/SkillCard";
import { SkillCardSkeleton } from "@/components/domain/SkillCardSkeleton";
import { PackCard } from "@/components/domain/PackCard";
import { PackCardSkeleton } from "@/components/domain/PackCardSkeleton";
import { BackToRegistryLink } from "@/components/domain/BackToRegistryLink";

const SKILL_GRID = "grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-4";

/** A maintainer's page at /u/:handle — every skill and pack they own. */
export function MaintainerProfilePage() {
  const { handle: rawHandle } = useParams<{ handle: string }>();
  const handle = rawHandle ?? "";
  const { skills, loading: skillsLoading, error, refetch } = useSkills();
  const { packs, loading: packsLoading } = usePacks();

  const loading = skillsLoading || packsLoading;
  const core = isCoreHandle(handle);
  const label = maintainerLabel(handle);

  const ownedSkills = useMemo(() => skillsByMaintainer(skills, handle), [skills, handle]);
  const ownedPacks = useMemo(() => packsByMaintainer(packs, skills, handle), [packs, skills, handle]);
  const empty = !loading && !error && ownedSkills.length === 0 && ownedPacks.length === 0;

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px] pt-6">
      <BackToRegistryLink />

      <div className="mb-8 flex items-center gap-[14px]">
        <img
          src={githubAvatarUrl(core ? "devfellowship" : handle)}
          alt=""
          className="h-[52px] w-[52px] rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)]"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
        <div>
          <h1 className="m-0 font-mono text-[24px] font-semibold tracking-[-.01em] text-foreground">{label}</h1>
          {!core && (
            <a
              href={`https://github.com/${encodeURIComponent(handle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 text-[13px] font-medium text-[hsl(33_82%_62%)] hover:underline"
            >
              @{handle}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-8">
          <div className={packsGridClass(2)}>
            <PackCardSkeleton />
            <PackCardSkeleton />
          </div>
          <div className={SKILL_GRID}>
            {Array.from({ length: 4 }, (_, i) => (
              <SkillCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.8} />}
          title="Couldn't reach the registry"
          description="The registry didn't respond. Check your connection and try again."
          action={<Button onClick={refetch}>Retry</Button>}
        />
      ) : empty ? (
        <EmptyState
          icon={<User className="h-6 w-6" strokeWidth={1.8} />}
          title={`${label} owns nothing here yet`}
          description="No skill or pack in this registry is owned by this maintainer."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {ownedPacks.length > 0 && (
            <section>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
                {ownedPacks.length === 1 ? "1 pack" : `${ownedPacks.length} packs`}
              </h2>
              <div className={packsGridClass(ownedPacks.length)}>
                {ownedPacks.map((pack) => (
                  <PackCard key={pack.id} pack={pack} skills={skills} />
                ))}
              </div>
            </section>
          )}

          {ownedSkills.length > 0 && (
            <section>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
                {ownedSkills.length === 1 ? "1 skill" : `${ownedSkills.length} skills`}
              </h2>
              <div className={SKILL_GRID}>
                {ownedSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
