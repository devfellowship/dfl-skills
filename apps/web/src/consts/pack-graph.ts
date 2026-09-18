import type { PackRole } from "@/types";

export const EDGE_DASH: Record<PackRole, string | undefined> = {
  root: undefined,
  required: undefined,
  optional: "4 3",
  suggested: "1.5 3",
};

export const RING_COLOR: Record<PackRole, string> = {
  root: "hsl(33 92% 58%)",
  required: "hsl(205 80% 62%)",
  optional: "hsl(212 12% 60%)",
  suggested: "hsl(212 10% 42%)",
};
