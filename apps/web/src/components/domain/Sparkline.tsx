import { sparkPath } from "@/lib/format";

interface SparklineProps {
  trend: number[];
}

export function Sparkline({ trend }: SparklineProps) {
  return (
    <svg width="56" height="18" viewBox="0 0 60 18" fill="none" className="overflow-visible">
      <path
        d={sparkPath(trend)}
        stroke="hsl(33 88% 58%)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}
