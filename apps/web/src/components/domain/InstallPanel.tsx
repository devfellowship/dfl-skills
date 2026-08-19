import { Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Button } from "@/components/ui/Button";
import { PanelLabel } from "@/components/ui/PanelLabel";
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
      <PanelLabel>Install from the CLI</PanelLabel>
      <CodeBlock command={command} size="sm" className="mb-[6px]" />
      <div className="mb-4 font-mono text-[11px] text-[hsl(212_9%_46%)]"># {agentLabel}</div>

      <Button
        onClick={() => copyToClipboard(command, "Copied install command")}
        icon={<Download className="h-[15px] w-[15px]" strokeWidth={2.2} />}
        className="mb-[18px] w-full"
      >
        Copy install command
      </Button>

      <PanelLabel>Target agent</PanelLabel>
      <AgentSelector value={agent} onChange={onAgentChange} />
    </Card>
  );
}
