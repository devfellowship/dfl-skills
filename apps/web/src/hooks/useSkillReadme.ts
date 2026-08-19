import { useEffect, useRef, useState } from "react";
import { ApiError, fetchSkillContent } from "@/lib/api";
import { parseAuthor, resolveReadmeSource, stripFrontmatter } from "@/lib/readme";

const MAX_BYTES = 512 * 1024;

/**
 * Terminal outcomes of a SKILL.md resolution. Every non-`ok` value MUST reach
 * the user as a distinguishable UI state and the console as a log line — a
 * failed resolution rendered as an empty panel is indistinguishable from "this
 * skill genuinely has no README", which is the bug this hook previously had.
 *
 *  - `ok`         body loaded and rendered
 *  - `private`    source repo is private and nobody is signed in
 *  - `restricted` signed in and allowed to SEE the skill, but its body is not
 *                 distributable (the registry's `core` gate). Visible-but-not-
 *                 readable is a real, permanent state, not an error or a 404.
 *  - `missing`    resolved, but there is no SKILL.md at that path (real 404)
 *  - `error`      network/HTTP failure, or an unbuildable URL — worth retrying
 */
export type ReadmeStatus = "loading" | "ok" | "private" | "restricted" | "missing" | "error";

export interface ReadmeState {
  /** Body with the frontmatter stripped — what the page renders. */
  body: string | null;
  /**
   * The verbatim file, frontmatter included. The copy-prompt flow needs THIS:
   * `name` and `description` are what make an agent load a skill at the right
   * moment, so a copy that drops them produces a skill that never triggers.
   */
  raw: string | null;
  author: string | undefined;
  loading: boolean;
  status: ReadmeStatus;
  /** Human-readable diagnostic for the failing states. Rendered AND logged. */
  detail: string | null;
  /** The URL we attempted, when the resolution used one. Rendered AND logged. */
  attemptedUrl: string | null;
}

const IDLE: ReadmeState = {
  body: null,
  raw: null,
  author: undefined,
  loading: true,
  status: "loading",
  detail: null,
  attemptedUrl: null,
};

function loaded(text: string, attemptedUrl: string | null): ReadmeState {
  const raw = text.slice(0, MAX_BYTES);
  return {
    body: stripFrontmatter(raw),
    raw,
    author: parseAuthor(raw),
    loading: false,
    status: "ok",
    detail: null,
    attemptedUrl,
  };
}

function failed(status: Exclude<ReadmeStatus, "loading" | "ok">, detail: string, url: string | null): ReadmeState {
  return { ...IDLE, loading: false, status, detail, attemptedUrl: url };
}

export function useSkillReadme(
  source: string | undefined,
  slug: string | undefined,
  visibility?: string,
  authenticated = false,
): ReadmeState {
  const [state, setState] = useState<ReadmeState>(IDLE);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    const resolved = resolveReadmeSource(source, slug, visibility, authenticated);
    const ref = `${source ?? "?"}/${slug ?? "?"}`;

    if (resolved.kind === "private") {
      // Expected and handled, so `warn` rather than `error` — but never silent.
      console.warn(`[readme] ${ref}: SKILL.md not fetchable — ${resolved.reason}`);
      setState(failed("private", resolved.reason, null));
      return;
    }

    if (resolved.kind === "invalid") {
      console.error(`[readme] ${ref}: cannot build a SKILL.md URL — ${resolved.reason}`);
      setState(failed("error", resolved.reason, null));
      return;
    }

    const controller = new AbortController();
    setState(IDLE);

    const request =
      resolved.kind === "registry"
        ? fetchSkillContent(source as string, slug as string, controller.signal)
        : fetchRaw(resolved.url, controller.signal);

    request
      .then((text) => {
        if (active.current) setState(loaded(text, resolved.kind === "raw" ? resolved.url : null));
      })
      .catch((err: unknown) => {
        if (!active.current || controller.signal.aborted) return;
        const url = resolved.kind === "raw" ? resolved.url : null;
        const { status, detail } = classify(err, url);
        const log = status === "restricted" ? console.warn : console.error;
        log(`[readme] ${ref}: ${detail}`);
        setState(failed(status, detail, url));
      });

    return () => {
      active.current = false;
      controller.abort();
    };
  }, [source, slug, visibility, authenticated]);

  return state;
}

async function fetchRaw(url: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status);
  return res.text();
}

function classify(
  err: unknown,
  url: string | null,
): { status: Exclude<ReadmeStatus, "loading" | "ok">; detail: string } {
  const where = url ? ` at ${url}` : " from the registry";
  if (err instanceof ApiError) {
    if (err.status === 403) {
      return {
        status: "restricted",
        detail: "this skill is visible to you but its contents are not distributable",
      };
    }
    if (err.status === 404) return { status: "missing", detail: `no SKILL.md${where} (HTTP 404)` };
    return { status: "error", detail: `fetch${where} failed — HTTP ${err.status}` };
  }
  const reason = err instanceof Error ? err.message : String(err);
  return { status: "error", detail: `fetch${where} failed — ${reason}` };
}
