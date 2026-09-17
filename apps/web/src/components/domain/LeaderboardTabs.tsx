import type { LeaderboardTab } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@devfellowship/components";

const TABS = [
  { id: "all", label: "All" },
  { id: "official", label: "Official" },
] as const;

interface LeaderboardTabsProps {
  active: LeaderboardTab;
  onChange: (tab: LeaderboardTab) => void;
}

export function LeaderboardTabs({ active, onChange }: LeaderboardTabsProps) {
  return (
    <Tabs value={active} onValueChange={(id) => onChange(id as LeaderboardTab)} className="mb-[22px]">
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
