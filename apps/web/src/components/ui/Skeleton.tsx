import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div style={style} className={cn("shimmer rounded-md", className)} />;
}
