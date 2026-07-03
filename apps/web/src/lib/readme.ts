import type { Skill } from "@/data/types";
import { kindMeta } from "./meta";

export function readmeFor(s: Skill): string {
  const km = kindMeta(s.kind).label.toLowerCase();
  return `# ${s.name}

${s.description}

## Overview

This ${km} ships as part of the **${s.source}** registry and is maintained by \`${s.author}\`. Install it with \`npx skills add ${s.source}/${s.slug}\` and it will be available to your agent immediately — no restart required.

## When to use it

- You want consistent, repeatable behaviour across sessions
- You are working inside the ${s.topics.join(", ")} space
- You'd rather not re-explain the same context to your agent every time

## Configuration

The skill reads sensible defaults from \`SKILL.md\`. To override, drop a \`.forge.json\` at your project root:

\`\`\`json
{
  "skill": "${s.slug}",
  "scope": "project"
}
\`\`\`

## Notes

All behaviour is defined in plain Markdown so you can read exactly what the agent will do before installing. Audit score for this release is **${s.audit.score}/100**.`;
}
