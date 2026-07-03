import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-[38px] w-full rounded-lg border border-border bg-[hsl(215_18%_12%)] px-3 text-[13.5px] text-foreground outline-none placeholder:text-[hsl(212_9%_52%)] focus-visible:border-[hsl(215_15%_28%)]",
          className,
        )}
        {...rest}
      />
    );
  },
);

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  trailing?: React.ReactNode;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, trailing, ...rest }, ref) {
    return (
      <div
        className={cn(
          "flex h-[38px] items-center gap-2 rounded-lg border border-[hsl(215_15%_17%)] bg-[hsl(215_18%_12%)] px-3",
          className,
        )}
      >
        <Search className="h-[15px] w-[15px] shrink-0 text-[hsl(212_9%_52%)]" />
        <input
          ref={ref}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-[hsl(212_9%_52%)]"
          {...rest}
        />
        {trailing}
      </div>
    );
  },
);
