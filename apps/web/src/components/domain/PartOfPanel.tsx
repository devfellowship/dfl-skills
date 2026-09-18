import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { Card } from "@devfellowship/components";
import type { PackRef } from "@/types";
import { isValidSlug, isValidSource } from "@/lib/identifiers";
import { packHref, partOfForDisplay } from "@/lib/packs";
import { usePacks } from "@/hooks/usePacks";

/**
 * "Part of": the packs that list this skill, derived at ingestion. At most
 * three, as links — one line, not an index. The single-skill install stays
 * the primary action; the pack is offered second, because a reader who opened
 * a member asked for the member.
 */
export function PartOfPanel({ packs }: { packs: PackRef[] | undefined }) {
  // `part_of` carries no member count; the pack list does. A failed list read
  // only drops the count, never the link.
  const { packs: visible } = usePacks();
  const countOf = (ref: PackRef): number | undefined =>
    visible.find((p) => p.source === ref.source && p.slug === ref.slug)?.memberCount;
  // A malformed ref is dropped rather than turned into a crafted path.
  const shown = partOfForDisplay(packs ?? [])
    .filter((p) => isValidSource(p.source) && isValidSlug(p.slug))
    .map((p) => ({ ...p, href: packHref(p) }));
  if (shown.length === 0) return null;

  return (
    <Card className="p-[18px]" data-testid="part-of-panel">
      <h2 className="mb-[9px] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">
        <Layers className="h-[13px] w-[13px]" />
        Part of
      </h2>
      <ul className="m-0 flex list-none flex-col gap-[6px] p-0">
        {shown.map((p) => (
          <li key={p.href} data-testid="part-of-pack" className="text-[13px] leading-[1.5] text-[hsl(212_11%_58%)]">
            <Link
              to={p.href}
              className="font-semibold text-[hsl(33_82%_62%)] hover:underline focus-visible:underline"
            >
              {p.name}
            </Link>{" "}
            <span className="font-mono text-[11.5px] text-[hsl(212_9%_46%)]">{p.slug}</span>
            {countOf(p) !== undefined && <span> ({countOf(p)} skills)</span>}
            <span> — install the pack instead.</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
