import { useMemo, useState } from "react";
import type { Pack, Skill } from "@/types";
import { showcase } from "@/lib/pack-home";
import { PackSpotlight } from "./PackSpotlight";
import { PackShowcaseList } from "./PackShowcaseList";
import { PackSpotlightSkeleton } from "./PackSpotlightSkeleton";

interface PackShowcaseProps {
  packs: Pack[];
  skills: Skill[];
  loading: boolean;
}

/**
 * The packs' advert in the hero. Every pack the caller can see is a
 * candidate, whatever the catalogue filters say — this is promotion, not a
 * result list. The search results (ADR-4/7) live in the catalogue section.
 * Empty and not loading = nothing, so an anonymous reader gets a plain hero.
 */
export function PackShowcase({ packs, skills, loading }: PackShowcaseProps) {
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const view = useMemo(() => showcase(packs, featuredId), [packs, featuredId]);

  if (loading && packs.length === 0) return <PackSpotlightSkeleton />;
  if (!view.featured) return null;

  return (
    <div data-testid="pack-showcase" className="animate-fadeUp">
      <PackSpotlight key={view.featured.id} pack={view.featured} skills={skills} total={packs.length} />
      <PackShowcaseList packs={view.list} hidden={view.hidden} onFeature={setFeaturedId} />
    </div>
  );
}
