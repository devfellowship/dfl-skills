import { cn } from "@/lib/cn";

interface CoreToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  count: number;
}

export function CoreToggle({ value, onChange, count }: CoreToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      className={cn(
        "h-[34px] rounded-full border px-3 text-[12.5px] font-medium transition-colors",
        value
          ? "border-[hsl(33_90%_55%/.4)] bg-[hsl(33_90%_55%/.14)] font-semibold text-[hsl(33_85%_66%)]"
          : "border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] text-[hsl(212_12%_66%)] hover:border-[hsl(215_15%_28%)]",
      )}
    >
      Core ({count})
    </button>
  );
}
