import assert from "node:assert/strict";
import { test } from "node:test";

import { skillAuthor } from "../src/lib/format.ts";

test("the author a skill names wins", () => {
  assert.equal(skillAuthor("SamuelStefano", "devfellowship/internal-skills"), "SamuelStefano");
});

test("an unattributed DFL skill, or one naming the org, is the core team's", () => {
  assert.equal(skillAuthor(undefined, "devfellowship/internal-skills"), "devfellowship");
  assert.equal(skillAuthor(null, "devfellowship/skills"), "devfellowship");
  assert.equal(skillAuthor("devfellowship", "devfellowship/skills"), "devfellowship");
  assert.equal(skillAuthor("  ", "devfellowship/skills"), "devfellowship");
});

test("another owner keeps the owner", () => {
  assert.equal(skillAuthor(undefined, "someone/skills"), "someone");
});
