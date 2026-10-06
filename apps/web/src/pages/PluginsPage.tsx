import { Puzzle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Input } from "@devfellowship/components";
import { usePluginCatalogue } from "@/hooks/usePlugins";
import type { Plugin } from "@/lib/plugins";
import { pluginHref } from "@/lib/plugins";
import { PluginReadState } from "@/components/domain/PluginReadState";
import { EmptyState } from "@/components/ui/EmptyState";
export function PluginsPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  useEffect(() => { const timer = setTimeout(() => setSubmitted(query.trim()), 250); return () => clearTimeout(timer); }, [query]);
  const state = usePluginCatalogue(undefined, undefined, submitted);
  const plugins = state.data as Plugin[] | null;
  return <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-8 sm:px-6" data-testid="plugins-page">
    <h1 className="text-3xl font-semibold">Plugins</h1>
    <p className="mb-6 mt-3 text-muted-foreground">A plugin can include packs and direct skills. Explore the skills selected in each release.</p>
    <label htmlFor="plugin-search" className="mb-2 block text-sm font-medium">Search plugins</label>
    <Input id="plugin-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or description" className="mb-6 max-w-lg" />
    {state.loading ? <p role="status">Loading plugins…</p> : state.status ? <PluginReadState status={state.status} retry={state.refetch} /> : !plugins?.length ?
      <EmptyState icon={<Puzzle className="h-6 w-6" />} title="No plugins to show" description="No published plugin matches this search for your account. Sign in with DFL to see permitted internal plugins." /> :
      <div className="grid gap-5 md:grid-cols-2">{plugins.map(p => <Card key={`${p.source}:${p.plugin}`} className="p-6" data-testid="plugin-card">
        <Badge variant="outline">PLUGIN</Badge><h2 className="mt-3 break-words text-xl font-semibold"><Link className="hover:text-primary" to={pluginHref(p.source, p.plugin)}>{p.name}</Link></h2>
        <p className="mt-3 text-sm text-muted-foreground">{p.description}</p><p className="mt-4 text-sm">Version {p.version} · {p.stage}</p>
        <p className="mt-2 text-xs text-muted-foreground">Client acceptance pending · installation unknown</p>
        <Link className="mt-4 inline-block text-sm text-primary underline" to={pluginHref(p.source, p.plugin)}>Explore composition</Link>
      </Card>)}</div>}
  </main>;
}
