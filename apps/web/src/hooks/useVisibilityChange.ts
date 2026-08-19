import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Visibility } from "@/types";
import { updateSkillVisibility } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { useAuth } from "@/hooks/useAuth";

function messageFor(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return "Only DFL leaders can change visibility";
  }
  return err instanceof Error ? err.message : "Could not change visibility";
}

export function useVisibilityChange(
  source: string,
  slug: string,
  current: string,
  onChanged: (visibility: string) => void,
) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);

  const change = useCallback(
    async (visibility: Visibility) => {
      if (!token || visibility === current) return;
      setSaving(true);
      try {
        onChanged(await updateSkillVisibility(source, slug, visibility, token));
        toast.success("Visibility updated");
      } catch (err) {
        toast.error(messageFor(err));
      } finally {
        setSaving(false);
      }
    },
    [token, source, slug, current, onChanged],
  );

  return { change, saving, canTry: Boolean(token) };
}
