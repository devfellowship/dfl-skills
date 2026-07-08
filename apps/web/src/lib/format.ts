export function formatDate(value: string): string {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function installCommand(source: string, slug: string): string {
  return `npx skills add ${source}/${slug}`;
}

export function authorOf(source: string): string {
  return source.split("/")[0] || source;
}

export function authorAvatarUrl(source: string): string {
  return `https://github.com/${authorOf(source)}.png?size=48`;
}
