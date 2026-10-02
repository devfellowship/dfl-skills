import { ClipboardCopy, Lock } from "lucide-react";
import { Button, Card, ToggleGroup, ToggleGroupItem } from "@devfellowship/components";
import type { Scope } from "@/types";
import { copyToClipboard } from "@/lib/clipboard";
import { buildSkillPrompt, skillDirectory } from "@/lib/prompt";
import { SignInPrompt } from "./SignInPrompt";
import { DownloadSkillButton } from "./DownloadSkillButton";

interface CopyPromptPanelProps {
  source: string;
  slug: string;
  /** The verbatim SKILL.md, or null while it is unavailable. */
  markdown: string | null;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  /** Rendered instead of the button when the body is gated behind a session. */
  needsSignIn: boolean;
}

export function CopyPromptPanel({
  source,
  slug,
  markdown,
  scope,
  onScopeChange,
  needsSignIn,
}: CopyPromptPanelProps) {
  const prompt = buildSkillPrompt({ source, slug, scope });

  return (
    <Card className="p-[18px]">
      <h2 className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
        Add to your agent
      </h2>
      <p className="m-0 mb-4 text-[12.5px] leading-[1.6] text-[hsl(212_11%_58%)]">
        Copy a prompt and paste it into your own AI. It fetches this skill from the DFL
        Forge MCP and writes{" "}
        <code className="font-mono text-[11.5px] text-[hsl(208_28%_80%)]">
          {skillDirectory(slug, scope)}SKILL.md
        </code>{" "}
        for you. Nothing is installed from here.
      </p>

      {needsSignIn ? (
        <div className="mb-[18px] flex items-start gap-2 rounded-lg border border-dashed border-[hsl(215_15%_18%)] px-3 py-[10px] text-[12.5px] leading-[1.55] text-[hsl(212_11%_58%)]">
          <Lock className="mt-[2px] h-[14px] w-[14px] shrink-0 text-[hsl(33_82%_62%)]" />
          <div className="flex flex-col items-start gap-2">
            Sign in with GitHub to copy this one.
            <SignInPrompt size="sm" />
          </div>
        </div>
      ) : (
        <div className="mb-[18px] flex flex-col gap-2">
          <Button
            onClick={() => copyToClipboard(prompt, "Prompt copied — paste it into your agent")}
            disabled={!prompt}
            className="w-full"
          >
            <ClipboardCopy className="h-[15px] w-[15px]" strokeWidth={2.2} />
            Copy install prompt
          </Button>
          <DownloadSkillButton slug={slug} markdown={markdown} />
        </div>
      )}

      <h2 className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
        Scope
      </h2>
      <ToggleGroup
        type="single"
        value={scope}
        onValueChange={(value) => {
          if (value) onScopeChange(value as Scope);
        }}
        className="grid grid-cols-2 gap-1"
        aria-label="Installation scope"
      >
        <ToggleGroupItem value="global" title="~/.claude/skills">Global</ToggleGroupItem>
        <ToggleGroupItem value="project" title="./.claude/skills">Project</ToggleGroupItem>
      </ToggleGroup>
    </Card>
  );
}
