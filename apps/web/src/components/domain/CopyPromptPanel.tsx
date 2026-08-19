import { ClipboardCopy, Lock } from "lucide-react";
import type { Scope } from "@/data/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PanelLabel } from "@/components/ui/PanelLabel";
import { copyToClipboard } from "@/lib/clipboard";
import { buildSkillPrompt, skillDirectory } from "@/lib/prompt";

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
  const prompt = markdown ? buildSkillPrompt({ source, slug, scope, markdown }) : null;

  return (
    <Card className="p-[18px]">
      <PanelLabel>Add to your agent</PanelLabel>
      <p className="m-0 mb-4 text-[12.5px] leading-[1.6] text-[hsl(212_11%_58%)]">
        Copy a prompt and paste it into your own AI. It writes{" "}
        <code className="font-mono text-[11.5px] text-[hsl(208_28%_80%)]">
          {skillDirectory(slug, scope)}SKILL.md
        </code>{" "}
        for you. Nothing is installed from here.
      </p>

      {needsSignIn ? (
        <div className="mb-[18px] flex items-start gap-2 rounded-lg border border-dashed border-[hsl(215_15%_18%)] px-3 py-[10px] text-[12.5px] leading-[1.55] text-[hsl(212_11%_58%)]">
          <Lock className="mt-[2px] h-[14px] w-[14px] shrink-0 text-[hsl(33_82%_62%)]" />
          Sign in with your DevFellowship account to copy this one.
        </div>
      ) : (
        <Button
          onClick={() => copyToClipboard(prompt, "Prompt copied — paste it into your agent")}
          disabled={!prompt}
          icon={<ClipboardCopy className="h-[15px] w-[15px]" strokeWidth={2.2} />}
          className="mb-[18px] w-full"
        >
          Copy prompt
        </Button>
      )}

      <PanelLabel>Scope</PanelLabel>
      <Select
        full
        options={[
          { id: "global", label: "Global (~/.claude/skills)" },
          { id: "project", label: "Project (./.claude/skills)" },
        ]}
        value={scope}
        onChange={(id) => onScopeChange(id as Scope)}
      />
    </Card>
  );
}
