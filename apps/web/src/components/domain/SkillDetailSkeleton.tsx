import { Skeleton } from "@/components/ui/Skeleton";

export function SkillDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[30px] w-1/2 rounded-[7px]" />
        <Skeleton className="h-[200px] w-full rounded-[11px]" />
      </div>
      <Skeleton className="h-[340px] rounded-[13px]" />
    </div>
  );
}
