import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "default"
  | "orange"
  | "success"
  | "warning"
  | "danger"
  | "kind-skill"
  | "kind-mcp"
  | "kind-connection";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const TONES: Record<BadgeTone, string> = {
  default:
    "text-muted-foreground bg-secondary border border-[hsl(215_15%_20%)] font-semibold",
  orange: "text-primary-foreground bg-primary font-bold",
  success:
    "text-[hsl(142_55%_60%)] bg-[hsl(142_55%_45%/.14)] border border-[hsl(142_55%_45%/.25)] font-semibold",
  warning:
    "text-[hsl(45_90%_60%)] bg-[hsl(45_90%_50%/.14)] border border-[hsl(45_90%_50%/.25)] font-semibold",
  danger:
    "text-[hsl(0_80%_68%)] bg-[hsl(0_70%_50%/.14)] border border-[hsl(0_70%_50%/.25)] font-semibold",
  "kind-skill":
    "text-[hsl(207_85%_66%)] bg-[hsl(207_85%_60%/.12)] border border-[hsl(207_85%_60%/.25)] font-bold tracking-[.05em]",
  "kind-mcp":
    "text-[hsl(270_80%_74%)] bg-[hsl(270_70%_60%/.12)] border border-[hsl(270_70%_60%/.25)] font-bold tracking-[.05em]",
  "kind-connection":
    "text-[hsl(168_65%_58%)] bg-[hsl(168_60%_45%/.12)] border border-[hsl(168_60%_45%/.25)] font-bold tracking-[.05em]",
};

export function Badge({ tone = "default", children, className, style }: BadgeProps) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-[9px] py-[3px] text-[11px] leading-none",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
