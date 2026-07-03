import type { AuditVerdict, Kind } from "@/data/types";

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

export interface AuditMeta {
  label: string;
  title: string;
  fg: string;
  chipBg: string;
  panelBg: string;
  panelBorder: string;
  note: string;
  tick: string;
}

export function auditMeta(verdict: AuditVerdict): AuditMeta {
  if (verdict === "trust") {
    return {
      label: "Trusted",
      title: "Trusted",
      fg: "hsl(142 58% 60%)",
      chipBg: "hsl(142 55% 45% / .15)",
      panelBg: "hsl(142 55% 45% / .07)",
      panelBorder: "hsl(142 55% 45% / .22)",
      note: "verified by audit bot",
      tick: "M9 12l2 2 4-4",
    };
  }
  if (verdict === "caution") {
    return {
      label: "Caution",
      title: "Use with caution",
      fg: "hsl(45 90% 62%)",
      chipBg: "hsl(45 90% 50% / .15)",
      panelBg: "hsl(45 90% 50% / .07)",
      panelBorder: "hsl(45 90% 50% / .22)",
      note: "review before installing",
      tick: "M12 8v4M12 16h.01",
    };
  }
  return {
    label: "Warning",
    title: "Flagged",
    fg: "hsl(0 82% 68%)",
    chipBg: "hsl(0 70% 50% / .15)",
    panelBg: "hsl(0 70% 50% / .07)",
    panelBorder: "hsl(0 70% 50% / .22)",
    note: "broad permissions detected",
    tick: "M12 8v4M12 16h.01",
  };
}
