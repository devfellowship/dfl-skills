import assert from "node:assert/strict";
import { test } from "node:test";

import type { Skill, SkillFilters } from "../src/types/index.ts";
import { filterSkills } from "../src/lib/filter-skills.ts";
import { computeFacets } from "../src/lib/skill-facets.ts";

function skill(over: Partial<Skill> & { slug: string }): Skill {
  return {
    id: over.slug,
    name: over.slug,
    source: "devfellowship/internal-skills",
    kind: "skill",
    description: "",
    tags: [],
    categories: [],
    updatedAt: "2026-08-01T00:00:00Z",
    visibility: "internal",
    ...over,
  };
}

const CATALOGUE: Skill[] = [
  skill({ slug: "app-security", categories: ["security"], tags: ["core"], author: "samuel" }),
  skill({ slug: "db-simplicity", categories: ["database"], tags: ["core"], author: "tainan" }),
  skill({ slug: "web-design", categories: ["frontend"], author: "joao" }),
  skill({ slug: "deploy-runbook", categories: ["devops", "security"], author: "tainan" }),
  skill({ slug: "third-party", source: "acme/skills", categories: ["devops"], author: "acme" }),
];

function run(over: Partial<SkillFilters> = {}): string[] {
  return filterSkills({
    skills: CATALOGUE,
    tab: "all",
    topics: [],
    kind: "all",
    author: null,
    coreOnly: false,
    ...over,
  }).map((s) => s.slug);
}

test("no filters returns everything, sorted by name", () => {
  assert.deepEqual(run(), [
    "app-security",
    "db-simplicity",
    "deploy-runbook",
    "third-party",
    "web-design",
  ]);
});

test("a topic matches the derived categories, not the authored tags", () => {
  assert.deepEqual(run({ topics: ["security"] }), ["app-security", "deploy-runbook"]);
});

test("several topics are a union, so a team can widen its own view", () => {
  assert.deepEqual(run({ topics: ["frontend", "database"] }), ["db-simplicity", "web-design"]);
});

test("core narrows to the curated set — a highlight facet, not a permission", () => {
  assert.deepEqual(run({ coreOnly: true }), ["app-security", "db-simplicity"]);
});

test("author filters by the frontmatter author, not the repo owner", () => {
  assert.deepEqual(run({ author: "tainan" }), ["db-simplicity", "deploy-runbook"]);
});

test("the official tab drops sources outside the devfellowship org", () => {
  assert.equal(run({ tab: "official" }).includes("third-party"), false);
});

test("filters compose instead of replacing each other", () => {
  assert.deepEqual(run({ topics: ["security"], coreOnly: true }), ["app-security"]);
});

test("ADR-4: the browse filter takes no free-text query — search is a server call", () => {
  // A query key is not even part of the facet type any more; an extra one is ignored.
  const withQuery = { query: "DATABASE" } as unknown as Partial<SkillFilters>;
  assert.equal(run(withQuery).length, CATALOGUE.length);
});

test("facets are ordered by count so the busiest topic leads the chip row", () => {
  const facets = computeFacets(CATALOGUE);
  assert.deepEqual(facets.topics, ["devops", "security", "database", "frontend"]);
  assert.equal(facets.coreCount, 2);
  assert.deepEqual(facets.owners, ["devfellowship", "acme"]);
});

test("a skill with no frontmatter author falls back to the repository owner", () => {
  const facets = computeFacets([
    skill({ slug: "orphan", source: "devfellowship/skills" }),
    skill({ slug: "stray", source: "someone/skills" }),
  ]);
  assert.deepEqual(facets.authors.sort(), ["devfellowship", "someone"]);
});

// ---------------------------------------------------------------------------
// BROWSE STATE (no query). Grouping for a query moved to the server search
// (T11, test/search.test.ts). With no query, nothing is absorbed: members stay
// on the home list, because people look skills up by name (ADR-7).
// ---------------------------------------------------------------------------

import type { Pack } from "../src/types/index.ts";
import { adaptPack } from "../src/lib/packs.ts";
import { filterCatalogue } from "../src/lib/filter-skills.ts";

const SRC = "devfellowship/internal-skills";

const REELS_PACK: Pack = adaptPack({
  source: SRC,
  pack: "short-form-visual",
  name: "Short-form visual director",
  description: "Plan, create and review Reels and TikTok scenes.",
  visibility: "internal",
  members: [
    { slug: "short-form-visual-director", role: "root", ordinal: 0, status: "in_catalogue" },
    { slug: "brand-voice", role: "optional", ordinal: 1, status: "in_catalogue" },
  ],
});

const REELS_CATALOGUE: Skill[] = [
  skill({ slug: "short-form-visual-director" }),
  skill({ slug: "brand-voice" }),
  skill({ slug: "dfl-reel-engajado" }),
];

function catalogue(over: Partial<SkillFilters> = {}, packs: Pack[] = [REELS_PACK]) {
  return filterCatalogue({
    skills: REELS_CATALOGUE,
    packs,
    tab: "all",
    topics: [],
    kind: "all",
    author: null,
    coreOnly: false,
    ...over,
  });
}

test("with no query nothing is absorbed, and every member keeps its own card", () => {
  const r = catalogue();
  assert.deepEqual(r.groups.map((g) => g.absorbed.length), [0]);
  assert.equal(r.skills.length, REELS_CATALOGUE.length);
});

test("a facet a pack cannot satisfy hides the pack in the browse state", () => {
  const r = catalogue({ kind: "mcp" });
  assert.equal(r.groups.length, 0);
  assert.deepEqual(r.skills, []);
});
