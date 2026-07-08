import { useState } from "react";
import { cn } from "@/lib/cn";

interface TopicFilterChipsProps {
  topics: string[];
  selected: string[];
  onToggle: (topic: string) => void;
  limit?: number;
}

const chipClass = (on: boolean): string =>
  cn(
    "rounded-full border px-3 py-[6px] text-[12.5px] font-medium transition-colors",
    on
      ? "border-[hsl(33_90%_55%/.4)] bg-[hsl(33_90%_55%/.14)] font-semibold text-[hsl(33_85%_66%)]"
      : "border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] text-[hsl(212_12%_66%)] hover:border-[hsl(215_15%_28%)]",
  );

export function TopicFilterChips({ topics, selected, onToggle, limit = 8 }: TopicFilterChipsProps) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? topics : topics.slice(0, limit);
  const hiddenSelected = topics.slice(limit).filter((t) => selected.includes(t));
  const shown = expanded ? visible : [...visible, ...hiddenSelected];
  const overflow = topics.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={selected.includes(t)}
          onClick={() => onToggle(t)}
          className={chipClass(selected.includes(t))}
        >
          {t}
        </button>
      ))}
      {topics.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full px-2 py-[6px] text-[12.5px] font-semibold text-[hsl(33_82%_62%)] transition-colors hover:text-[hsl(33_85%_70%)]"
        >
          {expanded ? "Show less" : `+${overflow} more`}
        </button>
      )}
    </div>
  );
}
