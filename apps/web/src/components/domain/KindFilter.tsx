import type { Kind } from "@/data/types";
import { Select, type SelectOption } from "@/components/ui/Select";

export type KindFilterValue = "all" | Kind;

function kindLabel(kind: Kind): string {
  return kind === "skill" ? "Skills" : kind === "mcp" ? "MCPs" : "Connections";
}

interface KindFilterProps {
  value: KindFilterValue;
  onChange: (value: KindFilterValue) => void;
  available: Kind[];
}

export function KindFilter({ value, onChange, available }: KindFilterProps) {
  const options: SelectOption[] = [
    { id: "all", label: "All" },
    ...available.map((kind) => ({ id: kind, label: kindLabel(kind) })),
  ];

  return <Select options={options} value={value} onChange={(id) => onChange(id as KindFilterValue)} />;
}
