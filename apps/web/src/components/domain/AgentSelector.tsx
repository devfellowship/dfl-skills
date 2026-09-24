import type { AgentTarget } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@devfellowship/components";

export const AGENTS: AgentTarget[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
  { id: "codex", label: "Codex" },
  { id: "opencode", label: "opencode" },
  { id: "windsurf", label: "Windsurf" },
];

interface AgentSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export function AgentSelector({ value, onChange }: AgentSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      className="flex flex-wrap justify-start"
      aria-label="Target agent"
    >
      {AGENTS.map((agent) => (
        <ToggleGroupItem
          key={agent.id}
          value={agent.id}
          aria-label={agent.label}
          className="flex-none px-3"
        >
          {agent.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
