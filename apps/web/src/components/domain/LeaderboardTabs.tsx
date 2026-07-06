import type { LeaderboardTab } from "@/data/types";
import { Tabs, type TabItem } from "@/components/ui/Tabs";

const TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "official", label: "Official" },
];

interface LeaderboardTabsProps {
  active: LeaderboardTab;
  onChange: (tab: LeaderboardTab) => void;
}

export function LeaderboardTabs({ active, onChange }: LeaderboardTabsProps) {
  return (
    <Tabs
      items={TABS}
      active={active}
      onChange={(id) => onChange(id as LeaderboardTab)}
      className="mb-[22px]"
    />
  );
}
