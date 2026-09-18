import assert from "node:assert/strict";
import { test } from "node:test";

import { adaptPack } from "../src/lib/packs.ts";
import { graphLabel, packGraph } from "../src/lib/pack-graph.ts";

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

test("neighbouring members alternate between an outer and an inner ring", () => {
  const g = packGraph(PACK);
  const [root, ...rest] = g.nodes;
  const dist = rest.map((n) => Math.hypot((n.x - root.x) / (g.width / 2), (n.y - root.y) / (g.height / 2)));
  assert.ok(dist[0] > dist[1] && dist[2] > dist[1] && dist[2] > dist[3]);
});

test("the author travels to the node, and a missing one is null, not the owner", () => {
  const g = packGraph(PACK);
  const by = (slug: string) => g.nodes.find((n) => n.slug === slug)!;
  assert.equal(by("brand-voice").author, "taigfs");
  assert.equal(by("vision-llm-judge").author, null);
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
