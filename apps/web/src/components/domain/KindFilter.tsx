import type { Kind } from "@/data/types";
import { Select, type SelectOption } from "@/components/ui/Select";

export type KindFilterValue = "all" | Kind;

const OPTIONS: SelectOption[] = [
  { id: "all", label: "All" },
  { id: "skill", label: "Skills" },
  { id: "mcp", label: "MCPs" },
  { id: "connection", label: "Connections" },
];

interface KindFilterProps {
  value: KindFilterValue;
  onChange: (value: KindFilterValue) => void;
}

export function KindFilter({ value, onChange }: KindFilterProps) {
  return (
    <Select
      options={OPTIONS}
      value={value}
      onChange={(id) => onChange(id as KindFilterValue)}
    />
  );
}
