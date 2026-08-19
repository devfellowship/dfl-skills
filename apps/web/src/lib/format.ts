import { isValidSlug, isValidSource } from "./identifiers";

export function formatDate(value: string): string {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * 🚨 This string is copied straight into somebody's shell, so a registry row
 * carrying `;` or a backtick would run whatever follows on their machine. The
 * identifiers are validated here rather than trusted from the API — returns
 * null so the caller shows nothing instead of an unrunnable command.
 */
export function installCommand(source: string, slug: string): string | null {
  if (!isValidSource(source) || !isValidSlug(slug)) return null;
  return `npx skills add ${source}/${slug}`;
}

export function authorOf(source: string): string {
  return source.split("/")[0] || source;
}

export function githubAvatarUrl(handle: string): string {
  return `https://github.com/${encodeURIComponent(handle)}.png?size=48`;
}
