import { cn } from "@/lib/cn";

export interface SelectOption {
  id: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  full?: boolean;
}

export function Select({ options, value, onChange, className, full }: SelectProps) {
  return (
    <div
      className={cn(
        "flex gap-[3px] rounded-lg border border-border bg-[hsl(215_18%_11%)] p-[3px]",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-md px-3 py-[6px] text-[12.5px] font-semibold transition-colors",
              full && "flex-1",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
