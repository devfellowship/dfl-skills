import { useEffect, useState } from "react";
import { readmeRawUrl, stripFrontmatter } from "@/lib/readme";

const MAX_BYTES = 512 * 1024;

export interface ReadmeState {
  body: string | null;
  loading: boolean;
  notFound: boolean;
}

export function useSkillReadme(source: string | undefined, slug: string | undefined): ReadmeState {
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const url = source && slug ? readmeRawUrl(source, slug) : null;
    if (!url) {
      setBody(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setNotFound(false);

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!active) return;
        if (res.status === 404) {
          setNotFound(true);
          setBody(null);
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const text = (await res.text()).slice(0, MAX_BYTES);
        if (active) setBody(stripFrontmatter(text));
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setBody(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [source, slug]);

  return { body, loading, notFound };
}
