import { toast } from "sonner";

/**
 * A silent copy failure is worse than no button: the user pastes stale
 * clipboard content into their agent and cannot tell why it was wrong. So a
 * rejected write (insecure context, permission denied) is surfaced.
 */
export function copyToClipboard(text: string | null, success: string): void {
  if (!text) return;
  const write = navigator.clipboard?.writeText(text);
  if (!write) {
    toast.error("Your browser blocked the clipboard");
    return;
  }
  void write.then(() => toast.success(success)).catch(() => toast.error("Couldn't copy"));
}
