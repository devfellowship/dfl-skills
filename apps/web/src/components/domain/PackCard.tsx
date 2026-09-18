import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { Badge, Button, Card } from "@devfellowship/components";
import type { Pack, Skill } from "@/types";
import { CARD_MEMBER_CHIPS } from "@/consts/pack-home";
import { formatDate } from "@/lib/format";
import { packHref } from "@/lib/packs";
import { packByline, packContributors } from "@/lib/pack-home";
import { VisibilityBadge } from "./VisibilityBadge";
import { PackMiniGraph } from "./PackMiniGraph";
import { PackRoleBar } from "./PackRoleBar";
import { PackAuthorStack } from "./PackAuthorStack";
import { PackAbsorbedMembers } from "./PackAbsorbedMembers";

interface PackCardProps {
  pack: Pack;
  /** The catalogue, to resolve member authors (the list endpoint carries none). */
  skills: Skill[];
  /** Members that also matched the current query and moved into this card (ADR-7). */
  absorbed?: Skill[];
}

/**
 * The pack as a featured card: a glyph of its graph, its role mix and its
 * authors. It links to the pack page at `/p/` (plan ADR-6), never to a skill.
 * "Open pack" goes to the page rather than copying a command: the page states
 * how many skills install, and which are not published, before the button.
 */
export function PackCard({ pack, skills, absorbed = [] }: PackCardProps) {
  const navigate = useNavigate();
  const href = packHref(pack);
  const authors = useMemo(() => packContributors(pack, skills), [pack, skills]);
  const shown = pack.members.slice(0, CARD_MEMBER_CHIPS);
  const more = pack.memberCount - shown.length;

  return (
    <Card
      data-testid="pack-card"
      data-pack={pack.id}
      onClick={() => navigate(href)}
      className="group relative flex cursor-pointer animate-fadeUp flex-col gap-4 overflow-hidden rounded-[16px] border border-[hsl(33_90%_55%/.26)] bg-card p-5 transition-all hover:-translate-y-[3px] hover:border-[hsl(33_90%_55%/.55)] hover:shadow-[0_16px_40px_hsl(216_40%_3%/.55),0_0_0_1px_hsl(33_90%_55%/.12)] sm:p-6"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(33_92%_58%/.7)] to-transparent" />
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[hsl(33_92%_58%/.07)] blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-[6px]">
            <Badge variant="warning" shape="square">
              <Layers className="h-3 w-3" />
              PACK
            </Badge>
            {pack.visibility !== "public" && <VisibilityBadge visibility={pack.visibility} />}
            <span className="ml-auto text-[11px] text-[hsl(212_10%_52%)] sm:ml-0">{formatDate(pack.updatedAt)}</span>
          </div>
          <Link
            to={href}
            onClick={(e) => e.stopPropagation()}
            className="block font-heading text-[24px] font-bold uppercase leading-[1.02] tracking-[.005em] text-foreground outline-none transition-colors hover:text-[hsl(33_82%_66%)] focus-visible:underline sm:text-[28px]"
          >
            {pack.name}
          </Link>
          <div className="mt-[6px] flex flex-wrap items-center gap-x-[8px] gap-y-1 text-[12.5px] text-[hsl(212_12%_64%)]">
            <span className="truncate font-mono text-[hsl(33_80%_60%)]">{pack.id}</span>
          </div>
          <p className="clamp2 m-0 mt-3 max-w-[560px] text-[13.5px] leading-[1.55] text-[hsl(212_12%_66%)]">
            {pack.description}
          </p>
        </div>
        <div className="hidden shrink-0 rounded-[14px] border border-[hsl(215_15%_16%)] bg-[hsl(215_21%_9%/.7)] p-2 sm:block">
          <PackMiniGraph pack={pack} size={132} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-[10px]">
            <PackAuthorStack authors={authors} />
            <span data-testid="pack-member-count" className="text-[12.5px] text-[hsl(212_12%_64%)]">
              {packByline(pack, authors)}
            </span>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0" aria-label="Members">
            {shown.map((m) => (
              <li
                key={`${m.source}/${m.slug}`}
                className={`rounded-full border px-[8px] py-[2px] font-mono text-[11px] ${
                  m.slug === pack.root
                    ? "border-[hsl(33_90%_55%/.4)] bg-[hsl(33_90%_55%/.12)] text-[hsl(33_85%_68%)]"
                    : "border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] text-[hsl(212_12%_64%)]"
                }`}
              >
                {m.slug}
              </li>
            ))}
            {more > 0 && <li className="px-[2px] py-[2px] text-[11px] text-[hsl(212_10%_52%)]">+{more} more</li>}
          </ul>
        </div>
        <PackRoleBar pack={pack} />
      </div>

      <PackAbsorbedMembers absorbed={absorbed} memberCount={pack.memberCount} />

      <div className="flex items-center justify-between gap-2 border-t border-[hsl(215_15%_16%)] pt-4">
        {pack.unpublishedCount > 0 ? (
          <span data-testid="pack-unpublished" className="text-[12px] font-semibold text-[hsl(0_75%_70%)]">
            {pack.unpublishedCount} not published
          </span>
        ) : (
          <span className="text-[12px] text-[hsl(212_10%_52%)]">Installs as one set</span>
        )}
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(href);
          }}
          size="sm"
          className="shrink-0"
        >
          Open pack
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px]" />
        </Button>
      </div>
    </Card>
  );
}
