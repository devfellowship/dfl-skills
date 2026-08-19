import { toast } from "sonner";
import { isValidSlug } from "./identifiers";

/**
 * The filename is built from a registry-supplied slug, so it is validated the
 * same way the prompt validates it. A slug carrying `/` or `..` would let the
 * download escape the browser's download folder on some platforms.
 */
export function skillFileName(slug: string): string | null {
  return isValidSlug(slug) ? `${slug}-SKILL.md` : null;
}

export function downloadSkillFile(slug: string, markdown: string | null): void {
  const name = skillFileName(slug);
  if (!markdown || !name) {
    toast.error("Couldn't prepare the download");
    return;
  }

  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${name}`);
}
