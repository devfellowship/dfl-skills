import { ShieldCheck, ShieldAlert } from "lucide-react";
import type { AuditVerdict } from "@/data/types";
import { auditMeta } from "@/lib/meta";

interface AuditBadgeProps {
  verdict: AuditVerdict;
}

export function AuditBadge({ verdict }: AuditBadgeProps) {
  const meta = auditMeta(verdict);
  const Icon = verdict === "trust" ? ShieldCheck : ShieldAlert;
  return (
    <span
      className="inline-flex items-center gap-[5px] text-[11px] font-semibold"
      style={{ color: meta.fg }}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
