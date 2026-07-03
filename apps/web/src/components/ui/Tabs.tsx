import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number | null;
  trailing?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-0.5 border-b border-[hsl(215_15%_15%)]",
        className,
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-[7px] px-4 py-[11px] text-[13.5px] font-semibold transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="rounded-full bg-[hsl(215_18%_16%)] px-[6px] py-px text-[11px] font-semibold text-muted-foreground">
                {tab.count}
              </span>
            )}
            {tab.trailing}
            {isActive && (
              <span className="absolute inset-x-[6px] -bottom-px h-0.5 rounded-sm bg-primary shadow-[0_0_10px_hsl(33_90%_55%/.6)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
