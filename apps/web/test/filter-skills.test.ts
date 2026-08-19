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

test("core narrows to the curated set — the answer to 'which ones do I hand over?'", () => {
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
