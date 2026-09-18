import { useState } from "react";
import { Button } from "@devfellowship/components";

interface TopicFilterChipsProps {
  topics: string[];
  selected: string[];
  onToggle: (topic: string) => void;
  limit?: number;
}

export function TopicFilterChips({ topics, selected, onToggle, limit = 8 }: TopicFilterChipsProps) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? topics : topics.slice(0, limit);
  const hiddenSelected = topics.slice(limit).filter((t) => selected.includes(t));
  const shown = expanded ? visible : [...visible, ...hiddenSelected];
  const overflow = topics.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((t) => (
        <Button
          key={t}
          type="button"
          aria-pressed={selected.includes(t)}
          onClick={() => onToggle(t)}
          variant={selected.includes(t) ? "default" : "outline"}
          size="sm"
          rounded="pill"
        >
          {t}
        </Button>
      ))}
      {topics.length > limit && (
        <Button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          variant="ghost"
          size="sm"
          rounded="pill"
        >
          {expanded ? "Show less" : `+${overflow} more`}
        </Button>
      )}
    </div>
  );
}
