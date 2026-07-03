import type { Kind } from "@/data/types";
import { kindMeta } from "@/lib/meta";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const TONE: Record<Kind, BadgeTone> = {
  skill: "kind-skill",
  mcp: "kind-mcp",
  connection: "kind-connection",
};

interface KindBadgeProps {
  kind: Kind;
  className?: string;
}

export function KindBadge({ kind, className }: KindBadgeProps) {
  return (
    <Badge tone={TONE[kind]} className={className}>
      {kindMeta(kind).label}
    </Badge>
  );
}
