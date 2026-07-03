import { AGENTS } from "@/data/skills";
import { cn } from "@/lib/cn";

interface AgentSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export function AgentSelector({ value, onChange }: AgentSelectorProps) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {AGENTS.map((a) => {
        const active = a.id === value;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            className={cn(
              "rounded-[7px] border px-[11px] py-[6px] text-xs font-semibold transition-colors",
              active
                ? "border-[hsl(33_90%_55%/.45)] bg-[hsl(33_90%_55%/.14)] text-[hsl(33_85%_66%)]"
                : "border-[hsl(215_15%_18%)] bg-[hsl(215_18%_13%)] text-muted-foreground hover:text-foreground/80",
            )}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
