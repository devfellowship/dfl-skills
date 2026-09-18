import assert from "node:assert/strict";
import { test } from "node:test";

import { skillAuthor } from "../src/lib/format.ts";

test("the author a skill names wins", () => {
  assert.equal(skillAuthor("SamuelStefano", "devfellowship/internal-skills"), "SamuelStefano");
});

test("an unattributed DFL skill, or one naming the org, is Tainan's", () => {
  assert.equal(skillAuthor(undefined, "devfellowship/internal-skills"), "taigfs");
  assert.equal(skillAuthor(null, "devfellowship/skills"), "taigfs");
  assert.equal(skillAuthor("devfellowship", "devfellowship/skills"), "taigfs");
  assert.equal(skillAuthor("  ", "devfellowship/skills"), "taigfs");
});

test("another owner with no default keeps the owner", () => {
  assert.equal(skillAuthor(undefined, "someone/skills"), "someone");
});
