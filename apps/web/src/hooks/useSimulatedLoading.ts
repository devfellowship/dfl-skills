import { useEffect, useState } from "react";

export function useSimulatedLoading(delayMs: number, deps: ReadonlyArray<unknown> = []): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}
