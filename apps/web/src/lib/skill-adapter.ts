import type { Kind, Skill } from "@/types";

/**
 * One skill row as the registry API serves it. Kept apart from api.ts so the
 * pure search helpers (lib/search.ts) can adapt rows without importing the
 * fetch layer, which reads `import.meta.env`.
 */
export interface ApiSkill {
  name?: string;
  source?: string;
  skill?: string;
  slug?: string;
  kind?: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  visibility?: string;
  updated_at?: string;
  author?: string;
  readme?: string;
}

const KINDS: ReadonlySet<string> = new Set<Kind>(["skill", "mcp", "connection"]);

function toKind(raw: string | undefined): Kind {
  const value = (raw ?? "").toLowerCase();
  return KINDS.has(value) ? (value as Kind) : "skill";
}

export function adaptSkill(raw: ApiSkill): Skill {
  const slug = raw.skill ?? raw.slug ?? raw.name ?? "unknown";
  const source = raw.source ?? "devfellowship/skills";
  return {
    id: `${source}/${slug}`,
    name: raw.name ?? slug,
    slug,
    source,
    kind: toKind(raw.kind),
    description: raw.description ?? "",
    tags: raw.tags ?? [],
    categories: raw.categories ?? [],
    updatedAt: raw.updated_at ?? "",
    visibility: raw.visibility ?? "public",
    author: raw.author,
    readme: raw.readme,
  };
}
