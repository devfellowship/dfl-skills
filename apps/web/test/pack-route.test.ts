import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const WEB_ROOT = new URL("../", import.meta.url);

async function read(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, WEB_ROOT), "utf8");
}

// ---------------------------------------------------------------------------
// App.tsx ends in a catch-all that renders the HOME PAGE. A pack URL with no
// route of its own answers 200, mounts, raises no error, and shows the skill
// grid — it looks like a working page to every naive check. So the route must
// exist, and it must be declared before the catch-all.
// ---------------------------------------------------------------------------

test("the pack route is declared, on /p/, before the catch-all", async () => {
  const app = await read("src/App.tsx");
  const pack = app.indexOf('path="/p/:owner/:repo/:pack"');
  const catchAll = app.indexOf('path="*"');
  assert.ok(pack > 0, "App.tsx must declare /p/:owner/:repo/:pack");
  assert.ok(catchAll > pack, "the pack route must come before the catch-all");
  assert.match(app, /element=\{<PackDetailPage \/>\}/);
});

test("a pack is never a fourth skill kind (ADR-6)", async () => {
  const types = await read("src/types/index.ts");
  assert.match(types, /export type Kind = "skill" \| "mcp" \| "connection";/);
});

test("the docs never print the owner/repo/slug form that skills@1.7.0 rejects", async () => {
  const docs = await read("src/pages/DocsPage.tsx");
  assert.doesNotMatch(docs, /npx skills add devfellowship\/skills\/[a-z]/);
  assert.match(docs, /npx skills add devfellowship\/skills --skill /);
});

test("the breadcrumbs know the pack route, so /p/ does not read as the catalogue", async () => {
  const shell = await read("src/components/domain/AppShell.tsx");
  assert.match(shell, /\/p\//);
});

test("the home grid renders matching packs BEFORE the skills, so a pack sorts above its members", async () => {
  const home = await read("src/pages/HomePage.tsx");
  const packs = home.indexOf("<PackCard ");
  const skills = home.indexOf("<SkillCard ");
  assert.ok(packs > 0 && skills > packs, "PackCard must render before SkillCard in the grid");
});
