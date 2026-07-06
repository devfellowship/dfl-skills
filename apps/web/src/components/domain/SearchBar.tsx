import { SearchInput } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchBar({ value, onChange, className }: SearchBarProps) {
  return (
    <SearchInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search skills, MCPs, connections…"
      className={cn("max-w-[440px] flex-1", className)}
    />
  );
}
