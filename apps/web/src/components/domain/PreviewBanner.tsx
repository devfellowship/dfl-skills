import { useState } from "react";
import { Info, X } from "lucide-react";

export function PreviewBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="mb-5 flex items-center gap-3 rounded-[11px] border border-[hsl(33_90%_55%/.22)] bg-[hsl(33_90%_55%/.08)] px-[14px] py-[10px]">
      <Info className="h-4 w-4 shrink-0 text-[hsl(33_85%_64%)]" strokeWidth={2} />
      <p className="m-0 flex-1 text-[13px] leading-[1.5] text-[hsl(212_12%_70%)]">
        Preview data — the registry is indexing. Real skills will appear here automatically once the
        index populates.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss preview notice"
        className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(212_10%_52%)] transition-colors hover:bg-[hsl(33_90%_55%/.12)] hover:text-foreground"
      >
        <X className="h-[15px] w-[15px]" />
      </button>
    </div>
  );
}
