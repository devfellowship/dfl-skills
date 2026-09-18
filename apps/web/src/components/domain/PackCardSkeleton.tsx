import { Skeleton } from "@devfellowship/components";

export function PackCardSkeleton() {
  return (
    <div className="flex min-h-[250px] flex-col gap-4 rounded-[16px] border border-[hsl(33_90%_55%/.14)] bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Skeleton className="mb-3 h-5 w-16" />
          <Skeleton className="h-7 w-3/5" />
          <Skeleton className="mt-2 h-3 w-2/5" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
        <Skeleton className="hidden h-[120px] w-[120px] rounded-full sm:block" />
      </div>
      <Skeleton className="h-[5px] w-full rounded-full" />
      <Skeleton className="mt-auto h-[14px] w-1/3" />
    </div>
  );
}
