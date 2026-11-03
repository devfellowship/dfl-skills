import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, Layers } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";
import { usePacks } from "@/hooks/usePacks";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackCard } from "@/components/domain/PackCard";
import { PackCardSkeleton } from "@/components/domain/PackCardSkeleton";
import { packsGridClass } from "@/lib/pack-home";
import { PacksPageHeader } from "@/components/domain/PacksPageHeader";
import { PackSortControls } from "@/components/domain/PackSortControls";
import { DEFAULT_PACK_SORT, packAuthorOptions, parsePackSort, viewPacks, type PackSort } from "@/lib/pack-sort";

/** Every pack the caller can see, on its own page at /packs. */
export function PacksPage() {
  const { packs, loading: packsLoading } = usePacks();
  const { skills, loading: skillsLoading } = useSkills();
  // Dates and authors resolve against the catalogue, so wait for both: otherwise the cards reorder when it lands.
  const loading = packsLoading || skillsLoading;
  const [params, setParams] = useSearchParams();
  const sort = parsePackSort(params.get("sort"));
  const authors = useMemo(() => packAuthorOptions(packs, skills), [packs, skills]);
  // An author that no pack has (a stale link) filters nothing instead of hiding everything.
  const requested = params.get("author");
  const author = requested && authors.includes(requested) ? requested : null;
  const sorted = useMemo(() => viewPacks(packs, skills, { sort, author }), [packs, skills, sort, author]);

  const setParam = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

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

      {!loading && packs.length > 0 && (
        <PackSortControls
          sort={sort}
          onSortChange={(next: PackSort) => setParam("sort", next === DEFAULT_PACK_SORT ? null : next)}
          author={author}
          onAuthorChange={(next) => setParam("author", next)}
          authors={authors}
        />
      )}

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
