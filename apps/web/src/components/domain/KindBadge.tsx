import type { Kind } from "@/types";
import { kindMeta } from "@/lib/meta";
import { Badge, type BadgeProps } from "@devfellowship/components";

const VARIANT: Record<Kind, BadgeProps["variant"]> = {
  skill: "info",
  mcp: "default",
  connection: "success",
};

interface KindBadgeProps {
  kind: Kind;
  className?: string;
}

export function KindBadge({ kind, className }: KindBadgeProps) {
  return (
    <Badge variant={VARIANT[kind]} shape="square" className={className}>
      {kindMeta(kind).label}
    </Badge>
  );
}
