import type { Visibility } from "@/types";
import { RETIERABLE, VISIBILITY_LABEL } from "@/consts/visibility-tone";
import { useVisibilityChange } from "@/hooks/useVisibilityChange";
import { VisibilityBadge } from "./VisibilityBadge";

interface VisibilitySelectProps {
  source: string;
  slug: string;
  visibility: string;
  onChanged: (visibility: string) => void;
}

export function VisibilitySelect({ source, slug, visibility, onChanged }: VisibilitySelectProps) {
  const { change, saving, canTry } = useVisibilityChange(source, slug, visibility, onChanged);

  if (!canTry || visibility === "public") return <VisibilityBadge visibility={visibility} />;

  return (
    <select
      aria-label="Change visibility"
      disabled={saving}
      value={visibility}
      onChange={(e) => void change(e.target.value as Visibility)}
      className="rounded-md border border-border bg-[hsl(215_18%_11%)] px-2 py-[3px] text-[11.5px] font-semibold uppercase tracking-[.04em] text-[hsl(212_13%_68%)] transition-colors hover:border-[hsl(215_15%_28%)] focus:border-primary focus:outline-none disabled:opacity-50"
    >
      {RETIERABLE.map((v) => (
        <option key={v} value={v}>
          {VISIBILITY_LABEL[v]}
        </option>
      ))}
    </select>
  );
}
