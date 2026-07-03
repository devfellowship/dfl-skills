import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SearchMode } from "@/data/types";
import { SearchInput } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  className?: string;
}

export function SearchBar({ value, onChange, mode, onModeChange, className }: SearchBarProps) {
  const semantic = mode === "semantic";

  const toggle = (): void => {
    const next: SearchMode = semantic ? "fuzzy" : "semantic";
    onModeChange(next);
    toast.success(next === "semantic" ? "Semantic search on ✨" : "Fuzzy search on");
  };

  return (
    <SearchInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search skills, MCPs, connections…"
      className={cn("max-w-[440px] flex-1", className)}
      trailing={
        <button
          type="button"
          onClick={toggle}
          title="Toggle search mode"
          className={cn(
            "flex items-center gap-[5px] rounded-md border px-[7px] py-[3px] text-[11px] font-semibold transition-colors",
            semantic
              ? "border-[hsl(33_90%_55%/.4)] bg-[hsl(33_90%_55%/.16)] text-[hsl(33_85%_66%)]"
              : "border-[hsl(215_15%_20%)] bg-secondary text-muted-foreground",
          )}
        >
          <Sparkles className="h-3 w-3" />
          {semantic ? "Semantic" : "Fuzzy"}
        </button>
      }
    />
  );
}
