<div align="center">

# DFL Skills

**The DevFellowship registry of agent skills.**

Browse, search and install `SKILL.md` skills for Claude Code and other coding agents.

[**skills.devfellowship.com**](https://skills.devfellowship.com) · [Docs](https://skills.devfellowship.com/docs) · [Skill source](https://github.com/devfellowship/skills)

[![CI](https://github.com/devfellowship/dfl-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/devfellowship/dfl-skills/actions/workflows/ci.yml)

</div>

---

This repository contains the **web app** behind [skills.devfellowship.com](https://skills.devfellowship.com)
and a small **companion CLI**. The skills themselves live in
[`devfellowship/skills`](https://github.com/devfellowship/skills). The registry API that indexes them is a
separate service.

## Install a skill

DFL Skills works with the stock [`skills`](https://www.npmjs.com/package/skills) CLI. No extra tool is
necessary.

```bash
# List the skills in the DFL repository
npx skills add devfellowship/skills --list

# Install one skill
npx skills add devfellowship/skills --skill test-driven-development

# Update installed skills
npx skills update --all
```

To make the CLI search the DFL registry, set the search base:

```bash
export SEARCH_API_BASE=https://skills.devfellowship.com
```

Every skill page on the site also has a **Copy install prompt** button and a **Download SKILL.md** button.

## Features

- **Catalog and search** — search skills, filter them by kind, topic and author, or show only the official ones.
- **Skill pages** — the rendered `SKILL.md`, metadata, and a ready-to-copy install command.
- **Agent-ready install** — copy a prompt that tells your agent to install the skill through the DFL MCP server.
- **Public and internal skills** — public skills are open to everyone. Internal skills show after you sign in with a DevFellowship account.
- **Companion CLI** — search the registry, and install `kind: mcp` and `kind: connection` skills that the stock CLI does not handle.

## Tech stack

| Area | Tools |
| --- | --- |
| Web app | React 18, Vite 5, TypeScript, Tailwind CSS 4, React Router |
| UI | [`@devfellowship/components`](https://www.npmjs.com/package/@devfellowship/components), lucide-react, sonner |
| Auth | Supabase Auth ("Sign in with DevFellowship") |
| CLI | Node.js 20+, TypeScript, zero runtime dependencies |
| Monorepo | Bun workspaces, Turborepo |
| Tests | `node --test` with `tsx` |

## Local development

Requirements: [Bun](https://bun.sh) 1.3+ and Node.js 20+.

```bash
bun install
bun run dev        # web app on http://localhost:5173
```

The web app reads the production registry API by default, so no local backend is necessary.
To change this, copy `apps/web/.env.example` to `apps/web/.env.local` and edit the values.
The Supabase values are optional. Without them, the sign-in button does not show.

Checks (CI runs the same three):

```bash
bun run typecheck
bun run build
bun run test
```

## Project structure

```
.
├── apps/
│   └── web/          # Vite + React registry UI (@dfl-skills/web)
│       ├── src/      #   pages, components, hooks, lib
│       └── test/     #   unit tests
├── packages/
│   └── cli/          # @devfellowship/skills companion CLI (see its README)
└── .github/workflows # CI: typecheck, build, test
```

## Contributing

- **Publish a skill:** open a pull request that adds `skills/<name>/SKILL.md` to
  [`devfellowship/skills`](https://github.com/devfellowship/skills). After the merge, the registry indexes it.
- **Change the app or the CLI:** open a pull request against `main` in this repository.
  Make sure `bun run typecheck`, `bun run build` and `bun run test` pass.
- **Report a bug:** open an [issue](https://github.com/devfellowship/dfl-skills/issues).

Do not put secrets in this repository. Every `VITE_*` value goes into the public browser bundle.

## License

This project is licensed under the [MIT License](LICENSE). Copyright (c) 2026 DevFellowship.
