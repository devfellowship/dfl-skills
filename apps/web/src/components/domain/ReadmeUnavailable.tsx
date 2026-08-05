import { ArrowUpRight, FileWarning, Lock, Unplug } from "lucide-react";
import type { ReadmeStatus } from "@/hooks/useSkillReadme";
import { installCommand } from "@/lib/format";
import { skillMdGithubUrl } from "@/lib/readme";

interface ReadmeUnavailableProps {
  status: Exclude<ReadmeStatus, "loading" | "ok">;
  source: string;
  slug: string;
  detail: string | null;
}

/**
 * The three ways a README can fail to resolve, each rendered distinctly so a
 * reader can tell them apart at a glance — and so NONE of them can be mistaken
 * for "this skill simply has no README".
 */
export function ReadmeUnavailable({ status, source, slug, detail }: ReadmeUnavailableProps) {
  const githubUrl = skillMdGithubUrl(source, slug);

  const copy = {
    private: {
      icon: <Lock className="h-[18px] w-[18px]" strokeWidth={1.9} />,
      title: "SKILL.md is in a private registry",
      body: `${source} is private, so its SKILL.md cannot be rendered here. Install the skill to read it locally, or open it on GitHub if you have access to the repo.`,
      tone: "text-[hsl(33_82%_62%)]",
    },
    missing: {
      icon: <FileWarning className="h-[18px] w-[18px]" strokeWidth={1.9} />,
      title: "SKILL.md not found",
      body: `The registry lists this skill, but no SKILL.md exists at the expected path in ${source}. The registry index may be ahead of the repo.`,
      tone: "text-[hsl(0_70%_66%)]",
    },
    error: {
      icon: <Unplug className="h-[18px] w-[18px]" strokeWidth={1.9} />,
      title: "Couldn't load SKILL.md",
      body: "The request for this skill's SKILL.md failed. This is usually transient — reload to try again.",
      tone: "text-[hsl(0_70%_66%)]",
    },
  }[status];

  return (
    <div className="animate-fadeUp rounded-[11px] border border-dashed border-[hsl(215_15%_18%)] bg-[hsl(215_21%_9.5%)] px-5 py-8">
      <div className={`flex items-center gap-2 ${copy.tone}`}>
        {copy.icon}
        <span className="font-heading text-[15px] font-semibold uppercase tracking-[.01em]">
          {copy.title}
        </span>
      </div>

      <p className="mt-3 max-w-[520px] text-[13.5px] leading-[1.65] text-[hsl(212_11%_58%)]">
        {copy.body}
      </p>

      {status === "private" && (
        <code className="mt-4 block w-fit rounded-md border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] px-3 py-2 font-mono text-[12.5px] text-[hsl(208_28%_80%)]">
          {installCommand(source, slug)}
        </code>
      )}

      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[hsl(33_82%_62%)] hover:underline"
        >
          View SKILL.md on GitHub
          <ArrowUpRight className="h-3 w-3" />
        </a>
      )}

      {detail && (
        <p className="mt-4 break-all font-mono text-[11.5px] leading-[1.5] text-[hsl(212_10%_42%)]">
          {detail}
        </p>
      )}
    </div>
  );
}
