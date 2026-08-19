const SOURCE_RE = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

/**
 * Registry identifiers are validated here, once, because every consumer feeds
 * them somewhere dangerous: a shell command the user pastes, a filename, or the
 * instruction text of a prompt aimed at an agent.
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function isValidSource(source: string): boolean {
  return SOURCE_RE.test(source) && !source.includes("..");
}
