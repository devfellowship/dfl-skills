import type { Kind, KindFilterValue } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@devfellowship/components";

function kindLabel(kind: Kind): string {
  return kind === "skill" ? "Skills" : kind === "mcp" ? "MCPs" : "Connections";
}

interface KindFilterProps {
  value: KindFilterValue;
  onChange: (value: KindFilterValue) => void;
  available: Kind[];
}

export function KindFilter({ value, onChange, available }: KindFilterProps) {
  const options = [
    { id: "all", label: "All" },
    ...available.map((kind) => ({ id: kind, label: kindLabel(kind) })),
  ];

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(id) => {
        if (id) onChange(id as KindFilterValue);
      }}
      aria-label="Filter by item type"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.id} value={option.id} aria-label={option.label}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
