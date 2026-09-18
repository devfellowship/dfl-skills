import type { PackRole } from "@/types";

export const EDGE_DASH: Record<PackRole, string | undefined> = {
  root: undefined,
  required: undefined,
  optional: "5 4",
  suggested: "1.5 3.5",
};

export const RING_COLOR: Record<PackRole, string> = {
  root: "hsl(33 92% 58%)",
  required: "hsl(205 80% 62%)",
  optional: "hsl(212 14% 66%)",
  suggested: "hsl(212 10% 48%)",
};

export const EDGE_COLOR = "hsl(212 12% 44%)";
export const NODE_FILL = "hsl(215 18% 14%)";
export const LABEL_COLOR = "hsl(212 13% 72%)";
export const LABEL_ACTIVE_COLOR = "hsl(30 20% 94%)";
export const UNPUBLISHED_OPACITY = 0.45;
export const FADED_OPACITY = 0.18;
export const ENTRANCE_STEP_MS = 40;

export const GRAPH_LEGEND: ReadonlyArray<{ role: Exclude<PackRole, "root">; label: string }> = [
  { role: "required", label: "required" },
  { role: "optional", label: "optional" },
  { role: "suggested", label: "suggested" },
];
