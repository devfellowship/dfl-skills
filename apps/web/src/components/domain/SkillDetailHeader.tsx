import { Link } from "react-router-dom";
import type { Skill } from "@/types";
import { githubAvatarUrl, skillAuthor } from "@/lib/format";
import { maintainerHref } from "@/lib/maintainer";
import { KindBadge } from "./KindBadge";

interface SkillDetailHeaderProps {
  skill: Skill;
  /** Falls back to the `author:` line in the SKILL.md when the index has none. */
  readmeAuthor: string | undefined;
}

export function SkillDetailHeader({ skill, readmeAuthor }: SkillDetailHeaderProps) {
  const author = skillAuthor(skill.author ?? readmeAuthor, skill.source);

  return (
    <div>
      <div className="mb-[6px] flex flex-wrap items-start gap-[14px]">
        <KindBadge kind={skill.kind} className="mt-[9px]" />
        <div>
          <h1 className="m-0 font-mono text-[30px] font-semibold tracking-[-.01em] text-foreground">
            {skill.name}
          </h1>
          <div className="mt-[7px] flex flex-wrap items-center gap-x-[10px] gap-y-1 text-[13px]">
            <Link
              to={maintainerHref(author)}
              className="flex items-center gap-[6px] font-medium text-[hsl(212_13%_70%)] hover:text-[hsl(33_82%_66%)] hover:underline"
            >
              <img
                src={githubAvatarUrl(author)}
                alt=""
                className="h-[17px] w-[17px] rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)]"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
              {author}
            </Link>
            <span className="font-semibold text-[hsl(33_80%_60%)]">
              {skill.source}/{skill.slug}
            </span>
          </div>
        </div>
      </div>

      <p className="m-0 mb-4 mt-[14px] max-w-[640px] text-[15px] leading-[1.6] text-[hsl(212_12%_66%)]">
        {skill.description}
      </p>

      {skill.tags.length > 0 && (
        <div className="mb-7 flex flex-wrap gap-[6px]">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] px-[9px] py-[3px] text-[12px] text-[hsl(212_12%_66%)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
