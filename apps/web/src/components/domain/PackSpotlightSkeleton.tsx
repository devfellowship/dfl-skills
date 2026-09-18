import { Skeleton } from "@devfellowship/components";
import { SHOWCASE_GRAPH_SIZE } from "@/consts/pack-home";

export function PackSpotlightSkeleton() {
  return (
    <div className="rounded-[18px] border border-[hsl(33_90%_55%/.14)] bg-card p-6" data-testid="pack-spotlight-skeleton">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton
        className="mx-auto my-4 rounded-full"
        style={{ width: SHOWCASE_GRAPH_SIZE, height: SHOWCASE_GRAPH_SIZE }}
      />
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
      <Skeleton className="mt-4 h-[5px] w-full rounded-full" />
      <Skeleton className="mt-5 h-8 w-28" />
    </div>
  );
}
