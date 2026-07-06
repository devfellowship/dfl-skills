const ALLOWED_SCHEMES = new Set(["http", "https", "mailto"]);

function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

export function safeHref(url: string | null | undefined): string {
  if (!url) return "";
  if (hasControlChar(url)) return "";
  const trimmed = url.trim();
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (!scheme) return trimmed;
  return ALLOWED_SCHEMES.has(scheme[1]!.toLowerCase()) ? trimmed : "";
}
