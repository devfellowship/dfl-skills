import type { Visibility } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@devfellowship/components";
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
    <Select
      value={visibility}
      onValueChange={(next) => void change(next as Visibility)}
      disabled={saving}
    >
      <SelectTrigger className="h-8 min-w-[112px]" aria-label="Change visibility">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RETIERABLE.map((nextVisibility) => (
          <SelectItem key={nextVisibility} value={nextVisibility}>
            {VISIBILITY_LABEL[nextVisibility]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
