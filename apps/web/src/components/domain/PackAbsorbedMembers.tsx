import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@devfellowship/components";
import type { Skill } from "@/types";
import { skillHref } from "@/lib/format";

interface PackAbsorbedMembersProps {
  absorbed: Skill[];
  memberCount: number;
}

/**
 * The members a pack card absorbed for the current query (plan ADR-7). They
 * left the top level for this query, so they stay reachable from here.
 */
export function PackAbsorbedMembers({ absorbed, memberCount }: PackAbsorbedMembersProps) {
  const [open, setOpen] = useState(false);
  if (absorbed.length === 0) return null;

  return (
    <div
      data-testid="pack-absorbed"
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg border border-[hsl(33_90%_55%/.18)] bg-[hsl(33_90%_55%/.05)]"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full justify-between text-[12px] font-medium text-[hsl(33_82%_70%)]"
        data-testid="pack-absorbed-toggle"
      >
        <span>
          {absorbed.length} of {memberCount} members also match — {open ? "hide" : "show"} them
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <ul className="m-0 flex list-none flex-col gap-[2px] px-3 pb-2 pt-1">
          {absorbed.map((s) => (
            <li key={s.id} data-testid="pack-absorbed-member" data-slug={s.slug} className="min-w-0">
              <Link
                to={skillHref(s)}
                className="block truncate py-[3px] text-[12px] text-[hsl(212_12%_64%)] hover:text-[hsl(33_82%_66%)] focus-visible:underline"
              >
                <span className="font-mono font-semibold text-foreground">{s.slug}</span>
                {s.description && <span> — {s.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
