import { Clock, Eye, Github, ArrowUpRight } from "lucide-react";
import type { Skill } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";

interface SkillMetaPanelProps {
  skill: Skill;
}

const Divider = () => <div className="h-px bg-[hsl(215_15%_14%)]" />;

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
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
  return (
    <Card className="flex flex-col gap-[14px] p-[18px]">
      <Row
        icon={<Clock className="h-[15px] w-[15px]" />}
        label="Updated"
        value={
          <span className="text-[13px] font-medium text-[hsl(208_28%_80%)]">
            {formatDate(skill.updatedAt)}
          </span>
        }
      />
      <Divider />
      <Row
        icon={<Github className="h-[15px] w-[15px]" />}
        label="Source"
        value={
          <a
            href={`https://github.com/${skill.source}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] font-semibold text-[hsl(33_82%_62%)] hover:underline"
          >
            {skill.source}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        }
      />
      <Divider />
      <Row
        icon={<Eye className="h-[15px] w-[15px]" />}
        label="Visibility"
        value={
          <span className="rounded-md bg-[hsl(215_15%_15%)] px-2 py-[3px] text-[11.5px] font-semibold uppercase tracking-[.04em] text-[hsl(212_13%_68%)]">
            {skill.visibility}
          </span>
        }
      />
    </Card>
  );
}
