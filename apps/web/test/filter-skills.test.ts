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
    query: "",
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

test("search reaches the categories too, so a topic word finds the skill", () => {
  assert.deepEqual(run({ query: "DATABASE" }), ["db-simplicity"]);
});

test("facets are ordered by count so the busiest topic leads the chip row", () => {
  const facets = computeFacets(CATALOGUE);
  assert.deepEqual(facets.topics, ["devops", "security", "database", "frontend"]);
  assert.equal(facets.coreCount, 2);
  assert.deepEqual(facets.owners, ["devfellowship", "acme"]);
});

test("a skill with no frontmatter author falls back to the repo owner", () => {
  const facets = computeFacets([skill({ slug: "orphan", source: "devfellowship/skills" })]);
  assert.deepEqual(facets.authors, ["devfellowship"]);
});

// ---------------------------------------------------------------------------
// GROUPING (plan ADR-7, task T10). A query that matches a pack AND two or more
// of its members renders ONE pack card that absorbs those members, for that
// query only. Without it, "reels" renders the pack plus its members as a row
// of near-duplicate cards.
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
    { slug: "lesson-studio-content", role: "required", ordinal: 1, status: "in_catalogue" },
    { slug: "branded-render", role: "required", ordinal: 2, status: "in_catalogue" },
    { slug: "brand-voice", role: "optional", ordinal: 3, status: "in_catalogue" },
  ],
});

const REELS_CATALOGUE: Skill[] = [
  skill({ slug: "short-form-visual-director", description: "Make Reels and TikTok videos." }),
  skill({ slug: "lesson-studio-content", description: "Slides. Reels use the director." }),
  skill({ slug: "branded-render", description: "On-brand PNGs." }),
  skill({ slug: "brand-voice", description: "Brand voice before Reels or a post." }),
  // Matches "reels" but is NOT a member: it must stay a loose card.
  skill({ slug: "dfl-reel-engajado", description: "Reels de alto engajamento." }),
];

function catalogue(query: string, over: Partial<SkillFilters> = {}, packs: Pack[] = [REELS_PACK]) {
  return filterCatalogue({
    skills: REELS_CATALOGUE,
    packs,
    query,
    tab: "all",
    topics: [],
    kind: "all",
    author: null,
    coreOnly: false,
    ...over,
  });
}

test("reels renders ONE pack group that absorbs its matching members", () => {
  const r = catalogue("reels");
  assert.equal(r.groups.length, 1);
  assert.equal(r.groups[0]?.pack.slug, "short-form-visual");
  // Absorbed in MANIFEST order, not alphabetical: the pack is a reading order.
  assert.deepEqual(r.groups[0]?.absorbed.map((s) => s.slug), [
    "short-form-visual-director",
    "lesson-studio-content",
    "brand-voice",
  ]);
  // No top-level card for a slug the pack absorbed; the non-member stays.
  assert.deepEqual(r.skills.map((s) => s.slug), ["dfl-reel-engajado"]);
});

test("a pack that matches with only ONE member matching absorbs nothing", () => {
  // "branded-render" reaches the pack through its member slug, and matches one skill.
  const r = catalogue("branded-render");
  assert.equal(r.groups.length, 1);
  assert.deepEqual(r.groups[0]?.absorbed, []);
  assert.deepEqual(r.skills.map((s) => s.slug), ["branded-render"]);
});

test("a member that matches while its pack does not still renders its own card", () => {
  const r = catalogue("on-brand");
  assert.equal(r.groups.length, 0);
  assert.deepEqual(r.skills.map((s) => s.slug), ["branded-render"]);
});

test("with no query nothing is absorbed — grouping is for one query only", () => {
  const r = catalogue("");
  assert.deepEqual(r.groups.map((g) => g.absorbed.length), [0]);
  assert.equal(r.skills.length, REELS_CATALOGUE.length);
});

test("a filter that hides the pack leaves every member as its own card", () => {
  const r = catalogue("reels", { kind: "mcp" });
  assert.equal(r.groups.length, 0);
  assert.deepEqual(r.skills, []);
});

test("a member in two matching packs is absorbed once from the top level, and listed in both", () => {
  const twin = adaptPack({
    source: SRC,
    pack: "reels-lite",
    name: "Reels lite",
    description: "A smaller reels set.",
    members: [
      { slug: "short-form-visual-director", role: "root", ordinal: 0, status: "in_catalogue" },
      { slug: "brand-voice", role: "required", ordinal: 1, status: "in_catalogue" },
    ],
  });
  const r = catalogue("reels", {}, [REELS_PACK, twin]);
  assert.equal(r.groups.length, 2);
  assert.deepEqual(r.groups.find((g) => g.pack.slug === "reels-lite")?.absorbed.map((s) => s.slug), [
    "short-form-visual-director",
    "brand-voice",
  ]);
  assert.deepEqual(r.skills.map((s) => s.slug), ["dfl-reel-engajado"]);
});

test("a member from another source with the same slug is not absorbed", () => {
  const r = filterCatalogue({
    skills: [
      skill({ slug: "brand-voice", source: "acme/skills", description: "reels" }),
      skill({ slug: "lesson-studio-content", source: "acme/skills", description: "reels" }),
    ],
    packs: [REELS_PACK],
    query: "reels",
    tab: "all",
    topics: [],
    kind: "all",
    author: null,
    coreOnly: false,
  });
  assert.deepEqual(r.groups[0]?.absorbed, []);
  assert.equal(r.skills.length, 2);
});
