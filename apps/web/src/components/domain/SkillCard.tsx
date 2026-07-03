import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { Skill } from "@/data/types";
import { installCommand } from "@/lib/format";
import { KindBadge } from "./KindBadge";
import { AuditBadge } from "./AuditBadge";
import { Sparkline } from "./Sparkline";
import { InstallCountBadge } from "./InstallCountBadge";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const navigate = useNavigate();

  const onCopy = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const cmd = installCommand(skill.source, skill.slug);
    void navigator.clipboard?.writeText(cmd).catch(() => undefined);
    toast.success("Copied install command");
  };

  return (
    <div
      onClick={() => navigate(`/s/${skill.source}/${skill.slug}`)}
      className="group flex min-h-[178px] cursor-pointer animate-fadeUp flex-col gap-[11px] rounded-[13px] border border-border bg-card p-[18px] transition-all hover:-translate-y-[3px] hover:border-[hsl(215_15%_26%)] hover:shadow-[0_10px_30px_hsl(216_40%_3%/.5)]"
    >
      <div className="flex items-center justify-between gap-2">
        <KindBadge kind={skill.kind} />
        <AuditBadge verdict={skill.audit.verdict} />
      </div>

      <div>
        <div className="font-mono text-[15.5px] font-semibold tracking-[-.01em] text-foreground">
          {skill.name}
        </div>
        <div className="mt-[3px] flex items-center gap-[5px] text-xs text-[hsl(212_10%_52%)]">
          <span className="text-[hsl(33_80%_60%)]">{skill.source}</span>
          <span>·</span>
          <span>{skill.author}</span>
        </div>
      </div>

      <p className="clamp2 m-0 text-[13px] leading-[1.5] text-[hsl(212_12%_64%)]">
        {skill.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-[9px]">
          <InstallCountBadge installs={skill.installs} />
          <Sparkline trend={skill.trend} />
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-[6px] rounded-[7px] border border-[hsl(215_15%_20%)] bg-secondary px-[10px] py-[5px] text-[11.5px] font-semibold text-[hsl(212_13%_68%)] transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Copy className="h-3 w-3" />
          Install
        </button>
      </div>
    </div>
  );
}
