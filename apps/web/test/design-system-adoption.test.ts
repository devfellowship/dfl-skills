import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { test } from "node:test";

const WEB_ROOT = new URL("../", import.meta.url);

async function read(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, WEB_ROOT), "utf8");
}

test("the web app uses the shared component package with the Tailwind 4 Vite plugin", async () => {
  const pkg = JSON.parse(await read("package.json")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const viteConfig = await read("vite.config.ts");
  const css = await read("src/index.css");

  assert.match(pkg.dependencies?.["@devfellowship/components"] ?? "", /^\^3\.7\.0$/);
  assert.match(pkg.devDependencies?.tailwindcss ?? "", /^\^4(?:\.|$)/);
  assert.match(pkg.devDependencies?.["@tailwindcss/vite"] ?? "", /^\^4(?:\.|$)/);
  assert.match(viteConfig, /from ["']@tailwindcss\/vite["']/);
  assert.match(viteConfig, /tailwindcss\(\)/);
  assert.match(css, /@import ["']tailwindcss["']/);
  assert.match(css, /@import ["']@devfellowship\/components\/styles["']/);
});

test("generic UI primitives come from the shared component package", async () => {
  const genericLocalFiles = [
    "src/components/ui/Badge.tsx",
    "src/components/ui/Button.tsx",
    "src/components/ui/Card.tsx",
    "src/components/ui/Input.tsx",
    "src/components/ui/PanelLabel.tsx",
    "src/components/ui/Select.tsx",
    "src/components/ui/Skeleton.tsx",
    "src/components/ui/Tabs.tsx",
    "src/components/ui/Toaster.tsx",
    "src/components/ui/Tooltip.tsx",
    "src/lib/cn.ts",
  ];

  for (const path of genericLocalFiles) {
    await assert.rejects(access(new URL(path, WEB_ROOT)), `${path} must not shadow the shared package`);
  }

  const app = await read("src/App.tsx");
  const codeBlock = await read("src/components/ui/CodeBlock.tsx");
  const searchBar = await read("src/components/domain/SearchBar.tsx");

  assert.match(app, /from ["']@devfellowship\/components["']/);
  assert.match(codeBlock, /from ["']@devfellowship\/components["']/);
  assert.match(searchBar, /from ["']@devfellowship\/components["']/);
});

test("one shared package app shell wraps every route", async () => {
  const shellUrl = new URL("src/components/domain/AppShell.tsx", WEB_ROOT);
  await assert.doesNotReject(access(shellUrl), "the route-aware app shell must exist");

  const app = await read("src/App.tsx");
  const shell = await read("src/components/domain/AppShell.tsx");

  assert.match(app, /<AppShell>[\s\S]*<Routes>[\s\S]*<\/Routes>[\s\S]*<\/AppShell>/);
  assert.doesNotMatch(app, /<TopNav/);
  assert.match(shell, /\bAppSidebar\b/);
  assert.match(shell, /\bAppNavbar\b/);
  assert.match(shell, /leftSlot=\{<SidebarTrigger/);
  assert.match(shell, /endSlot=\{/);
  assert.match(shell, /\/docs/);
  // Minimal top bar (2026-09-18): sidebar toggle on the left, actions +
  // theme toggle on the right — no page title/breadcrumb, no app sub-label,
  // and no "Design system" nav item (removed separately from the sidebar).
  assert.doesNotMatch(shell, /appLabel=/);
  assert.doesNotMatch(shell, /breadcrumbs=/);
  assert.doesNotMatch(shell, /Design system/);
});

test("page and domain interactions use shared design-system primitives", async () => {
  const directories = ["src/pages", "src/components/domain"];

  for (const directory of directories) {
    const entries = await readdir(new URL(`${directory}/`, WEB_ROOT));
    for (const entry of entries.filter((name) => name.endsWith(".tsx"))) {
      const source = await read(`${directory}/${entry}`);
      assert.doesNotMatch(source, /<(button|select)\b/, `${directory}/${entry} uses a raw control`);
    }
  }
});
