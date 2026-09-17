import { Download } from "lucide-react";
import { Button, Card } from "@devfellowship/components";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { copyToClipboard } from "@/lib/clipboard";
import { AgentSelector, AGENTS } from "./AgentSelector";

interface InstallPanelProps {
  command: string;
  agent: string;
  onAgentChange: (id: string) => void;
}

export function InstallPanel({ command, agent, onAgentChange }: InstallPanelProps) {
  const agentLabel = AGENTS.find((a) => a.id === agent)?.label ?? "";

  return (
    <Card className="p-[18px]">
      <h2 className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
        Install from the CLI
      </h2>
      <CodeBlock command={command} size="sm" className="mb-[6px]" />
      <div className="mb-4 font-mono text-[11px] text-[hsl(212_9%_46%)]"># {agentLabel}</div>

      <Button
        onClick={() => copyToClipboard(command, "Copied install command")}
        className="mb-[18px] w-full"
      >
        <Download className="h-[15px] w-[15px]" strokeWidth={2.2} />
        Copy install command
      </Button>

      <h2 className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
        Target agent
      </h2>
      <AgentSelector value={agent} onChange={onAgentChange} />
    </Card>
  );
}
