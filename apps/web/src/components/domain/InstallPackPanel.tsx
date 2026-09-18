import { ClipboardCopy, Lock } from "lucide-react";
import { Button, Card, ToggleGroup, ToggleGroupItem } from "@devfellowship/components";
import type { Pack, Scope } from "@/types";
import { copyToClipboard } from "@/lib/clipboard";
import { buildPackPrompt } from "@/lib/prompt";
import { packInstallSummary, pluginInstallCommands } from "@/lib/packs";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface InstallPackPanelProps {
  pack: Pack;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/**
 * Two install blocks, mirroring the skill page's CopyPromptPanel / InstallPanel
 * split. The MCP prompt comes first because it is the path that works for an
 * internal pack: it resolves against the reader's own DFL session. The plugin
 * command clones the repo, so it only works for a reader with GitHub access.
 */
export function InstallPackPanel({ pack, scope, onScopeChange }: InstallPackPanelProps) {
  const prompt = buildPackPrompt({ source: pack.source, slug: pack.slug, scope });
  const summary = packInstallSummary(pack);
  const plugin = pluginInstallCommands(pack);
  const blocked = summary.notPublished > 0;

  return (
    <>
      <Card className="p-[18px]" data-testid="install-pack">
        <h2 className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
          Install the pack
        </h2>
        {/* The inventory BEFORE the button: a nine-skill pack is a recurring
            per-turn context cost, never a bare Install button. */}
        <p data-testid="pack-install-summary" className="m-0 mb-3 text-[13px] leading-[1.6] text-[hsl(208_28%_80%)]">
          Installs {plural(summary.skills, "skill")}
          {summary.suggested > 0 && <> · {summary.suggested} suggested, left out unless you ask</>}
          {" · "}
          <span className={blocked ? "font-semibold text-[hsl(0_75%_70%)]" : undefined}>
            {summary.notPublished} not published
          </span>
        </p>
        <p className="m-0 mb-4 text-[12.5px] leading-[1.6] text-[hsl(212_11%_58%)]">
          Copy a prompt and paste it into your own AI. It calls{" "}
          <code className="font-mono text-[11.5px] text-[hsl(208_28%_80%)]">install_pack</code> on the
          DFL Forge MCP, which returns every file of every member with its hash. Nothing is installed
          from here.
        </p>
        {blocked && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-dashed border-[hsl(0_70%_55%/.35)] px-3 py-[10px] text-[12.5px] leading-[1.55] text-[hsl(212_11%_58%)]">
            <Lock className="mt-[2px] h-[14px] w-[14px] shrink-0 text-[hsl(0_75%_70%)]" />
            The MCP refuses a partial pack, so this install fails until every member is published.
          </div>
        )}
        <Button
          onClick={() => copyToClipboard(prompt, "Prompt copied — paste it into your agent")}
          disabled={!prompt}
          className="mb-[18px] w-full"
        >
          <ClipboardCopy className="h-[15px] w-[15px]" strokeWidth={2.2} />
          Copy install prompt
        </Button>

        <h2 className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
          Scope
        </h2>
        <ToggleGroup
          type="single"
          value={scope}
          onValueChange={(value) => {
            if (value) onScopeChange(value as Scope);
          }}
          className="grid grid-cols-1 sm:grid-cols-2"
          aria-label="Installation scope"
        >
          <ToggleGroupItem value="global">Global (~/.claude/skills)</ToggleGroupItem>
          <ToggleGroupItem value="project">Project (./.claude/skills)</ToggleGroupItem>
        </ToggleGroup>
      </Card>

      {plugin.length > 0 && (
        <Card className="p-[18px]" data-testid="install-pack-plugin">
          <h2 className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
            Claude Code plugin
          </h2>
          <p className="m-0 mb-3 text-[12.5px] leading-[1.6] text-[hsl(212_11%_58%)]">
            {pack.visibility === "public" ? (
              "The same set as one plugin. Claude Code handles updates and removal."
            ) : (
              <>
                Needs GitHub read access to{" "}
                <code className="font-mono text-[11.5px] text-[hsl(208_28%_80%)]">{pack.source}</code>.
                Without it, use the prompt above.
              </>
            )}
          </p>
          <div className="flex flex-col gap-2">
            {plugin.map((cmd) => (
              <CodeBlock key={cmd} command={cmd} size="sm" copyMessage="Copied" />
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
