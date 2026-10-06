import { useSearchParams } from "react-router-dom";
/** Current catalogue reads must not impersonate immutable release contents. */
export function ReleaseContextNotice() {
  const [params] = useSearchParams();
  const revision = params.get("release_ref");
  if (!revision || !/^[a-f0-9]{40}$/.test(revision)) return null;
  return <div className="mb-5 rounded-lg border border-border p-4 text-sm" role="note" data-testid="release-context">
    <p>You opened these current catalogue details from a plugin release.</p>
    <p className="mt-1 break-all">The release uses revision <code>{revision}</code>. These details can differ. Use the plugin’s pinned source link to inspect that revision.</p>
  </div>;
}
