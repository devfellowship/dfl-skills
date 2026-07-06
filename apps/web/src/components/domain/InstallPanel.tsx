import { Download } from "lucide-react";
import { toast } from "sonner";
import type { Scope } from "@/data/types";
import { Card } from "@/components/ui/Card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { AgentSelector, AGENTS } from "./AgentSelector";

interface InstallPanelProps {
  command: string;
  agent: string;
  onAgentChange: (id: string) => void;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
}

const PanelLabel = ({ children }: { children: string }) => (
  <div className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-[hsl(212_10%_54%)]">
    {children}
  </div>
);

export function InstallPanel({
  command,
  agent,
  onAgentChange,
  scope,
  onScopeChange,
}: InstallPanelProps) {
  const agentLabel = AGENTS.find((a) => a.id === agent)?.label ?? "";

  const copy = (): void => {
    void navigator.clipboard?.writeText(command).catch(() => undefined);
    toast.success("Copied install command");
  };

  return (
    <Card className="p-[18px]">
      <PanelLabel>Install</PanelLabel>
      <CodeBlock command={command} size="sm" className="mb-[6px]" />
      <div className="mb-4 font-mono text-[11px] text-[hsl(212_9%_46%)]">
        # {agentLabel} · {scope}
      </div>

      <Button
        onClick={copy}
        icon={<Download className="h-[15px] w-[15px]" strokeWidth={2.2} />}
        className="mb-[18px] w-full"
      >
        Copy install command
      </Button>

      <PanelLabel>Target agent</PanelLabel>
      <div className="mb-4">
        <AgentSelector value={agent} onChange={onAgentChange} />
      </div>

      <PanelLabel>Scope</PanelLabel>
      <Select
        full
        options={[
          { id: "global", label: "Global" },
          { id: "project", label: "Project" },
        ]}
        value={scope}
        onChange={(id) => onScopeChange(id as Scope)}
      />
    </Card>
  );
}
