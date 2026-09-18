import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import type { CatalogueFacets } from "../src/types/index.ts";
import {
  SEARCH_MIN_CHARS,
  groupSearchResults,
  isSearchable,
  searchApiPath,
  splitSearchRows,
} from "../src/lib/search.ts";

// ---------------------------------------------------------------------------
// T11 (plan ADR-4): the catalogue search is a SERVER query. The server
// (`GET /api/v1/skills/search`, dfl-services #204) returns pack rows with
// `kind: "pack"` FIRST, each with `matched_members` and `members`. The site
// never substring-filters on the client any more.
// ---------------------------------------------------------------------------

const SRC = "devfellowship/internal-skills";

/** The exact shape prod returned for q=reels on 2026-09-18 (trimmed). */
const REELS_ROWS: unknown[] = [
  {
    kind: "pack",
    source: SRC,
    pack: "short-form-visual",
    name: "short-form-visual",
    description: "Plan, create and review Reels and TikTok scenes.",
    root: "short-form-visual-director",
    visibility: "internal",
    commit_sha: "abc",
    updated_at: "2026-09-17T00:00:00Z",
    member_count: 4,
    unpublished_count: 0,
    matched_members: ["short-form-visual-director", "lesson-studio-content", "brand-voice"],
    members: [
      { slug: "short-form-visual-director", source: SRC, role: "root", ordinal: 0, status: "in_catalogue" },
      { slug: "lesson-studio-content", source: SRC, role: "required", ordinal: 1, status: "in_catalogue" },
      { slug: "branded-render", source: SRC, role: "required", ordinal: 2, status: "in_catalogue" },
      { slug: "brand-voice", source: SRC, role: "optional", ordinal: 3, status: "in_catalogue" },
    ],
  },
  // Server ranking order, NOT alphabetical.
  { kind: "skill", source: SRC, skill: "dfl-reel-engajado", name: "dfl-reel-engajado", description: "Reels", categories: ["content"], tags: [] },
  { kind: "skill", source: SRC, skill: "lesson-studio-content", name: "lesson-studio-content", description: "Slides", categories: ["content"], tags: ["core"] },
  { kind: "skill", source: SRC, skill: "short-form-visual-director", name: "short-form-visual-director", description: "Reels", categories: ["content"], tags: [] },
  { kind: "skill", source: SRC, skill: "brand-voice", name: "brand-voice", description: "Voice", categories: ["writing"], tags: [], author: "tainan" },
  { kind: "skill", source: SRC, skill: "zernio-publish", name: "zernio-publish", description: "Publish", categories: ["social"], tags: [] },
];

const NO_FACETS: CatalogueFacets = {
  tab: "all",
  topics: [],
  kind: "all",
  author: null,
  coreOnly: false,
};

test("a kind:pack row becomes a Pack, NEVER a skill", () => {
  const r = splitSearchRows(REELS_ROWS);
  assert.deepEqual(r.packs.map((p) => p.pack.slug), ["short-form-visual"]);
  // adaptSkill would have coerced it to a skill named "short-form-visual".
  assert.equal(r.skills.some((s) => s.slug === "short-form-visual"), false);
  assert.equal(r.skills.length, 5);
  assert.deepEqual(r.packs[0]?.matched, [
    "short-form-visual-director",
    "lesson-studio-content",
    "brand-voice",
  ]);
  // Members keep manifest order and their status from the server row.
  assert.deepEqual(r.packs[0]?.pack.members.map((m) => m.slug), [
    "short-form-visual-director",
    "lesson-studio-content",
    "branded-render",
    "brand-voice",
  ]);
});

test("the server order is kept — the client does not re-sort by name", () => {
  const r = splitSearchRows(REELS_ROWS);
  assert.deepEqual(r.skills.map((s) => s.slug), [
    "dfl-reel-engajado",
    "lesson-studio-content",
    "short-form-visual-director",
    "brand-voice",
    "zernio-publish",
  ]);
});

test("garbage rows are dropped, not rendered as 'unknown' cards", () => {
  const r = splitSearchRows([null, 3, "x", { kind: "pack" }, ...REELS_ROWS]);
  assert.equal(r.packs.length, 1);
  assert.equal(r.skills.length, 5);
});

