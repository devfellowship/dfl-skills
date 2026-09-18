import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Layers } from "lucide-react";
import { Badge, Button, Card } from "@devfellowship/components";
import type { Pack, Skill } from "@/types";
import { formatDate, skillHref } from "@/lib/format";
import { packHref } from "@/lib/packs";
import { VisibilityBadge } from "./VisibilityBadge";

const SHOWN_MEMBERS = 4;

interface PackCardProps {
  pack: Pack;
  /**
   * Members that ALSO match the current query and that this card absorbed
   * (plan ADR-7). They left the top level for this query, so they must stay
   * reachable from here without leaving the page.
   */
  absorbed?: Skill[];
}

/**
 * A visual sibling of SkillCard, in the same grid. It links to the pack page
 * at `/p/` (plan ADR-6), never to a skill page.
 *
 * Members render as SLUGS, as text. An avatar row would carry nothing:
 * the avatar helper in format.ts builds it from the owner, so every DFL skill shows the
 * same picture.
 *
 * "Install all" opens the pack page instead of copying a command: the page
 * shows how many skills the pack installs, and which are not published yet,
 * before the install button. A bare install on the card would skip that.
 */
export function PackCard({ pack, absorbed = [] }: PackCardProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const href = packHref(pack);
  const shown = pack.members.slice(0, SHOWN_MEMBERS);
  const more = pack.memberCount - shown.length;

  return (
    <Card
      data-testid="pack-card"
      data-pack={pack.id}
      onClick={() => navigate(href)}
      className="group flex min-h-[178px] cursor-pointer animate-fadeUp flex-col gap-[11px] rounded-[13px] border border-[hsl(33_90%_55%/.28)] bg-card p-[18px] transition-all hover:-translate-y-[3px] hover:border-[hsl(33_90%_55%/.5)] hover:shadow-[0_10px_30px_hsl(216_40%_3%/.5)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-[6px]">
          <Badge variant="warning" shape="square">
            <Layers className="h-3 w-3" />
            PACK
          </Badge>
          {pack.visibility !== "public" && <VisibilityBadge visibility={pack.visibility} />}
        </div>
        <span className="text-[11px] text-[hsl(212_10%_52%)]">{formatDate(pack.updatedAt)}</span>
      </div>

      <div>
        <Link
          to={href}
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-[15.5px] font-semibold tracking-[-.01em] text-foreground outline-none hover:text-[hsl(33_82%_66%)] focus-visible:underline"
        >
          {pack.slug}
        </Link>
        <div className="mt-[5px] text-xs text-[hsl(212_12%_64%)]">
          <span data-testid="pack-member-count" className="font-semibold text-foreground">
            {pack.memberCount} {pack.memberCount === 1 ? "skill" : "skills"}
          </span>
          {pack.root && (
            <span className="text-[hsl(212_10%_42%)]">
              {" "}
              · root <span className="font-mono">{pack.root}</span>
            </span>
          )}
        </div>
      </div>

      <p className="clamp2 m-0 text-[13px] leading-[1.5] text-[hsl(212_12%_64%)]">
        {pack.description}
      </p>

      <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0" aria-label="Members">
        {shown.map((m) => (
          <li
            key={`${m.source}/${m.slug}`}
            className="rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] px-[8px] py-[2px] font-mono text-[11px] text-[hsl(212_12%_64%)]"
          >
            {m.slug}
          </li>
        ))}
        {more > 0 && (
          <li className="px-[2px] py-[2px] text-[11px] text-[hsl(212_10%_52%)]">+{more} more</li>
        )}
      </ul>

      {absorbed.length > 0 && (
        <div
          data-testid="pack-absorbed"
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_10%)]"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="w-full justify-between text-[12px] font-medium text-[hsl(208_28%_80%)]"
            data-testid="pack-absorbed-toggle"
          >
            <span>
              {absorbed.length} of {pack.memberCount} members also match — {open ? "hide" : "show"} them
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
      )}

      <div className="mt-auto flex items-center justify-between gap-2">
        {pack.unpublishedCount > 0 ? (
          <span
            data-testid="pack-unpublished"
            className="text-[12px] font-semibold text-[hsl(0_75%_70%)]"
          >
            {pack.unpublishedCount} not published
          </span>
        ) : (
          <span />
        )}
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(href);
          }}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          <Layers className="h-3 w-3" />
          Install all
        </Button>
      </div>
    </Card>
  );
}
