import { useEffect, useRef, useState } from "react";
import { fetchSkillContent } from "@/lib/api";
import {
  classifyReadmeFailure,
  fetchRawReadme,
  parseAuthor,
  resolveReadmeSource,
  stripFrontmatter,
  type ReadmeStatus,
} from "@/lib/readme";
import { useAuth } from "@/hooks/useAuth";

const MAX_BYTES = 512 * 1024;

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
): ReadmeState {
  const [state, setState] = useState<ReadmeState>(IDLE);
  const active = useRef(true);
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    // Resolving before the session settles would classify a readable internal
    // skill as `private` and leave that verdict on screen.
    if (authLoading) return;

    active.current = true;
    const resolved = resolveReadmeSource(source, slug, visibility, token !== null);
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
        ? fetchSkillContent(source as string, slug as string, controller.signal, token)
        : fetchRawReadme(resolved.url, controller.signal);

    request
      .then((text) => {
        if (active.current) setState(loaded(text, resolved.kind === "raw" ? resolved.url : null));
      })
      .catch((err: unknown) => {
        if (!active.current || controller.signal.aborted) return;
        const url = resolved.kind === "raw" ? resolved.url : null;
        const { status, detail } = classifyReadmeFailure(err, url);
        const log = status === "restricted" ? console.warn : console.error;
        log(`[readme] ${ref}: ${detail}`);
        setState(failed(status, detail, url));
      });

    return () => {
      active.current = false;
      controller.abort();
    };
  }, [source, slug, visibility, token, authLoading]);

  return state;
}
