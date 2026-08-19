import type { Visibility } from "@/types";

// Null prototype: `visibility` is server data, and a plain object would resolve
// "constructor" or "toString" up the chain into a className.
export const VISIBILITY_TONE: Record<string, string> = Object.assign(Object.create(null), {
  public: "border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] text-[hsl(212_12%_64%)]",
  internal: "border-[hsl(205_70%_50%/.35)] bg-[hsl(205_70%_50%/.12)] text-[hsl(205_75%_68%)]",
  leaders: "border-[hsl(268_60%_60%/.35)] bg-[hsl(268_60%_60%/.12)] text-[hsl(268_70%_74%)]",
  private: "border-[hsl(0_70%_55%/.35)] bg-[hsl(0_70%_55%/.12)] text-[hsl(0_75%_70%)]",
});

export const VISIBILITY_LABEL: Record<string, string> = Object.assign(Object.create(null), {
  public: "Public",
  internal: "DFL only",
  leaders: "Leaders",
  private: "Private",
});

/**
 * `public` is absent on purpose: every non-public row lives in the PRIVATE
 * internal-skills repo, so promoting one would publish it to the open internet.
 * The API and a CHECK constraint refuse it too.
 */
export const RETIERABLE: Visibility[] = ["internal", "leaders", "private"];
