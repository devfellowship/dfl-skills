import { Link } from "react-router-dom";
import { ChevronLeft, Layers } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";
import { usePacks } from "@/hooks/usePacks";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackCard } from "@/components/domain/PackCard";
import { PackCardSkeleton } from "@/components/domain/PackCardSkeleton";
import { packsGridClass } from "@/lib/pack-home";
import { PacksPageHeader } from "@/components/domain/PacksPageHeader";

/** Every pack the caller can see, on its own page at /packs. */
export function PacksPage() {
  const { packs, loading } = usePacks();
  const { skills } = useSkills();
  const sorted = [...packs].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-[90px] pt-6" data-testid="packs-page">
      <Link
        to="/"
        className="mb-2 inline-flex items-center gap-[7px] py-2 text-[13px] font-medium text-[hsl(212_11%_58%)] transition-colors hover:text-foreground/80"
      >
        <ChevronLeft className="h-[15px] w-[15px]" />
        Back to registry
      </Link>

      <PacksPageHeader count={packs.length} loading={loading} />

      {loading ? (
        <div className={packsGridClass(2)}>
          <PackCardSkeleton />
          <PackCardSkeleton />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6" strokeWidth={1.8} />}
          title="No packs to show"
          description="No pack is visible to you yet. Internal packs appear once you sign in with DFL; public ones once they are published."
        />
      ) : (
        <div className={packsGridClass(sorted.length)}>
          {sorted.map((pack) => (
            <PackCard key={pack.id} pack={pack} skills={skills} />
          ))}
        </div>
      )}
    </main>
  );
}
