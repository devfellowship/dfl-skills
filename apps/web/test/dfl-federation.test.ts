import assert from "node:assert/strict";
import { test } from "node:test";

import { safeNext } from "../src/lib/dfl-federation.ts";

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
