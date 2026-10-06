import assert from "node:assert/strict";
import { test } from "node:test";
import { createPluginClient, pluginDetail, pluginHref, pluginNodeHref, pluginNodeSourceHref } from "../src/lib/plugins";
import { compositionGroups, incomingPluginEdges, layoutPluginGraph } from "../src/lib/plugin-graph";
import { ApiError } from "../src/lib/api-error";
import { pluginFixture } from "./plugin-fixture";

test("typed graph keeps one shared node with pack and direct edges, roles on each edge", () => {
  const detail = pluginDetail(pluginFixture()), graph = layoutPluginGraph(detail);
  assert.equal(graph.nodes.length, 7);
  assert.equal(graph.edges.length, 9);
  const shared = graph.nodes.find(n => n.slug === "brand-voice")!;
  assert.deepEqual(incomingPluginEdges(detail, shared.id).map(e => e.role), ["required", "optional", "direct"]);
  assert.equal(graph.nodes.filter(n => n.slug === "lesson-studio-content").length, 1);
  assert.deepEqual(compositionGroups(detail).map(g => g.members.length), [4, 2, 3]);
  assert.equal(detail.edges.at(-1)?.selected, false);
  assert.equal(detail.nodes.at(-2)?.status, "candidate");
});
test("full Unicode labels and long names remain in a growing canvas", () => {
  const fixture = pluginFixture();
  fixture.nodes[3]!.name = "Conteúdo 🎓 " + "very long reusable lesson workflow ".repeat(18);
  const graph = layoutPluginGraph(pluginDetail(fixture));
  const n = graph.nodes.find(n => n.slug === "lesson-studio-content")!;
  assert.equal(n.name, fixture.nodes[3]!.name);
  assert.ok(n.height > 600);
  for (const n of graph.nodes) {
    assert.ok(n.x >= 0 && n.x + n.width <= graph.width);
    assert.ok(n.y >= 0 && n.y + n.height <= graph.height);
  }
});
test("links keep source identity and the immutable release revision without pretending current catalogue contents are pinned", () => {
  const fixture = pluginFixture(), n = fixture.nodes[3]!;
  assert.equal(pluginHref(fixture.plugin.source, fixture.plugin.plugin), "/plugins/devfellowship/dfl-plugins/devfellowship-team");
  assert.equal(pluginNodeHref(n), `/s/${n.source}/${n.slug}?release_ref=${n.commit_sha}`);
  assert.equal(pluginNodeSourceHref(n), `https://github.com/${n.source}/tree/${n.commit_sha}/skills/${n.slug}`);
  assert.match(pluginNodeSourceHref(fixture.nodes[1]!), /\/packs\/native-lessons$/);
  assert.throws(() => pluginHref("devfellowship/../secret", "x"), ApiError);
});
test("conflicting identities, malformed roles, orphaned nodes and dishonest selection fail closed", () => {
  const mutations = [
    (f: ReturnType<typeof pluginFixture>) => f.nodes.push({ ...f.nodes[3]! }),
    (f: ReturnType<typeof pluginFixture>) => { f.nodes[3]!.commit_sha = "main"; },
    (f: ReturnType<typeof pluginFixture>) => { f.edges[0]!.role = "required"; },
    (f: ReturnType<typeof pluginFixture>) => { f.edges[0]!.from = "secret"; },
    (f: ReturnType<typeof pluginFixture>) => { f.nodes[5]!.selected = true; f.nodes[5]!.status = "selected_in_release"; },
    (f: ReturnType<typeof pluginFixture>) => { f.edges[8]!.selected = true; },
    (f: ReturnType<typeof pluginFixture>) => { f.plugin.composition_sha256 = "unknown"; },
  ];
  for (const change of mutations) { const f = pluginFixture(); change(f); assert.throws(() => pluginDetail(f), ApiError); }
});
test("registry client preserves caller bearer, query and abort signal only on registry reads", async () => {
  const requests: { url: string; init?: RequestInit }[] = [], fixture = pluginFixture();
  const transport = (async (url, init) => { requests.push({ url: String(url), init }); return Response.json(String(url).includes("?q=") ? { plugins: [fixture.plugin], schema_ready: true } : fixture); }) as typeof fetch;
  const client = createPluginClient("https://registry.example", transport), controller = new AbortController();
  assert.equal((await client.list("lesson & media", controller.signal, "fixture-token")).length, 1);
  await client.detail(fixture.plugin.source, fixture.plugin.plugin, controller.signal, null);
  assert.equal(requests[0]!.url, "https://registry.example/api/v1/plugins?q=lesson%20%26%20media");
  assert.equal(new Headers(requests[0]!.init?.headers).get("authorization"), "Bearer fixture-token");
  assert.equal(requests[0]!.init?.signal, controller.signal);
  assert.equal(new Headers(requests[1]!.init?.headers).get("authorization"), null);
});
test("denied and missing share a generic 404; unavailable remains an error, never an empty success", async () => {
  for (const status of [404, 503, 502]) {
    const client = createPluginClient("https://registry.example", (async () => Response.json({ secret: "must not enter the error message" }, { status })) as typeof fetch);
    await assert.rejects(client.detail("devfellowship/dfl-plugins", "devfellowship-team"), error => error instanceof ApiError && error.status === status && !error.message.includes("secret"));
  }
  const malformed = createPluginClient("https://registry.example", (async () => Response.json({ plugins: [], schema_ready: false })) as typeof fetch);
  await assert.rejects(malformed.list(), ApiError);
});


test("an unselected optional edge can point to a skill selected through another parent", () => {
  const fixture = pluginFixture();
  fixture.edges[7]!.selected = false;
  const detail = pluginDetail(fixture);
  const voice = detail.nodes.find(n => n.slug === "brand-voice")!;
  assert.equal(voice.selected, true);
  assert.deepEqual(incomingPluginEdges(detail, voice.id).map(e => [e.role, e.selected]), [["required", true], ["optional", false], ["direct", true]]);
});
test("a response cannot substitute another plugin identity or an empty release", async () => {
  const fixture = pluginFixture();
  const client = createPluginClient("https://registry.example", (async () => Response.json(fixture)) as typeof fetch);
  await assert.rejects(client.detail("devfellowship/dfl-plugins", "other-plugin"), ApiError);
  fixture.nodes = fixture.nodes.filter(n => n.kind === "plugin");
  fixture.edges = [];
  assert.throws(() => pluginDetail(fixture), ApiError);
});


test("a narrow graph stacks all typed nodes within the readable viewport", () => {
  const fixture = pluginDetail(pluginFixture()), graph = layoutPluginGraph(fixture, 311);
  assert.equal(graph.vertical, true);
  assert.equal(graph.width, 311);
  assert.equal(graph.nodes.length, 7);
  assert.equal(graph.edges.length, 9);
  assert.deepEqual(graph.nodes.map(n => n.kind), ["plugin", "pack", "pack", "skill", "skill", "skill", "skill"]);
  for (const n of graph.nodes) assert.ok(n.x >= 0 && n.x + n.width <= 311);
  for (let i = 1; i < graph.nodes.length; i++) assert.ok(graph.nodes[i]!.y >= graph.nodes[i - 1]!.y + graph.nodes[i - 1]!.height);
});
