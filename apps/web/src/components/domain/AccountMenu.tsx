import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

interface AccountMenuProps {
  email: string;
  onSignOut: () => void;
}

export function AccountMenu({ email, onSignOut }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent): void => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-[9px] rounded-lg border border-[hsl(215_15%_19%)] py-[5px] pl-[5px] pr-[9px] text-[13px] font-medium text-foreground/85 transition-colors hover:border-[hsl(215_15%_28%)] hover:bg-[hsl(215_18%_13%)]"
      >
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-[hsl(33_90%_55%/.16)] text-[12px] font-bold uppercase text-primary">
          {email.slice(0, 1)}
        </span>
        <span className="max-w-[150px] truncate">{email}</span>
        <ChevronDown className="h-[14px] w-[14px] text-[hsl(212_10%_50%)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+7px)] w-[250px] overflow-hidden rounded-[11px] border border-[hsl(215_15%_18%)] bg-[hsl(215_22%_10%)] shadow-[0_16px_44px_-10px_hsl(216_40%_2%/.85)]">
          <div className="border-b border-[hsl(215_15%_16%)] px-[13px] py-[10px]">
            <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[hsl(212_10%_50%)]">
              Signed in as
            </div>
            <div className="mt-1 break-all text-[12.5px] leading-[1.45] text-foreground/85">
              {email}
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-2 px-[13px] py-[10px] text-left text-[13px] text-foreground/85 transition-colors hover:bg-[hsl(215_18%_14%)]"
          >
            <LogOut className="h-[14px] w-[14px]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
