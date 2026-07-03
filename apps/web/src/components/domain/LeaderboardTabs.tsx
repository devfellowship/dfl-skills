import type { LeaderboardTab } from "@/data/types";
import { Tabs, type TabItem } from "@/components/ui/Tabs";

const TABS: TabItem[] = [
  { id: "trending", label: "Trending" },
  { id: "hot", label: "Hot" },
  { id: "official", label: "Official" },
  { id: "all", label: "All" },
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
