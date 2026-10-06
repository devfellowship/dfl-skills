import { Link, useParams } from "react-router-dom";
import { Badge } from "@devfellowship/components";
import { usePluginCatalogue } from "@/hooks/usePlugins";
import type { PluginDetail } from "@/lib/plugins";
import { PluginCompositionGraph } from "@/components/domain/PluginCompositionGraph";
import { PluginReadState } from "@/components/domain/PluginReadState";
import { VisibilityBadge } from "@/components/domain/VisibilityBadge";
export function PluginDetailPage() {
  const { owner, repo, plugin } = useParams();
  const state = usePluginCatalogue(owner && repo ? `${owner}/${repo}` : undefined, plugin);
  const detail = state.data as PluginDetail | null;
  return <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6" data-testid="plugin-page">
    <Link to="/plugins" className="mb-5 inline-block text-sm text-primary">Back to plugins</Link>
    {state.loading ? <p role="status">Loading plugin…</p> : state.status || !detail ? <PluginReadState status={state.status ?? 502} retry={state.refetch} /> : <>
      <div className="flex flex-wrap items-center gap-3"><Badge variant="outline">PLUGIN</Badge><VisibilityBadge visibility={detail.plugin.visibility} /></div>
      <h1 className="mt-3 break-words text-3xl font-semibold" data-testid="plugin-title">{detail.plugin.name}</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">{detail.plugin.description}</p>
      <p className="mt-4 text-sm">Version {detail.plugin.version} · {detail.plugin.stage} · {detail.plugin.clients.join(", ") || "Clients not specified"}</p>
      <p className="mt-2 break-all font-mono text-xs text-muted-foreground">Release revision {detail.plugin.commit_sha}</p>
      <div className="mt-5 rounded-lg border border-border p-4 text-sm" role="note">
        <p>This page shows the published release selection. Installation on your client is unknown.</p>
        <p className="mt-1">Client acceptance remains pending. Each source link opens the release revision. Catalogue detail links show current details.</p>
      </div>
      <PluginCompositionGraph key={`${detail.plugin.composition_sha256}:${detail.plugin.commit_sha}`} detail={detail} />
    </>}
  </main>;
}
