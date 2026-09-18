import { Badge, type BadgeProps } from "@devfellowship/components";
import type { PackRole } from "@/types";

const VARIANT: Record<PackRole, BadgeProps["variant"]> = {
  root: "warning",
  required: "info",
  optional: "secondary",
  suggested: "outline",
};

export function PackRoleBadge({ role }: { role: PackRole }) {
  return (
    <Badge variant={VARIANT[role]} shape="square" data-testid="pack-member-role">
      {role}
    </Badge>
  );
}
