import { Download } from "lucide-react";
import { formatCount } from "@/lib/format";

interface InstallCountBadgeProps {
  installs: number;
}

export function InstallCountBadge({ installs }: InstallCountBadgeProps) {
  return (
    <span className="inline-flex items-center gap-[5px] text-[12.5px] font-semibold text-foreground/80">
      <Download className="h-[13px] w-[13px] text-[hsl(212_10%_56%)]" />
      {formatCount(installs)}
    </span>
  );
}
