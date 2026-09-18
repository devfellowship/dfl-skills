import assert from "node:assert/strict";
import { test } from "node:test";

import { adaptPack, memberAuthor, packAuthors, roleCounts } from "../src/lib/packs.ts";
import { edgePath, graphHeight, graphLabel, packGraph } from "../src/lib/pack-graph.ts";

const SOURCE = "devfellowship/internal-skills";
const member = (slug: string, role: string, ordinal: number, extra: Record<string, unknown> = {}) => ({
  slug,
  source: SOURCE,
  role,
  ordinal,
  status: "in_catalogue",
  author: "taigfs",
  ...extra,
});

const PACK = adaptPack({
  source: SOURCE,
  pack: "short-form-visual",
  name: "Short-form visual director",
  root: "short-form-visual-director",
  members: [
    member("short-form-visual-director", "root", 0),
    member("lesson-studio-content", "required", 1),
    member("brand-voice", "optional", 2),
    member("vision-llm-judge", "optional", 3, { author: null }),
    member("launch-campaign", "suggested", 4, { status: "not_published", author: undefined }),
  ],
});

test("the root sits in the centre with one edge to every other member", () => {
  const g = packGraph(PACK, 320, 280);
  const root = g.nodes[0];
  assert.equal(root.slug, "short-form-visual-director");
  assert.equal(root.role, "root");
  assert.deepEqual([root.x, root.y], [160, 140]);
  assert.deepEqual(
    g.edges.map((e) => [e.from, e.to, e.role]),
    [
      ["short-form-visual-director", "lesson-studio-content", "required"],
      ["short-form-visual-director", "brand-voice", "optional"],
      ["short-form-visual-director", "vision-llm-judge", "optional"],
      ["short-form-visual-director", "launch-campaign", "suggested"],
    ],
  );
});

test("every node stays inside the canvas", () => {
  const g = packGraph(PACK, 320, 280);
  for (const n of g.nodes) {
    assert.ok(n.x - n.r >= 0 && n.x + n.r <= g.width, `${n.slug} x=${n.x}`);
    assert.ok(n.y - n.r >= 0 && n.y + n.r + 11 <= g.height, `${n.slug} y=${n.y}`);
  }
});

test("members alternate sides down the canvas in manifest order, each on its own row", () => {
  const g = packGraph(PACK);
  const [root, ...rest] = g.nodes;
  assert.deepEqual(
    rest.map((n) => Math.sign(n.x - root.x)),
    [-1, 1, -1, 1],
  );
  for (let i = 1; i < rest.length; i++) {
    assert.ok(rest[i].y - rest[i - 1].y >= 13, `${rest[i].slug} shares a row with ${rest[i - 1].slug}`);
  }
});

test("nine long slugs keep every label on its own row and inside the canvas", () => {
  const slugs = Array.from({ length: 9 }, (_, i) => `short-form-visual-director-${i}`);
  const pack = adaptPack({
    source: SOURCE,
    pack: "wide",
    root: "root-skill",
    members: [member("root-skill", "root", 0), ...slugs.map((s, i) => member(s, "optional", i + 1))],
  });
  const g = packGraph(pack);
  assert.equal(g.height, graphHeight(9));
  for (const n of g.nodes) {
    assert.ok(n.x - 56 >= 0 && n.x + 56 <= g.width, `${n.slug} label clips at x=${n.x}`);
    assert.ok(n.y - n.r >= 0 && n.y + n.r + 14 <= g.height, `${n.slug} clips at y=${n.y}`);
  }
  const rows = g.nodes.slice(1).map((n) => n.y);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i] - rows[i - 1] >= 13);
});

test("the canvas grows with the member count between a floor and a ceiling", () => {
  assert.equal(graphHeight(1), 240);
  assert.equal(graphHeight(8), 320);
  assert.equal(graphHeight(20), 380);
});

test("an edge is a single quadratic curve from the root to the member", () => {
  const g = packGraph(PACK, 320, 280);
  const [root, first] = g.nodes;
  const d = edgePath(root, first);
  assert.match(d, /^M160 140 Q[\d.]+ [\d.]+ [\d.]+ [\d.]+$/);
  assert.ok(d.endsWith(`${first.x} ${first.y}`));
});

test("the node author matches the table: SKILL.md author, else the owner, none when unpublished", () => {
  const g = packGraph(PACK);
  const by = (slug: string) => g.nodes.find((n) => n.slug === slug)!;
  assert.equal(by("brand-voice").author, "taigfs");
  assert.equal(by("vision-llm-judge").author, "taigfs");
  assert.equal(by("launch-campaign").author, null);
  assert.equal(by("launch-campaign").published, false);
});

test("a pack with no members draws nothing", () => {
  const empty = adaptPack({ source: SOURCE, pack: "empty", members: [] });
  assert.deepEqual(packGraph(empty).nodes, []);
});

test("a long slug is cut with an ellipsis, a short one is left alone", () => {
  assert.equal(graphLabel("image-fetch"), "image-fetch");
  assert.equal(graphLabel("short-form-visual-director"), "short-form-visual…");
});

test("the pack author is its root's, contributors are distinct member authors in reading order", () => {
  const pack = adaptPack({
    source: SOURCE,
    pack: "p",
    root: "a",
    members: [
      member("a", "root", 0, { author: "taigfs" }),
      member("b", "required", 1, { author: "samuelstefano" }),
      member("c", "optional", 2, { author: "taigfs" }),
      member("d", "optional", 3, { author: null }),
      member("e", "suggested", 4, { status: "not_published", author: "ghost" }),
    ],
  });
  assert.deepEqual(packAuthors(pack), {
    author: "taigfs",
    contributors: ["taigfs", "samuelstefano"],
  });
  assert.equal(memberAuthor(pack.members[3]), "taigfs");
  assert.equal(memberAuthor(pack.members[4]), null);
  assert.deepEqual(roleCounts(pack), [
    { role: "root", count: 1 },
    { role: "required", count: 1 },
    { role: "optional", count: 2 },
    { role: "suggested", count: 1 },
  ]);
});
