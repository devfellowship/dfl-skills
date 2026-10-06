import type { PluginDetail, PluginNode } from "../src/lib/plugins";
export function pluginFixture(): PluginDetail {
  const source = "devfellowship/internal-skills", sha = "a".repeat(40);
  const node = (kind: PluginNode["kind"], slug: string, selected = true, origin = source): PluginNode => ({
    id: `${kind}:${origin}:${slug}`, kind, source: origin, slug,
    name: slug === "lesson-studio-content" ? "Lesson studio: produção de aulas 🎓 and reusable content" : slug,
    commit_sha: sha, selected, status: selected ? "selected_in_release" : "candidate", capability_state: "client_acceptance_pending",
  });
  const plugin = { source: "devfellowship/dfl-plugins", plugin: "devfellowship-team", name: "DevFellowship Team", description: "Learn, content and media", version: "0.2.0", stage: "preview", visibility: "internal", commit_sha: sha,
    manifest_sha256: "b".repeat(64), composition_sha256: "c".repeat(64), lock_sha256: "d".repeat(64), clients: ["codex", "chatgpt"], updated_at: "2026-10-06T20:00:00Z" };
  const nodes = [node("plugin", plugin.plugin, true, plugin.source), node("pack", "native-lessons"), node("pack", "native-content"), node("skill", "lesson-studio-content"), node("skill", "brand-voice"), node("skill", "future-marketing", false), node("skill", "campaigns-content-performance", true, "devfellowship/skills")];
  const [p, a, b, lesson, voice, candidate, analytics] = nodes as [PluginNode, PluginNode, PluginNode, PluginNode, PluginNode, PluginNode, PluginNode];
  const edges: PluginDetail["edges"] = [
    { from: p.id, to: a.id, role: "pack", selected: true, ordinal: 0 },
    { from: p.id, to: b.id, role: "pack", selected: true, ordinal: 1 },
    { from: p.id, to: voice.id, role: "direct", selected: true, ordinal: 2 },
    { from: p.id, to: analytics.id, role: "direct", selected: true, ordinal: 3 },
    { from: a.id, to: lesson.id, role: "root", selected: true, ordinal: 0 },
    { from: a.id, to: voice.id, role: "required", selected: true, ordinal: 1 },
    { from: b.id, to: lesson.id, role: "root", selected: true, ordinal: 0 },
    { from: b.id, to: voice.id, role: "optional", selected: true, ordinal: 1 },
    { from: b.id, to: candidate.id, role: "suggested", selected: false, ordinal: 2 },
  ];
  return { plugin, nodes, edges, scope: "internal", schema_ready: true };
}
