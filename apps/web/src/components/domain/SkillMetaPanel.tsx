import { Clock, Download, Github, ArrowUpRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { Skill } from "@/data/types";
import { formatCount } from "@/lib/format";
import { auditMeta } from "@/lib/meta";
import { Card } from "@/components/ui/Card";
import { useCountUp } from "@/hooks/useCountUp";

interface SkillMetaPanelProps {
  skill: Skill;
}

const Divider = () => <div className="h-px bg-[hsl(215_15%_14%)]" />;

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[13px] text-[hsl(212_11%_58%)]">
        {icon}
        {label}
      </div>
      {value}
    </div>
  );
}

export function SkillMetaPanel({ skill }: SkillMetaPanelProps) {
  const count = useCountUp(skill.installs);
  const meta = auditMeta(skill.audit.verdict);
  const AuditIcon = skill.audit.verdict === "trust" ? ShieldCheck : ShieldAlert;

  return (
    <Card className="flex flex-col gap-[14px] p-[18px]">
      <Row
        icon={<Download className="h-[15px] w-[15px]" />}
        label="Installs"
        value={
          <span className="font-heading text-[22px] font-bold leading-none text-foreground">
            {formatCount(count)}
          </span>
        }
      />
      <Divider />
      <Row
        icon={<Clock className="h-[15px] w-[15px]" />}
        label="Updated"
        value={<span className="text-[13px] font-medium text-[hsl(208_28%_80%)]">{skill.updatedAt}</span>}
      />
      <Divider />
      <Row
        icon={<Github className="h-[15px] w-[15px]" />}
        label="Source"
        value={
          <button
            type="button"
            onClick={() => toast.success("Opening source repository…")}
            className="flex items-center gap-1 text-[13px] font-semibold text-[hsl(33_82%_62%)]"
          >
            {skill.source}/skills
            <ArrowUpRight className="h-3 w-3" />
          </button>
        }
      />
      <Divider />
      <div
        className="flex items-center gap-[11px] rounded-[9px] p-[11px]"
        style={{ background: meta.panelBg, border: `1px solid ${meta.panelBorder}` }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ color: meta.fg, background: meta.chipBg }}
        >
          <AuditIcon className="h-[17px] w-[17px]" />
        </span>
        <div className="flex-1">
          <div className="text-[13px] font-bold" style={{ color: meta.fg }}>
            {meta.title}
          </div>
          <div className="mt-px text-xs text-[hsl(212_11%_58%)]">
            Audit score {skill.audit.score}/100 · {meta.note}
          </div>
        </div>
      </div>
    </Card>
  );
}
