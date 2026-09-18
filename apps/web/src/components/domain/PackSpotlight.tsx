import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { Badge, Button } from "@devfellowship/components";
import type { Pack, Skill } from "@/types";
import { SHOWCASE_GRAPH_SIZE } from "@/consts/pack-home";
import { packHref } from "@/lib/packs";
import { packByline, packContributors } from "@/lib/pack-home";
import { VisibilityBadge } from "./VisibilityBadge";
import { PackMiniGraph } from "./PackMiniGraph";
import { PackRoleBar } from "./PackRoleBar";
import { PackAuthorStack } from "./PackAuthorStack";

interface PackSpotlightProps {
  pack: Pack;
  /** The catalogue, to resolve member authors (the list endpoint carries none). */
  skills: Skill[];
  /** Every pack the caller can see, for the "All packs" link. */
  total: number;
}

/**
 * The featured pack as an advert in the hero: its graph in the middle, its
 * name and pitch, its authors, one call to action. It goes to the pack page
 * at `/p/` (plan ADR-6) — the page states what installs before any command.
 */
export function PackSpotlight({ pack, skills, total }: PackSpotlightProps) {
  const navigate = useNavigate();
  const href = packHref(pack);
  const authors = useMemo(() => packContributors(pack, skills), [pack, skills]);

  return (
    <article
      data-testid="pack-spotlight"
      data-pack={pack.id}
      onClick={() => navigate(href)}
      className="group relative cursor-pointer overflow-hidden rounded-[18px] border border-[hsl(33_90%_55%/.28)] bg-[linear-gradient(160deg,hsl(33_60%_14%/.55),hsl(215_22%_9%)_38%,hsl(215_24%_7%))] p-5 shadow-[0_24px_60px_hsl(216_40%_3%/.6)] transition-all hover:-translate-y-[2px] hover:border-[hsl(33_90%_55%/.55)] hover:shadow-[0_28px_70px_hsl(216_40%_3%/.7),0_0_0_1px_hsl(33_90%_55%/.14)] sm:p-6"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(33_92%_58%/.8)] to-transparent" />
      <span className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[hsl(33_92%_58%/.12)] blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[hsl(205_80%_62%/.07)] blur-3xl" />

      <div className="relative flex items-center gap-[6px]">
        <Badge variant="warning" shape="square">
          <Layers className="h-3 w-3" />
          Featured pack
        </Badge>
        {pack.visibility !== "public" && <VisibilityBadge visibility={pack.visibility} />}
        <Link
          to="/packs"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto inline-flex items-center gap-[5px] text-[12px] font-semibold text-[hsl(33_82%_66%)] transition-colors hover:text-[hsl(33_90%_74%)]"
        >
          All packs{total > 1 && <span className="text-[hsl(212_10%_52%)]"> · {total}</span>}
          <ArrowRight className="h-[13px] w-[13px]" />
        </Link>
      </div>

      <div className="relative mx-auto my-3 flex justify-center">
        <div className="rounded-full bg-[radial-gradient(circle,hsl(33_92%_58%/.14),transparent_70%)] p-2">
          <PackMiniGraph pack={pack} size={SHOWCASE_GRAPH_SIZE} className="drop-shadow-[0_0_14px_hsl(33_92%_58%/.25)]" />
        </div>
      </div>

      <div className="relative">
        <Link
          to={href}
          onClick={(e) => e.stopPropagation()}
          className="block font-heading text-[26px] font-bold uppercase leading-[1.02] tracking-[.005em] text-foreground outline-none transition-colors hover:text-[hsl(33_82%_66%)] focus-visible:underline sm:text-[30px]"
        >
          {pack.name}
        </Link>
        <p className="clamp2 m-0 mt-2 text-[13.5px] leading-[1.55] text-[hsl(212_12%_68%)]">{pack.description}</p>
        <div className="mt-4 flex items-center gap-[10px]">
          <PackAuthorStack authors={authors} size={24} />
          <span data-testid="pack-member-count" className="text-[12.5px] text-[hsl(212_12%_64%)]">
            {packByline(pack, authors)}
          </span>
        </div>
        <div className="mt-3">
          <PackRoleBar pack={pack} />
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-[hsl(33_90%_55%/.14)] pt-4">
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
    </article>
  );
}
