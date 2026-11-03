import assert from "node:assert/strict";
import { test } from "node:test";

import type { Pack, Skill } from "../src/types/index.ts";
import { adaptPack } from "../src/lib/packs.ts";
import {
  PACK_SORTS,
  packAuthorName,
  packAuthorOptions,
  packUpdatedAt,
  parsePackSort,
  viewPacks,
} from "../src/lib/pack-sort.ts";

const SOURCE = "devfellowship/internal-skills";

function skill(slug: string, over: Partial<Skill> = {}): Skill {
  return {
    id: slug,
    name: slug,
    slug,
    source: SOURCE,
    kind: "skill",
    description: "",
    tags: [],
    categories: [],
    updatedAt: "2026-01-01T00:00:00Z",
    visibility: "internal",
    author: "taigfs",
    ...over,
  };
}

function pack(name: string, updated: string, members: string[] = [`${name}-root`]): Pack {
  return adaptPack({
    source: SOURCE,
    pack: name,
    name,
    root: members[0],
    updated_at: updated,
    members: members.map((slug, i) => ({
      slug,
      source: SOURCE,
      role: i === 0 ? "root" : "required",
      ordinal: i,
      status: "in_catalogue",
    })),
  });
}

test("updated at is the latest of the pack row and every member skill", () => {
  const p = pack("alpha", "2026-03-01T00:00:00Z", ["a-root", "a-two"]);
  const skills = [
    skill("a-root", { updatedAt: "2026-02-01T00:00:00Z" }),
    skill("a-two", { updatedAt: "2026-05-10T12:00:00Z" }),
  ];
  assert.equal(packUpdatedAt(p, skills), "2026-05-10T12:00:00Z");
});

test("a newer pack row wins over older members", () => {
  const p = pack("alpha", "2026-09-01T00:00:00Z", ["a-root"]);
  assert.equal(packUpdatedAt(p, [skill("a-root", { updatedAt: "2026-02-01T00:00:00Z" })]), "2026-09-01T00:00:00Z");
});

test("a member of another registry is matched by source, not by slug alone", () => {
  const p = pack("alpha", "2026-03-01T00:00:00Z", ["a-root"]);
  const other = skill("a-root", { source: "someone/else", updatedAt: "2027-01-01T00:00:00Z" });
  assert.equal(packUpdatedAt(p, [other]), "2026-03-01T00:00:00Z");
});

test("the detail endpoint's own member date counts without the catalogue", () => {
  const p = adaptPack({
    source: SOURCE,
    pack: "alpha",
    root: "a-root",
    updated_at: "2026-03-01T00:00:00Z",
    members: [{ slug: "a-root", role: "root", ordinal: 0, status: "in_catalogue", updated_at: "2026-04-01T00:00:00Z" }],
  });
  assert.equal(packUpdatedAt(p), "2026-04-01T00:00:00Z");
});

test("dates compare as instants, not as strings", () => {
  const p = pack("alpha", "2026-03-01T01:00:00+02:00", ["a-root"]); // 2026-02-28T23:00Z
  const skills = [skill("a-root", { updatedAt: "2026-02-28T23:30:00Z" })];
  assert.equal(packUpdatedAt(p, skills), "2026-02-28T23:30:00Z");
});

test("an unparseable date is ignored; with none valid the answer is empty", () => {
  const p = pack("alpha", "not-a-date", ["a-root"]);
  assert.equal(packUpdatedAt(p, [skill("a-root", { updatedAt: "2026-06-06T00:00:00Z" })]), "2026-06-06T00:00:00Z");
  assert.equal(packUpdatedAt(p, [skill("a-root", { updatedAt: "" })]), "");
});

test("the author is the root skill's, else the owner default", () => {
  const p = pack("alpha", "2026-03-01T00:00:00Z", ["a-root", "a-two"]);
  const skills = [skill("a-root", { author: "SamuelStefano" }), skill("a-two", { author: "other" })];
  assert.equal(packAuthorName(p, skills), "SamuelStefano");
  assert.equal(packAuthorName(p, []), "taigfs");
});

function fixture() {
  const packs = [
    pack("bravo", "2026-02-01T00:00:00Z", ["b-root"]),
    pack("alpha", "2026-03-01T00:00:00Z", ["a-root"]),
    pack("charlie", "2026-01-01T00:00:00Z", ["c-root"]),
  ];
  const skills = [
    skill("a-root", { author: "zed" }),
    skill("b-root", { author: "Ann", updatedAt: "2026-08-01T00:00:00Z" }),
    skill("c-root", { author: "ann" }),
  ];
  return { packs, skills };
}

test("default sort is newest first, using member dates", () => {
  const { packs, skills } = fixture();
  assert.deepEqual(viewPacks(packs, skills, { sort: "updated", author: null }).map((p) => p.slug), ["bravo", "alpha", "charlie"]);
});

test("sort by name is A-Z", () => {
  const { packs, skills } = fixture();
  assert.deepEqual(viewPacks(packs, skills, { sort: "name", author: null }).map((p) => p.slug), ["alpha", "bravo", "charlie"]);
});

test("sort by author is A-Z, ignores case, and breaks ties newest first", () => {
  const { packs, skills } = fixture();
  // Ann (bravo, newer) and ann (charlie) tie, then zed (alpha).
  assert.deepEqual(viewPacks(packs, skills, { sort: "author", author: null }).map((p) => p.slug), ["bravo", "charlie", "alpha"]);
});

test("sorting by author puts a different pack first than the default", () => {
  const { packs, skills } = fixture();
  const byDate = viewPacks(packs, skills, { sort: "updated", author: null })[0];
  const alpha = [pack("zulu", "2030-01-01T00:00:00Z", ["z-root"]), ...packs];
  const withZulu = [...skills, skill("z-root", { author: "zzz" })];
  assert.equal(byDate.slug, "bravo");
  assert.equal(viewPacks(alpha, withZulu, { sort: "updated", author: null })[0].slug, "zulu");
  assert.equal(viewPacks(alpha, withZulu, { sort: "author", author: null })[0].slug, "bravo");
});

test("the author filter keeps only that author's packs, in the chosen order", () => {
  const { packs, skills } = fixture();
  assert.deepEqual(viewPacks(packs, skills, { sort: "name", author: "ann" }).map((p) => p.slug), ["charlie"]);
  assert.deepEqual(packAuthorOptions(packs, skills), ["Ann", "ann", "zed"]);
});

test("viewPacks does not mutate its input, and a pack with no date sorts last", () => {
  const { packs, skills } = fixture();
  const before = packs.map((p) => p.slug);
  const nodate = pack("nodate", "", ["n-root"]);
  const out = viewPacks([nodate, ...packs], [...skills, skill("n-root", { updatedAt: "" })], { sort: "updated", author: null });
  assert.equal(out.at(-1)?.slug, "nodate");
  assert.deepEqual(packs.map((p) => p.slug), before);
});

test("an unknown sort in the URL falls back to the default", () => {
  assert.equal(parsePackSort("bogus"), "updated");
  assert.equal(parsePackSort(null), "updated");
  for (const s of PACK_SORTS) assert.equal(parsePackSort(s), s);
});
