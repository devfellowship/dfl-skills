import type { Pack, Skill } from "@/types";
import { isValidSlug, isValidSource } from "@/lib/identifiers";

/** No `author:` line, or `author: devfellowship`, means core owns it. */
export const CORE_HANDLE = "devfellowship";

export const CORE_TEAM_LABEL = "DevFellowship core team";

function normalize(handle: string): string {
  return handle.trim().toLowerCase();
}

export function isCoreHandle(handle: string | null | undefined): boolean {
  const trimmed = handle?.trim();
  return !trimmed || normalize(trimmed) === CORE_HANDLE;
}

/** What the profile page (and the maintainer note) calls the caller. */
export function maintainerLabel(handle: string): string {
  return isCoreHandle(handle) ? CORE_TEAM_LABEL : handle;
}

export function maintainerHref(handle: string): string {
  return `/u/${encodeURIComponent(handle)}`;
}

/**
 * The GitHub handle a code-owner review is asked from — the `author:`
 * frontmatter field itself, never `skillAuthor()`'s display fallback (which
 * substitutes a curator's handle for an unattributed DFL skill). `null` means
 * core: no author, or an author literally named `devfellowship`.
 */
export function skillOwner(skill: Pick<Skill, "author">): string | null {
  const author = skill.author?.trim();
  return isCoreHandle(author) ? null : (author as string);
}

/**
 * A pack's owner is its root skill's raw `author:` — the rule the generated
 * CODEOWNERS applies — else core. The detail endpoint carries it on the root
 * member; the list endpoint does not, so it is resolved from the catalogue.
 * Never `packAuthors()`: its display fallback names a curator for an
 * unattributed root, and the gate asks core.
 */
export function packOwner(pack: Pack, skills: Skill[] = []): string | null {
  const root = pack.members.find((m) => m.slug === pack.root);
  const author =
    root?.author ?? skills.find((s) => s.slug === pack.root && s.source === pack.source)?.author;
  return isCoreHandle(author) ? null : (author as string).trim();
}

function ownedBy(owner: string | null, handle: string): boolean {
  if (isCoreHandle(handle)) return owner === null;
  return owner !== null && normalize(owner) === normalize(handle);
}

/** Case-insensitive: every skill this handle (or core) owns. */
export function skillsByMaintainer(skills: Skill[], handle: string): Skill[] {
  return skills.filter((s) => ownedBy(skillOwner(s), handle));
}

/** Case-insensitive: every pack this handle (or core) owns. */
export function packsByMaintainer(packs: Pack[], skills: Skill[], handle: string): Pack[] {
  return packs.filter((p) => ownedBy(packOwner(p, skills), handle));
}

/** The line under the maintainer note: who has to approve a change. */
export function maintainerApprovalLine(handle: string, kind: "skill" | "pack"): string {
  if (isCoreHandle(handle)) return "Changes need approval from the DFL core team.";
  return `Changes to this ${kind} need @${handle}'s approval.`;
}

/** Where to open a PR against the skill's own directory. */
export function skillProposeUrl(source: string, slug: string): string | null {
  if (!isValidSource(source) || !isValidSlug(slug)) return null;
  return `https://github.com/${source}/tree/main/skills/${slug}`;
}

/** Where to open a PR against the pack's manifest. */
export function packProposeUrl(source: string, slug: string): string | null {
  if (!isValidSource(source) || !isValidSlug(slug)) return null;
  return `https://github.com/${source}/blob/main/packs/${slug}.yaml`;
}
