import { AlertTriangle, Puzzle } from "lucide-react";
import { Button } from "@devfellowship/components";
import { EmptyState } from "@/components/ui/EmptyState";
export function PluginReadState({ status, retry }: { status: number; retry: () => void }) {
  const missing = status === 404;
  return <EmptyState icon={missing ? <Puzzle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
    title={missing ? "Plugin not found" : "Plugin catalogue is unavailable"}
    description={missing ? "This plugin is not available to you. Check the link or sign in with DFL." : "The plugin catalogue cannot load now. Try again shortly."}
    action={!missing ? <Button onClick={retry}>Retry</Button> : undefined} />;
}
