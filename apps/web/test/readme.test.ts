import assert from "node:assert/strict";
import { test } from "node:test";

import {
  parseAuthor,
  readmeRawUrl,
  resolveReadmeSource,
  skillMdGithubUrl,
  stripFrontmatter,
} from "../src/lib/readme.ts";

// ---------------------------------------------------------------------------
// THE FAILURE PATH: a private source can never resolve from the browser.
//
// `devfellowship/internal-skills` is private, and raw.githubusercontent.com
// answers 404 (not 403) for it — so a fetch there is not a retryable blip, it
// is permanently unresolvable. It MUST be classified up front so the UI can
// show a distinct state instead of a blank that reads as "no README".
// ---------------------------------------------------------------------------

test("private source resolves to `private`, not a fetchable URL", () => {
  const r = resolveReadmeSource("devfellowship/internal-skills", "dokploy-deploy", "internal");
  assert.equal(r.kind, "private");
  assert.match(r.kind === "private" ? r.reason : "", /private registry/);
});

test("`private` is driven by visibility, not by a hardcoded repo name", () => {
  // Same private-looking repo, but the registry says public -> we do fetch it.
  const asPublic = resolveReadmeSource("devfellowship/internal-skills", "x", "public");
  assert.equal(asPublic.kind, "raw");

  // Any other future private source is handled with no code change.
  const other = resolveReadmeSource("someorg/secret-skills", "x", "internal");
  assert.equal(other.kind, "private");
});

// The narrow tiers live in the SAME private repo as `internal`, so treating
// only `internal` as unfetchable would send the browser to raw.githubusercontent
// for a repo it cannot read — a guaranteed 404 rendered as "no README".
test("every non-public tier is unfetchable anonymously, not just `internal`", () => {
  for (const tier of ["internal", "leaders", "private"]) {
    assert.equal(resolveReadmeSource("devfellowship/internal-skills", "x", tier).kind, "private");
    assert.equal(
      resolveReadmeSource("devfellowship/internal-skills", "x", tier, true).kind,
      "registry",
    );
  }
});

// ---------------------------------------------------------------------------
// Signing in is what unlocks the internal registry. The browser still cannot
// reach the private repo — the API reads it server-side — so the authenticated
// outcome is `registry`, never `raw`.
// ---------------------------------------------------------------------------

test("authenticated + internal resolves to the registry, not raw GitHub", () => {
  const r = resolveReadmeSource("devfellowship/internal-skills", "dfl-code-style", "internal", true);
  assert.equal(r.kind, "registry");
});

test("signing in does not redirect public skills through the registry", () => {
  const r = resolveReadmeSource("devfellowship/skills", "squad-review", "public", true);
  assert.equal(r.kind, "raw");
});

test("a session cannot rescue a malformed ref", () => {
  assert.equal(resolveReadmeSource("../evil", "x", "internal", true).kind, "invalid");
  assert.equal(resolveReadmeSource("a/b", "bad slug", "internal", true).kind, "invalid");
});

test("public source still resolves to the raw URL", () => {
  const r = resolveReadmeSource("devfellowship/skills", "squad-review", "public");
  assert.equal(r.kind, "raw");
  assert.equal(
    r.kind === "raw" ? r.url : "",
    "https://raw.githubusercontent.com/devfellowship/skills/main/skills/squad-review/SKILL.md",
  );
});

test("absent visibility is treated as fetchable (registry default is public)", () => {
  assert.equal(resolveReadmeSource("devfellowship/skills", "squad-review").kind, "raw");
});

test("missing source or slug is `invalid`, never a silent no-op", () => {
  assert.equal(resolveReadmeSource(undefined, "x", "public").kind, "invalid");
  assert.equal(resolveReadmeSource("a/b", undefined, "public").kind, "invalid");
});

test("path-traversal and malformed refs are rejected as `invalid`", () => {
  for (const bad of ["../../etc", "a/../b", "not-a-source", "a/b/c"]) {
    const r = resolveReadmeSource(bad, "slug", "public");
    assert.equal(r.kind, "invalid", `expected "${bad}" to be invalid`);
  }
  assert.equal(resolveReadmeSource("a/b", "bad slug", "public").kind, "invalid");
});

test("every invalid/private outcome carries a non-empty reason for logging", () => {
  const cases = [
    resolveReadmeSource(undefined, undefined, "public"),
    resolveReadmeSource("../x", "y", "public"),
    resolveReadmeSource("devfellowship/internal-skills", "y", "internal"),
  ];
  for (const c of cases) {
    assert.notEqual(c.kind, "raw");
    const reason = c.kind === "raw" ? "" : c.reason;
    assert.ok(reason.length > 0, "reason must be loggable");
  }
});

// ---------------------------------------------------------------------------
// Existing helpers — guard against regressions in the URL builders.
// ---------------------------------------------------------------------------

test("readmeRawUrl / skillMdGithubUrl reject unsafe input", () => {
  assert.equal(readmeRawUrl("../evil", "slug"), null);
  assert.equal(readmeRawUrl("a/b", "../evil"), null);
  assert.equal(skillMdGithubUrl("../evil", "slug"), null);
  assert.equal(
    skillMdGithubUrl("devfellowship/skills", "squad-review"),
    "https://github.com/devfellowship/skills/blob/main/skills/squad-review/SKILL.md",
  );
});

test("stripFrontmatter and parseAuthor", () => {
  const md = ['---', 'name: demo', 'author: taigfs', '---', '', '# Title'].join("\n");
  assert.equal(stripFrontmatter(md), "# Title");
  assert.equal(parseAuthor(md), "taigfs");
  assert.equal(parseAuthor("# no frontmatter"), undefined);
});
