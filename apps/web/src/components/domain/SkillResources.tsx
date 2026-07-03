import { Menu, KeyRound } from "lucide-react";
import type { ConnectionRef, McpTool } from "@/data/types";

function TabEmpty({ message }: { message: string }) {
  return (
    <div className="animate-fadeUp rounded-[11px] border border-dashed border-[hsl(215_15%_18%)] px-5 py-12 text-center text-[13.5px] text-[hsl(212_10%_52%)]">
      {message}
    </div>
  );
}

export function McpList({ mcps }: { mcps: McpTool[] }) {
  if (mcps.length === 0) {
    return <TabEmpty message="No MCP tools exposed by this skill." />;
  }
  return (
    <div className="flex animate-fadeUp flex-col gap-[10px]">
      {mcps.map((m) => (
        <div
          key={m.name}
          className="flex items-center gap-3 rounded-[10px] border border-border bg-[hsl(215_21%_10.5%)] px-4 py-[14px]"
        >
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[hsl(270_70%_60%/.14)] text-[hsl(270_80%_74%)]">
            <Menu className="h-[17px] w-[17px]" />
          </span>
          <div className="flex-1">
            <div className="font-mono text-[13.5px] font-semibold text-[hsl(208_32%_86%)]">
              {m.name}
            </div>
            <div className="mt-0.5 text-[12.5px] text-[hsl(212_11%_58%)]">{m.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConnectionList({ conns }: { conns: ConnectionRef[] }) {
  if (conns.length === 0) {
    return <TabEmpty message="No external connections required." />;
  }
  return (
    <div className="flex animate-fadeUp flex-col gap-[10px]">
      {conns.map((c) => (
        <div
          key={c.name}
          className="flex items-center gap-3 rounded-[10px] border border-border bg-[hsl(215_21%_10.5%)] px-4 py-[14px]"
        >
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[hsl(168_60%_45%/.14)] text-[hsl(168_65%_58%)]">
            <KeyRound className="h-[17px] w-[17px]" />
          </span>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-[hsl(208_32%_86%)]">{c.name}</div>
            <div className="mt-0.5 text-[12.5px] text-[hsl(212_11%_58%)]">{c.desc}</div>
          </div>
          <span className="rounded-md bg-[hsl(142_55%_45%/.12)] px-2 py-[3px] text-[11px] font-semibold text-[hsl(142_55%_55%)]">
            OAuth
          </span>
        </div>
      ))}
    </div>
  );
}