test("matched_members drives the grouped card: 3 of 4 absorbed, in manifest order", () => {
  const g = groupSearchResults(splitSearchRows(REELS_ROWS), NO_FACETS);
  assert.equal(g.groups.length, 1);
  assert.deepEqual(g.groups[0]?.absorbed.map((s) => s.slug), [
    "short-form-visual-director",
    "lesson-studio-content",
    "brand-voice",
  ]);
  // The absorbed members leave the top level; the non-members stay, in server order.
  assert.deepEqual(g.skills.map((s) => s.slug), ["dfl-reel-engajado", "zernio-publish"]);
});

test("the grouping reads matched_members, not a client substring match", () => {
  // The server says only ONE member matched: below ABSORB_MIN, nothing is absorbed,
  // even though three member rows are in the list.
  const rows = structuredClone(REELS_ROWS) as Array<Record<string, unknown>>;
  rows[0]!.matched_members = ["brand-voice"];
  const g = groupSearchResults(splitSearchRows(rows), NO_FACETS);
  assert.equal(g.groups.length, 1);
  assert.deepEqual(g.groups[0]?.absorbed, []);
  assert.equal(g.skills.length, 5);
});

test("a matched member from another source with the same slug is not absorbed", () => {
  const rows = structuredClone(REELS_ROWS) as Array<Record<string, unknown>>;
  for (const r of rows.slice(1)) r.source = "acme/skills";
  const g = groupSearchResults(splitSearchRows(rows), NO_FACETS);
  assert.deepEqual(g.groups[0]?.absorbed, []);
  assert.equal(g.skills.length, 5);
});

test("the tag, author and core facets still apply to the server results", () => {
  const core = groupSearchResults(splitSearchRows(REELS_ROWS), { ...NO_FACETS, coreOnly: true });
  // A pack has no core tag, so it drops; the one core member is a loose card again.
  assert.equal(core.groups.length, 0);
  assert.deepEqual(core.skills.map((s) => s.slug), ["lesson-studio-content"]);

  const topic = groupSearchResults(splitSearchRows(REELS_ROWS), { ...NO_FACETS, topics: ["social"] });
  assert.deepEqual(topic.skills.map((s) => s.slug), ["zernio-publish"]);

  const author = groupSearchResults(splitSearchRows(REELS_ROWS), { ...NO_FACETS, author: "tainan" });
  assert.deepEqual(author.skills.map((s) => s.slug), ["brand-voice"]);

  const mcp = groupSearchResults(splitSearchRows(REELS_ROWS), { ...NO_FACETS, kind: "mcp" });
  assert.equal(mcp.groups.length + mcp.skills.length, 0);
});

test("a facet that removes absorbed members recounts them against ABSORB_MIN", () => {
  // Official tab keeps everything here; a topic that keeps only ONE member cannot
  // keep the pack (packs have no topics), so that member renders loose.
  const g = groupSearchResults(splitSearchRows(REELS_ROWS), { ...NO_FACETS, topics: ["writing"] });
  assert.equal(g.groups.length, 0);
  assert.deepEqual(g.skills.map((s) => s.slug), ["brand-voice"]);
});

test("the query is searchable only from the server's minimum length", () => {
  assert.equal(SEARCH_MIN_CHARS, 3);
  assert.equal(isSearchable(""), false);
  assert.equal(isSearchable("  re "), false);
  assert.equal(isSearchable("ree"), true);
});

test("the search path hits the v1 endpoint (packs included), never the CLI alias", () => {
  assert.equal(searchApiPath("reels & tik"), "/api/v1/skills/search?q=reels+%26+tik");
  assert.doesNotMatch(searchApiPath("x y z"), /^\/api\/search/);
});

test("ADR-4: the client substring filter is gone from the catalogue code", async () => {
  const filter = await readFile(new URL("../src/lib/filter-skills.ts", import.meta.url), "utf8");
  const packs = await readFile(new URL("../src/lib/packs.ts", import.meta.url), "utf8");
  for (const src of [filter, packs]) {
    assert.doesNotMatch(src, /haystack/);
    assert.doesNotMatch(src, /\.includes\(q\)/);
  }
  const home = await readFile(new URL("../src/pages/HomePage.tsx", import.meta.url), "utf8");
  assert.match(home, /useCatalogueSearch\(/);
});
