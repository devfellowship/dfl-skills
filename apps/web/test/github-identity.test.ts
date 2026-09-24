import assert from "node:assert/strict";
import { test } from "node:test";

import { githubProfileOf, safeNext } from "../src/lib/github-identity.ts";

test("safeNext keeps same-site paths", () => {
  assert.equal(safeNext("/s/devfellowship/internal-skills/dfl-code-style"), "/s/devfellowship/internal-skills/dfl-code-style");
  assert.equal(safeNext("/docs?q=core"), "/docs?q=core");
});

test("safeNext refuses anything that could leave the site", () => {
  assert.equal(safeNext("//evil.example"), "/");
  assert.equal(safeNext("/\\evil.example"), "/");
  assert.equal(safeNext("\\/evil.example"), "/");
  assert.equal(safeNext("\\\\evil.example"), "/");
  assert.equal(safeNext("https://evil.example"), "/");
  assert.equal(safeNext("javascript:alert(1)"), "/");
  assert.equal(safeNext(null), "/");
  assert.equal(safeNext(""), "/");
});

test("githubProfileOf reads the profile from the GitHub identity only", () => {
  const profile = githubProfileOf({
    email: "someone@company.example",
    identities: [
      { provider: "email", identity_data: { email: "someone@company.example" } },
      {
        provider: "github",
        identity_data: {
          user_name: "octocat",
          full_name: "The Octocat",
          email: "octocat@github.example",
          avatar_url: "https://avatars.githubusercontent.com/u/583231",
        },
      },
    ],
  } as never);
  assert.deepEqual(profile, {
    handle: "octocat",
    name: "The Octocat",
    email: "octocat@github.example",
    avatarUrl: "https://avatars.githubusercontent.com/u/583231",
  });
});

test("githubProfileOf falls back to the handle for a name and to the account for an email", () => {
  const profile = githubProfileOf({
    email: "someone@company.example",
    identities: [{ provider: "github", identity_data: { preferred_username: "octocat", full_name: "  " } }],
  } as never);
  assert.deepEqual(profile, { handle: "octocat", name: "octocat", email: "someone@company.example", avatarUrl: null });
});

test("githubProfileOf is null for an account with no GitHub identity", () => {
  assert.equal(githubProfileOf({ email: "a@b.example", identities: [{ provider: "email", identity_data: {} }] } as never), null);
  assert.equal(githubProfileOf({ email: "a@b.example" } as never), null);
  assert.equal(githubProfileOf(null), null);
});
