import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground font-bold hover:bg-[hsl(33_92%_60%)] border border-transparent",
  secondary:
    "bg-secondary text-foreground/90 font-semibold border border-[hsl(215_15%_20%)] hover:border-[hsl(215_15%_28%)] hover:bg-[hsl(215_18%_13%)]",
  ghost:
    "bg-transparent text-muted-foreground font-semibold border border-transparent hover:text-foreground",
  danger:
    "bg-[hsl(0_70%_50%/.14)] text-[hsl(0_80%_68%)] font-semibold border border-[hsl(0_70%_50%/.3)] hover:bg-[hsl(0_70%_50%/.2)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-[38px] px-4 text-[13.5px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});
