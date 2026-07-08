import { Skeleton } from "@/components/ui/Skeleton";

export function SkillReadmeSkeleton() {
  return (
    <div className="flex animate-fadeUp flex-col gap-3">
      <Skeleton className="h-[26px] w-2/5 rounded-[7px]" />
      <Skeleton className="h-[14px] w-full rounded-[5px]" />
      <Skeleton className="h-[14px] w-11/12 rounded-[5px]" />
      <Skeleton className="h-[14px] w-4/5 rounded-[5px]" />
      <Skeleton className="mt-3 h-[100px] w-full rounded-[9px]" />
      <Skeleton className="h-[14px] w-3/4 rounded-[5px]" />
      <Skeleton className="h-[14px] w-5/6 rounded-[5px]" />
    </div>
  );
}
