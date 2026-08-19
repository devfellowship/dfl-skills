/**
 * Separate from `api.ts` because that module reads `import.meta.env` at load
 * time, which only exists under Vite — importing it from a plain Node test
 * would throw before a single assertion ran.
 */
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
