import { Link, useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { Skill } from "@/data/types";
import { authorOf, formatDate, githubAvatarUrl, installCommand } from "@/lib/format";
import { KindBadge } from "./KindBadge";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const navigate = useNavigate();

  const href = `/s/${skill.source}/${skill.slug}`;
  const author = skill.author ?? authorOf(skill.source);

  const onCopy = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const cmd = installCommand(skill.source, skill.slug);
    void navigator.clipboard?.writeText(cmd).catch(() => undefined);
    toast.success("Copied install command");
  };

  return (
    <div
      onClick={() => navigate(href)}
      className="group flex min-h-[178px] cursor-pointer animate-fadeUp flex-col gap-[11px] rounded-[13px] border border-border bg-card p-[18px] transition-all hover:-translate-y-[3px] hover:border-[hsl(215_15%_26%)] hover:shadow-[0_10px_30px_hsl(216_40%_3%/.5)]"
    >
      <div className="flex items-center justify-between gap-2">
        <KindBadge kind={skill.kind} />
        <span className="text-[11px] text-[hsl(212_10%_52%)]">{formatDate(skill.updatedAt)}</span>
      </div>

      <div>
        <Link
          to={href}
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-[15.5px] font-semibold tracking-[-.01em] text-foreground outline-none hover:text-[hsl(33_82%_66%)] focus-visible:underline"
        >
          {skill.name}
        </Link>
        <div className="mt-[5px] flex items-center gap-[6px]">
          <img
            src={githubAvatarUrl(author)}
            alt=""
            loading="lazy"
            className="h-[16px] w-[16px] shrink-0 rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)]"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="text-xs text-[hsl(212_12%_64%)]">
            {author}
            <span className="text-[hsl(212_10%_42%)]"> · {skill.source}</span>
          </span>
        </div>
      </div>

      <p className="clamp2 m-0 text-[13px] leading-[1.5] text-[hsl(212_12%_64%)]">
        {skill.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-[6px]">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] px-[8px] py-[2px] text-[11px] text-[hsl(212_12%_64%)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="flex shrink-0 items-center gap-[6px] rounded-[7px] border border-[hsl(215_15%_20%)] bg-secondary px-[10px] py-[5px] text-[11.5px] font-semibold text-[hsl(212_13%_68%)] transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Copy className="h-3 w-3" />
          Install
        </button>
      </div>
    </div>
  );
}
