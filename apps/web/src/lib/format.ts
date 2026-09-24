import { isValidSlug, isValidSource } from "./identifiers";

export function formatDate(value: string): string {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/**
 * `23 Sep, 2026` — day without a leading zero, short month, comma, year. The
 * month names are fixed here on purpose: `toLocaleDateString("en-GB")` gives no
 * comma, and newer ICU spells September "Sept". A missing or unparseable value
 * is a dash, never the render time. `utc` is for tests; the page uses the
 * reader's own calendar day, like `formatDate`.
 */
export function formatDayMonthYear(value: string | null | undefined, opts: { utc?: boolean } = {}): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = opts.utc ? date.getUTCDate() : date.getDate();
  const month = opts.utc ? date.getUTCMonth() : date.getMonth();
  const year = opts.utc ? date.getUTCFullYear() : date.getFullYear();
  return `${day} ${SHORT_MONTHS[month]}, ${year}`;
}

/**
 * 🚨 This string is copied straight into somebody's shell, so a registry row
 * carrying `;` or a backtick would run whatever follows on their machine. The
 * identifiers are validated here rather than trusted from the API — returns
 * null so the caller shows nothing instead of an unrunnable command.
 */
export function installCommand(source: string, slug: string): string | null {
  if (!isValidSource(source) || !isValidSlug(slug)) return null;
  return `npx skills add ${source} --skill ${slug}`;
}

export function authorOf(source: string): string {
  return source.split("/")[0] || source;
}

/**
 * The author to show: the one the skill names, else the repository owner. It
 * is the same person the generated CODEOWNERS asks for approval, so a byline
 * and the Maintainer panel never disagree: an unattributed DFL skill is the
 * core team's, and it reads "devfellowship".
 */
export function skillAuthor(author: string | null | undefined, source: string): string {
  const named = author?.trim();
  return named || authorOf(source);
}

export function githubAvatarUrl(handle: string): string {
  return `https://github.com/${encodeURIComponent(handle)}.png?size=48`;
}

/** The SPA route of a skill. A pack never uses it — packs live at /p/ (see packHref). */
export function skillHref({ source, slug }: { source: string; slug: string }): string {
  return `/s/${source}/${slug}`;
}
