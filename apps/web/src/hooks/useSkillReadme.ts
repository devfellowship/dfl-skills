import { useEffect, useState } from "react";
import { parseAuthor, resolveReadmeSource, stripFrontmatter } from "@/lib/readme";

const MAX_BYTES = 512 * 1024;

/**
 * Terminal outcomes of a README resolution. Every non-`ok` value MUST reach the
 * user as a distinguishable UI state and the console as a log line — a failed
 * resolution rendered as an empty panel is indistinguishable from "this skill
 * genuinely has no README", which is the bug this hook previously had (the old
 * `.catch()` swallowed every error with no logging, and the `notFound` flag it
 * returned was never consumed by any caller).
 *
 *  - `ok`      body loaded and rendered
 *  - `private` source repo is private; an anonymous raw fetch can never resolve
 *  - `missing` fetch resolved but there is no SKILL.md at that path (real 404)
 *  - `error`   network/HTTP failure, or an unbuildable URL — worth retrying
 */
export type ReadmeStatus = "loading" | "ok" | "private" | "missing" | "error";

export interface ReadmeState {
  body: string | null;
  author: string | undefined;
  loading: boolean;
  status: ReadmeStatus;
  /** Human-readable diagnostic for the failing states. Rendered AND logged. */
  detail: string | null;
  /** The raw URL we attempted, when there was one. Rendered AND logged. */
  attemptedUrl: string | null;
}

export function useSkillReadme(
  source: string | undefined,
  slug: string | undefined,
  visibility?: string,
): ReadmeState {
  const [state, setState] = useState<ReadmeState>({
    body: null,
    author: undefined,
    loading: true,
    status: "loading",
    detail: null,
    attemptedUrl: null,
  });

  useEffect(() => {
    const resolved = resolveReadmeSource(source, slug, visibility);
    const ref = `${source ?? "?"}/${slug ?? "?"}`;

    if (resolved.kind === "private") {
      // Expected and handled, so `warn` rather than `error` — but never silent.
      console.warn(`[readme] ${ref}: SKILL.md not fetchable — ${resolved.reason}`);
      setState({
        body: null,
        author: undefined,
        loading: false,
        status: "private",
        detail: resolved.reason,
        attemptedUrl: null,
      });
      return;
    }

    if (resolved.kind === "invalid") {
      console.error(`[readme] ${ref}: cannot build a SKILL.md URL — ${resolved.reason}`);
      setState({
        body: null,
        author: undefined,
        loading: false,
        status: "error",
        detail: resolved.reason,
        attemptedUrl: null,
      });
      return;
    }

    const { url } = resolved;
    const controller = new AbortController();
    let active = true;

    setState((prev) => ({ ...prev, loading: true, status: "loading", detail: null }));

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!active) return;
        if (res.status === 404) {
          const detail = `no SKILL.md at ${url} (HTTP 404)`;
          console.error(`[readme] ${ref}: ${detail}`);
          setState({
            body: null,
            author: undefined,
            loading: false,
            status: "missing",
            detail,
            attemptedUrl: url,
          });
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = (await res.text()).slice(0, MAX_BYTES);
        if (!active) return;
        setState({
          body: stripFrontmatter(text),
          author: parseAuthor(text),
          loading: false,
          status: "ok",
          detail: null,
          attemptedUrl: url,
        });
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        const detail = err instanceof Error ? err.message : String(err);
        console.error(`[readme] ${ref}: fetch of ${url} failed — ${detail}`);
        setState({
          body: null,
          author: undefined,
          loading: false,
          status: "error",
          detail,
          attemptedUrl: url,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [source, slug, visibility]);

  return state;
}
