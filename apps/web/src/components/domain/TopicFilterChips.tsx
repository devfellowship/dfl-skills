import { cn } from "@/lib/cn";

interface TopicFilterChipsProps {
  topics: string[];
  selected: string[];
  onToggle: (topic: string) => void;
}

export function TopicFilterChips({ topics, selected, onToggle }: TopicFilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {topics.map((t) => {
        const on = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            className={cn(
              "rounded-full border px-3 py-[6px] text-[12.5px] font-medium transition-colors",
              on
                ? "border-[hsl(33_90%_55%/.4)] bg-[hsl(33_90%_55%/.14)] font-semibold text-[hsl(33_85%_66%)]"
                : "border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] text-[hsl(212_12%_66%)] hover:border-[hsl(215_15%_28%)]",
            )}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
