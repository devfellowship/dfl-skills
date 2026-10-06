import { ApiError } from "./api-error";
import { isValidSlug, isValidSource } from "./identifiers";

export interface Plugin {
  source: string;
  plugin: string;
  name: string;
  description: string;
  version: string;
  stage: string;
  visibility: string;
  commit_sha: string;
  manifest_sha256: string;
  composition_sha256: string;
  lock_sha256: string;
  clients: string[];
  updated_at: string;
}
export interface PluginNode {
  id: string;
  kind: "plugin" | "pack" | "skill";
  source: string;
  slug: string;
  name: string;
  commit_sha: string;
  selected: boolean;
  status: "selected_in_release" | "candidate";
  capability_state: "client_acceptance_pending";
}
export interface PluginEdge {
  from: string;
  to: string;
  role: "pack" | "direct" | "root" | "required" | "optional" | "suggested";
  selected: boolean;
  ordinal: number;
}
export interface PluginDetail {
  plugin: Plugin;
  nodes: PluginNode[];
  edges: PluginEdge[];
  scope: string;
  schema_ready: true;
}
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
function invalid(): never { throw new ApiError("Plugin release data is incomplete", 502); }
function record(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) invalid();
  return raw as Record<string, unknown>;
}
function text(value: unknown): string { if (typeof value !== "string") invalid(); return value; }
export function pluginMetadata(raw: unknown): Plugin {
  const p = record(raw);
  if (!isValidSource(text(p.source)) || !isValidSlug(text(p.plugin)) ||
      !SHA.test(text(p.commit_sha)) || ![p.manifest_sha256, p.composition_sha256, p.lock_sha256].every(h => HASH.test(text(h))) ||
      !Array.isArray(p.clients) || !p.clients.every(c => typeof c === "string")) invalid();
  return {
    source: text(p.source), plugin: text(p.plugin), name: text(p.name), description: text(p.description),
    version: text(p.version), stage: text(p.stage), visibility: text(p.visibility), commit_sha: text(p.commit_sha),
    manifest_sha256: text(p.manifest_sha256), composition_sha256: text(p.composition_sha256), lock_sha256: text(p.lock_sha256),
    clients: p.clients as string[], updated_at: text(p.updated_at),
  };
}
/** Reject a malformed projection, rather than silently inventing membership or collapsing conflicting pins. */
export function pluginDetail(raw: unknown): PluginDetail {
  const data = record(raw), plugin = pluginMetadata(data.plugin);
  if (data.schema_ready !== true || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) invalid();
  const nodes: PluginNode[] = data.nodes.map(value => {
    const n = record(value);
    if (!["plugin", "pack", "skill"].includes(text(n.kind)) || !isValidSource(text(n.source)) || !isValidSlug(text(n.slug)) ||
        n.id !== `${n.kind}:${n.source}:${n.slug}` || !text(n.name) || !SHA.test(text(n.commit_sha)) || typeof n.selected !== "boolean" ||
        n.status !== (n.selected ? "selected_in_release" : "candidate") || n.capability_state !== "client_acceptance_pending") invalid();
    return n as unknown as PluginNode;
  });
  const at = new Map(nodes.map(n => [n.id, n]));
  const roots = nodes.filter(n => n.kind === "plugin");
  const root = roots[0];
  if (at.size !== nodes.length || roots.length !== 1 || !root || root.source !== plugin.source || root.slug !== plugin.plugin ||
      root.commit_sha !== plugin.commit_sha || !root.selected) invalid();
  if (!data.edges.length) invalid();
  const seen = new Set<string>();
  const edges: PluginEdge[] = data.edges.map(value => {
    const e = record(value), a = at.get(text(e.from)), b = at.get(text(e.to));
    const key = `${e.from}\n${e.to}`;
    if (!a || !b || typeof e.selected !== "boolean" || !Number.isSafeInteger(e.ordinal) || (e.ordinal as number) < 0 || seen.has(key)) invalid();
    if (!(a.kind === "plugin" && b.kind === "pack" && e.role === "pack") &&
        !(a.kind === "plugin" && b.kind === "skill" && e.role === "direct") &&
        !(a.kind === "pack" && b.kind === "skill" && ["root", "required", "optional", "suggested"].includes(text(e.role)))) invalid();
    if (e.selected && (!a.selected || !b.selected)) invalid();
    if (["pack", "direct", "root", "required"].includes(text(e.role)) && !e.selected) invalid();
    seen.add(key);
    return e as unknown as PluginEdge;
  });
  if (nodes.some(n => n.kind !== "plugin" && !edges.some(e => e.to === n.id)) ||
      nodes.some(n => n.kind !== "plugin" && n.selected !== edges.some(e => e.to === n.id && e.selected))) invalid();
  return { plugin, nodes, edges, scope: text(data.scope), schema_ready: true };
}
export function pluginHref(source: string, slug: string): string {
  if (!isValidSource(source) || !isValidSlug(slug)) throw new ApiError("Invalid plugin identity", 404);
  return `/plugins/${source.split("/").map(encodeURIComponent).join("/")}/${encodeURIComponent(slug)}`;
}
/** Existing catalogue endpoints serve current details. The query records release context, not a pinned-content claim. */
export function pluginNodeHref(n: PluginNode): string {
  const route = n.kind === "plugin" ? pluginHref(n.source, n.slug) :
    `/${n.kind === "pack" ? "p" : "s"}/${n.source.split("/").map(encodeURIComponent).join("/")}/${encodeURIComponent(n.slug)}`;
  return `${route}?release_ref=${encodeURIComponent(n.commit_sha)}`;
}
export function pluginNodeSourceHref(n: PluginNode): string {
  const folder = n.kind === "plugin" ? "config/product.json" : n.kind === "pack" ? `packs/${n.slug}` : `skills/${n.slug}`;
  return `https://github.com/${n.source}/tree/${n.commit_sha}/${folder}`;
}
/** No bearer is sent to node/source links. It is attached only to this registry client. */
export function createPluginClient(base: string, transport: typeof fetch = fetch) {
  async function get(path: string, signal?: AbortSignal, token?: string | null): Promise<unknown> {
    const response = await transport(`${base}${path}`, { signal, headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    if (!response.ok) throw new ApiError("Could not read plugin catalogue", response.status);
    return response.json();
  }
  return {
    async list(query = "", signal?: AbortSignal, token?: string | null): Promise<Plugin[]> {
      const data = record(await get(`/api/v1/plugins${query ? `?q=${encodeURIComponent(query)}` : ""}`, signal, token));
      if (data.schema_ready !== true || !Array.isArray(data.plugins)) invalid();
      return data.plugins.map(pluginMetadata);
    },
    async detail(source: string, slug: string, signal?: AbortSignal, token?: string | null): Promise<PluginDetail> {
      const detail = pluginDetail(await get(`/api/v1${pluginHref(source, slug)}`, signal, token));
      if (detail.plugin.source !== source || detail.plugin.plugin !== slug) invalid();
      return detail;
    },
  };
}
