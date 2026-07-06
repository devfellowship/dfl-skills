import type { Kind } from "@/data/types";

export interface KindMeta {
  label: string;
  fg: string;
  bg: string;
  border: string;
}

export function kindMeta(kind: Kind): KindMeta {
  if (kind === "skill") {
    return {
      label: "SKILL",
      fg: "hsl(207 85% 68%)",
      bg: "hsl(207 85% 60% / .12)",
      border: "hsl(207 85% 60% / .25)",
    };
  }
  if (kind === "mcp") {
    return {
      label: "MCP",
      fg: "hsl(270 80% 76%)",
      bg: "hsl(270 70% 60% / .13)",
      border: "hsl(270 70% 60% / .26)",
    };
  }
  return {
    label: "CONNECTION",
    fg: "hsl(168 65% 60%)",
    bg: "hsl(168 60% 45% / .13)",
    border: "hsl(168 60% 45% / .26)",
  };
}
