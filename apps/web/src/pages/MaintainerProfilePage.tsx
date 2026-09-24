import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, User } from "lucide-react";
import { Button } from "@devfellowship/components";
import { useSkills } from "@/hooks/useSkills";
import { usePacks } from "@/hooks/usePacks";
import { useAuth } from "@/hooks/useAuth";
import { isCoreHandle, maintainerLabel, packsByMaintainer, skillsByMaintainer } from "@/lib/maintainer";
import { packsGridClass } from "@/lib/pack-home";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkillCard } from "@/components/domain/SkillCard";
import { SkillCardSkeleton } from "@/components/domain/SkillCardSkeleton";
import { PackCard } from "@/components/domain/PackCard";
import { PackCardSkeleton } from "@/components/domain/PackCardSkeleton";
import { BackToRegistryLink } from "@/components/domain/BackToRegistryLink";
import { MaintainerProfileHeader } from "@/components/domain/MaintainerProfileHeader";

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
  const { profile } = useAuth();
  const self = profile && !core && profile.handle.toLowerCase() === handle.trim().toLowerCase() ? profile : null;

  const ownedSkills = useMemo(() => skillsByMaintainer(skills, handle), [skills, handle]);
  const ownedPacks = useMemo(() => packsByMaintainer(packs, skills, handle), [packs, skills, handle]);
  const empty = !loading && !error && ownedSkills.length === 0 && ownedPacks.length === 0;

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px] pt-6">
      <BackToRegistryLink />

      <MaintainerProfileHeader
        handle={handle}
        label={label}
        core={core}
        self={self}
        counts={loading || error ? null : { packs: ownedPacks.length, skills: ownedSkills.length }}
      />

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
        self ? (
          <EmptyState
            icon={<User className="h-6 w-6" strokeWidth={1.8} />}
            title="Nothing published yet"
            description="Skills and packs you author show up here. Set author: to your GitHub handle and open a pull request."
            action={
              <Button asChild>
                <Link to="/docs">How to publish</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<User className="h-6 w-6" strokeWidth={1.8} />}
            title="Nothing published yet"
            description={`No skill or pack you can see here is maintained by ${core ? "the core team" : `@${handle}`}.`}
          />
        )
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
