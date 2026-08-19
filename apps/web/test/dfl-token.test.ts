import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

const ISS = "https://yoojxnggaxcqtsyjdrdx.supabase.co/auth/v1";

const store = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  sessionStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
};

const { clearDflToken, emailOf, isUsableToken, readDflToken, storeDflToken } = await import(
  "../src/lib/dfl-token.ts"
);

function jwt(claims: Record<string, unknown>): string {
  const part = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${part({ alg: "HS256" })}.${part(claims)}.sig`;
}

const hour = Math.floor(Date.now() / 1000) + 3600;

beforeEach(() => store.clear());

test("a signed, unexpired token from the DFL issuer is usable", () => {
  assert.ok(isUsableToken(jwt({ iss: ISS, exp: hour, email: "s@dfl.com" }), ISS));
});

test("a token this app cannot use is refused", () => {
  assert.equal(isUsableToken(jwt({ iss: ISS, exp: hour - 7200 }), ISS), false, "expired");
  assert.equal(isUsableToken(jwt({ iss: "https://evil.example/auth/v1", exp: hour }), ISS), false, "issuer");
  assert.equal(isUsableToken(jwt({ iss: ISS }), ISS), false, "no exp");
  assert.equal(isUsableToken("not-a-jwt", ISS), false);
  assert.equal(isUsableToken(null, ISS), false);
});

test("only a usable token survives a round trip through storage", () => {
  storeDflToken(jwt({ iss: ISS, exp: hour - 7200 }), ISS);
  assert.equal(readDflToken(ISS), null);

  const good = jwt({ iss: ISS, exp: hour, email: "s@dfl.com" });
  storeDflToken(good, ISS);
  assert.equal(readDflToken(ISS), good);

  clearDflToken();
  assert.equal(readDflToken(ISS), null);
});

test("emailOf reads the claim the nav renders", () => {
  assert.equal(emailOf(jwt({ iss: ISS, exp: hour, email: "s@dfl.com" })), "s@dfl.com");
  assert.equal(emailOf(jwt({ iss: ISS, exp: hour })), null);
});
