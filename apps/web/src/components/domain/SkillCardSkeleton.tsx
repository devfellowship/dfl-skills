import { Skeleton } from "@/components/ui/Skeleton";

export function SkillCardSkeleton() {
  return (
    <div className="flex min-h-[178px] flex-col gap-[13px] rounded-[13px] border border-[hsl(215_15%_15%)] bg-card p-[18px]">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-[54px]" />
      </div>
      <Skeleton className="h-[18px] w-3/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="mt-auto h-[14px] w-2/5" />
    </div>
  );
}
