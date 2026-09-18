import assert from "node:assert/strict";
import { test } from "node:test";

import type { Pack } from "../src/types/index.ts";
import { adaptPack } from "../src/lib/packs.ts";
import { miniGraph, packByline, packContributors, roleShares, showcase } from "../src/lib/pack-home.ts";
import { SHOWCASE_LIST_LIMIT } from "../src/consts/pack-home.ts";

function pack(over: { pack: string; name?: string; updated_at?: string; members?: unknown[] }): Pack {
  return adaptPack({
    source: "devfellowship/internal-skills",
    name: over.pack,
    root: "root-skill",
    updated_at: "2026-09-01T00:00:00Z",
    members: [
      { slug: "root-skill", role: "root", ordinal: 0, status: "in_catalogue" },
      { slug: "req", role: "required", ordinal: 1, status: "in_catalogue" },
      { slug: "opt", role: "optional", ordinal: 2, status: "not_published" },
    ],
    ...over,
  });
}

test("showcase leads with the freshest pack and lists the next few by recency", () => {
  const packs = [
    pack({ pack: "old", updated_at: "2026-01-01T00:00:00Z" }),
    pack({ pack: "new", updated_at: "2026-09-18T00:00:00Z" }),
    pack({ pack: "mid", updated_at: "2026-05-01T00:00:00Z" }),
  ];
  const view = showcase(packs, null);
  assert.equal(view.featured?.slug, "new");
  assert.deepEqual(view.list.map((p) => p.slug), ["mid", "old"]);
  assert.equal(view.hidden, 0);
});

test("showcase puts the pack the reader picked in the spotlight and never lists it twice", () => {
  const packs = [pack({ pack: "a" }), pack({ pack: "b" }), pack({ pack: "c" })];
  const view = showcase(packs, "devfellowship/internal-skills/b");
  assert.equal(view.featured?.slug, "b");
  assert.deepEqual(view.list.map((p) => p.slug), ["a", "c"]);
});

test("showcase ignores an id it cannot see and counts what only /packs shows", () => {
  const packs = Array.from({ length: SHOWCASE_LIST_LIMIT + 3 }, (_, i) => pack({ pack: `p${i}` }));
  const view = showcase(packs, "devfellowship/internal-skills/gone");
  assert.equal(view.featured?.slug, "p0");
  assert.equal(view.list.length, SHOWCASE_LIST_LIMIT);
  assert.equal(view.hidden, 2);
});

test("showcase with one pack is the spotlight alone; with none, nothing", () => {
  const one = showcase([pack({ pack: "solo" })], null);
  assert.equal(one.featured?.slug, "solo");
  assert.deepEqual(one.list, []);
  assert.equal(one.hidden, 0);
  assert.deepEqual(showcase([], null), { featured: null, list: [], hidden: 0 });
});

test("miniGraph centres the root and scales the orbit with the size", () => {
  const p = pack({ pack: "g" });
  const small = miniGraph(p, 120);
  const big = miniGraph(p, 240);
  assert.equal(small.root?.x, 60);
  assert.equal(big.root?.x, 120);
  assert.equal(small.members.length, 2);
  assert.equal(small.members[0]?.y, 18);
  assert.equal(big.members[0]?.y, 36);
  assert.equal(small.members[1]?.published, false);
});

test("roleShares and packByline read the members, not the pack", () => {
  const p = pack({ pack: "r" });
  assert.deepEqual(
    roleShares(p).map((s) => [s.role, s.count]),
    [["root", 1], ["required", 1], ["optional", 1]],
  );
  const authors = packContributors(p, []);
  assert.equal(authors.author, "taigfs");
  assert.equal(packByline(p, authors), "3 skills · by taigfs");
});
