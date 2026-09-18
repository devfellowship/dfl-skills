import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import type { Pack } from "../src/types/index.ts";
import { adaptPack, catalogueCount, filterPacks, packHref } from "../src/lib/packs.ts";

// The live shape of one row of GET /api/v1/packs (signed in), trimmed to 5 members.
const RAW = {
  source: "devfellowship/internal-skills",
  pack: "short-form-visual",
  name: "Short-form visual director",
  description: "Plan, create and review Reels and TikTok scenes in Lesson Studio, end to end.",
  root: "short-form-visual-director",
  visibility: "internal",
  commit_sha: "d8f82eb7d85649d6817d1fc70186412f6b511dda",
  updated_at: "2026-09-18T13:43:13.462726+00:00",
  member_count: 9,
  unpublished_count: 1,
  members: [
    { slug: "short-form-visual-director", source: "devfellowship/internal-skills", role: "root", ordinal: 0, status: "in_catalogue" },
    { slug: "branded-render", source: "devfellowship/internal-skills", role: "required", ordinal: 2, status: "in_catalogue" },
    { slug: "lesson-studio-content", source: "devfellowship/internal-skills", role: "required", ordinal: 1, status: "in_catalogue" },
    { slug: "image-fetch", source: "devfellowship/internal-skills", role: "required", ordinal: 3, status: "not_published" },
    { slug: "brand-voice", source: "devfellowship/internal-skills", role: "optional", ordinal: 5, status: "in_catalogue" },
  ],
};

test("adaptPack keeps the pack apart from the skill shape and orders members by manifest", () => {
  const pack = adaptPack(RAW);
  assert.equal(pack.id, "devfellowship/internal-skills/short-form-visual");
  assert.equal(pack.slug, "short-form-visual");
  assert.equal(pack.root, "short-form-visual-director");
  assert.equal(pack.visibility, "internal");
  assert.equal(pack.memberCount, 9);
  assert.equal(pack.unpublishedCount, 1);
  assert.deepEqual(
    pack.members.map((m) => m.slug),
    ["short-form-visual-director", "lesson-studio-content", "branded-render", "image-fetch", "brand-voice"],
  );
  assert.equal(pack.members[3]?.status, "not_published");
  // A pack is never a Skill: it carries no `kind`, so no code path can coerce it into one.
  assert.equal("kind" in pack, false);
});

test("adaptPack derives the counts when the API omits them", () => {
  const { member_count: _m, unpublished_count: _u, ...bare } = RAW;
  const pack = adaptPack(bare);
  assert.equal(pack.memberCount, 5);
  assert.equal(pack.unpublishedCount, 1);
});

test("an unknown role or status does not pass through as a trusted value", () => {
  const pack = adaptPack({
    ...RAW,
    members: [{ slug: "x", role: "boss", ordinal: 0, status: "weird" }],
  });
  assert.equal(pack.members[0]?.role, "suggested");
  assert.equal(pack.members[0]?.status, "not_published");
  assert.equal(pack.members[0]?.source, RAW.source);
});

test("packHref points at the /p/ route, never /s/", () => {
  const pack = adaptPack(RAW);
  assert.equal(packHref(pack), "/p/devfellowship/internal-skills/short-form-visual");
  assert.equal(packHref({ source: "a b/c", slug: "d/e" }), "/p/a%20b/c/d%2Fe");
});

test("the counter reports skills and packs separately and never counts a pack as a skill", () => {
  assert.equal(catalogueCount({ skills: 104, packs: 1 }), "104 skills · 1 pack");
  assert.equal(catalogueCount({ skills: 104, packs: 2 }), "104 skills · 2 packs");
  assert.equal(catalogueCount({ skills: 1, packs: 0 }), "1 skill");
  assert.equal(catalogueCount({ skills: 104, packs: 0 }), "104 skills");
  assert.equal(
    catalogueCount({ skills: 104, packs: 1, shownSkills: 3, shownPacks: 1 }),
    "3 of 104 skills · 1 of 1 pack",
  );
  assert.equal(
    catalogueCount({ skills: 104, packs: 1, shownSkills: 104, shownPacks: 0 }),
    "104 of 104 skills · 0 of 1 pack",
  );
  assert.equal(catalogueCount({ skills: 104, packs: 0, shownSkills: 7, shownPacks: 0 }), "7 of 104 skills");
});

const BASE = { tab: "all", topics: [], kind: "all", author: null, coreOnly: false } as const;

function run(packs: Pack[], over: Partial<Parameters<typeof filterPacks>[0]> = {}): string[] {
  return filterPacks({ packs, ...BASE, ...over }).map((p) => p.slug);
}

test("filterPacks is the browse state only — no free-text match (ADR-4)", () => {
  const packs = [adaptPack(RAW)];
  assert.deepEqual(run(packs), ["short-form-visual"]);
  const withQuery = { query: "kubernetes" } as unknown as Partial<Parameters<typeof filterPacks>[0]>;
  assert.deepEqual(run(packs, withQuery), ["short-form-visual"]);
});

test("filterPacks hides packs under filters a pack cannot satisfy", () => {
  const packs = [adaptPack(RAW), adaptPack({ ...RAW, source: "acme/skills", pack: "acme-pack" })];
  assert.deepEqual(run(packs, { kind: "skill" }), ["acme-pack", "short-form-visual"]);
  assert.deepEqual(run(packs, { kind: "mcp" }), []);
  assert.deepEqual(run(packs, { topics: ["security"] }), []);
  assert.deepEqual(run(packs, { coreOnly: true }), []);
  assert.deepEqual(run(packs, { tab: "official" }), ["short-form-visual"]);
  assert.deepEqual(run(packs, { author: "acme" }), ["acme-pack"]);
});

test("the PackCard links to /p/, carries the testid, and shows member slugs as text", async () => {
  const src = await readFile(new URL("../src/components/domain/PackCard.tsx", import.meta.url), "utf8");
  assert.match(src, /data-testid="pack-card"/);
  assert.match(src, /packHref\(/);
  // The card itself routes to the PACK. The only skill links on it are the
  // members it absorbed for a query (ADR-7), and those go through skillHref().
  assert.doesNotMatch(src, /\/s\//);
  assert.match(src, /const href = packHref\(pack\)/);
  // format.ts builds the avatar from the OWNER, identical for every DFL skill.
  assert.doesNotMatch(src, /githubAvatarUrl/);
});

test("the home page and the Hero stop counting a pack as a skill", async () => {
  const home = await readFile(new URL("../src/pages/HomePage.tsx", import.meta.url), "utf8");
  const hero = await readFile(new URL("../src/components/domain/Hero.tsx", import.meta.url), "utf8");
  assert.match(home, /catalogueCount\(/);
  assert.doesNotMatch(home, /`\$\{skills\.length\} skills`/);
  assert.match(home, /<PackShowcase /);
  assert.match(home, /<PackSearchResults/);
  assert.doesNotMatch(home, /PacksBand/);
  assert.match(hero, /packs/);
});
