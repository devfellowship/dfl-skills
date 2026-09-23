import assert from "node:assert/strict";
import { test } from "node:test";

import type { Pack, Skill } from "../src/types/index.ts";
import {
  CORE_TEAM_LABEL,
  isCoreHandle,
  maintainerApprovalLine,
  maintainerHref,
  maintainerLabel,
  packOwner,
  packProposeUrl,
  packsByMaintainer,
  skillOwner,
  skillProposeUrl,
  skillsByMaintainer,
} from "../src/lib/maintainer.ts";
import { adaptPack } from "../src/lib/packs.ts";

function skill(over: Partial<Skill> = {}): Skill {
  return {
    id: "devfellowship/skills/x",
    name: "x",
    slug: "x",
    source: "devfellowship/skills",
    kind: "skill",
    description: "",
    tags: [],
    categories: [],
    updatedAt: "2026-09-01T00:00:00Z",
    visibility: "public",
    ...over,
  };
}

test("isCoreHandle treats no author, blank and `devfellowship` (any case) as core", () => {
  assert.equal(isCoreHandle(undefined), true);
  assert.equal(isCoreHandle(null), true);
  assert.equal(isCoreHandle("  "), true);
  assert.equal(isCoreHandle("devfellowship"), true);
  assert.equal(isCoreHandle("DevFellowship"), true);
  assert.equal(isCoreHandle("taigfs"), false);
});

test("maintainerLabel and maintainerHref", () => {
  assert.equal(maintainerLabel("devfellowship"), CORE_TEAM_LABEL);
  assert.equal(maintainerLabel("taigfs"), "taigfs");
  assert.equal(maintainerHref("taigfs"), "/u/taigfs");
  assert.equal(maintainerHref("a b"), "/u/a%20b");
});

test("skillOwner reads the raw `author:` field, not the display fallback", () => {
  assert.equal(skillOwner(skill({ author: "octocat" })), "octocat");
  assert.equal(skillOwner(skill({ author: "devfellowship" })), null);
  assert.equal(skillOwner(skill({ author: undefined })), null);
});

test("packOwner is the root skill's raw author, else core", () => {
  const pack = adaptPack({
    source: "acme/skills",
    pack: "p",
    root: "root-skill",
    members: [{ slug: "root-skill", role: "root", status: "in_catalogue", author: "octocat" }],
  });
  assert.equal(packOwner(pack), "octocat");

  const corePack = adaptPack({
    source: "acme/skills",
    pack: "p2",
    root: "root-skill",
    members: [{ slug: "root-skill", role: "root", status: "in_catalogue", author: "devfellowship" }],
  });
  assert.equal(packOwner(corePack), null);
});

test("packOwner resolves a list-endpoint pack, which carries no member authors, from the catalogue", () => {
  const pack = adaptPack({
    source: "acme/skills",
    pack: "p",
    root: "root-skill",
    members: [{ slug: "root-skill", role: "root", status: "in_catalogue" }],
  });
  const skills = [
    skill({ id: "1", slug: "root-skill", source: "other/repo", author: "impostor" }),
    skill({ id: "2", slug: "root-skill", source: "acme/skills", author: "octocat" }),
  ];
  assert.equal(packOwner(pack, skills), "octocat");
  assert.equal(packOwner(pack), null);
});

test("packOwner never takes a non-root member's author, which the display byline may", () => {
  const pack = adaptPack({
    source: "acme/skills",
    pack: "p",
    root: "root-skill",
    members: [
      { slug: "root-skill", role: "root", status: "in_catalogue", author: null },
      { slug: "helper", role: "required", status: "in_catalogue", author: "octocat" },
    ],
  });
  assert.equal(packOwner(pack), null);
});

test("skillsByMaintainer and packsByMaintainer match case-insensitively", () => {
  const skills = [
    skill({ id: "1", slug: "a", author: "Octocat" }),
    skill({ id: "2", slug: "b", author: "someone-else" }),
    skill({ id: "3", slug: "c", author: undefined }),
  ];
  assert.deepEqual(
    skillsByMaintainer(skills, "octocat").map((s) => s.slug),
    ["a"],
  );
  assert.deepEqual(
    skillsByMaintainer(skills, "devfellowship").map((s) => s.slug),
    ["c"],
  );

  const packs: Pack[] = [
    adaptPack({
      source: "acme/skills",
      pack: "p",
      root: "root-skill",
      members: [{ slug: "root-skill", role: "root", status: "in_catalogue", author: "Octocat" }],
    }),
  ];
  assert.deepEqual(
    packsByMaintainer(packs, [], "OCTOCAT").map((p) => p.slug),
    ["p"],
  );
  assert.deepEqual(packsByMaintainer(packs, [], "someone-else"), []);
});

test("maintainerApprovalLine", () => {
  assert.equal(
    maintainerApprovalLine("taigfs", "skill"),
    "Changes to this skill need @taigfs's approval.",
  );
  assert.equal(
    maintainerApprovalLine("taigfs", "pack"),
    "Changes to this pack need @taigfs's approval.",
  );
  assert.equal(
    maintainerApprovalLine("devfellowship", "skill"),
    "Changes need approval from the DFL core team.",
  );
});

test("skillProposeUrl and packProposeUrl point at the source repo, and reject bad identifiers", () => {
  assert.equal(
    skillProposeUrl("devfellowship/skills", "test-driven-development"),
    "https://github.com/devfellowship/skills/tree/main/skills/test-driven-development",
  );
  assert.equal(
    packProposeUrl("devfellowship/internal-skills", "short-form-visual"),
    "https://github.com/devfellowship/internal-skills/blob/main/packs/short-form-visual.yaml",
  );
  assert.equal(skillProposeUrl("../etc", "x"), null);
  assert.equal(skillProposeUrl("a/b", "../x"), null);
  assert.equal(packProposeUrl("a/b", "x y"), null);
});
