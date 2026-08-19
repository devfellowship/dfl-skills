import { cn } from "@/lib/cn";
import { VISIBILITY_LABEL, VISIBILITY_TONE } from "@/consts/visibility-tone";

interface VisibilityBadgeProps {
  visibility: string;
  className?: string;
}

export function VisibilityBadge({ visibility, className }: VisibilityBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[.04em]",
        VISIBILITY_TONE[visibility] ?? VISIBILITY_TONE.public,
        className,
      )}
    >
      {VISIBILITY_LABEL[visibility] ?? visibility}
    </span>
  );
}
