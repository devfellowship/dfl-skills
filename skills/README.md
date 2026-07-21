# Skills do time DFL para Claude Code

Espelho, em git, das skills (`SKILL.md`) que o time usa no dia a dia em projetos DFL. Cada subpasta é
independente e pode ser copiada direto para `~/.claude/skills/<nome>/` ou `.claude/skills/<nome>/` num
projeto específico.

| Skill | O que cobre |
|---|---|
| [`dfl/`](dfl/SKILL.md) | Code standards — componentização, nomenclatura e estrutura de arquivos para qualquer projeto frontend DFL. |
| [`dfl-plans/`](dfl-plans/SKILL.md) | Uso do DFL Plans MCP — criar/ler planos técnicos, gerar questions de execução. |
| [`dfl-mcp-engineering/`](dfl-mcp-engineering/SKILL.md) | Uso do pacote `dfl-mcp-engineering` (diagrams, spec-builder, task-assigner, documents) — login, conexão no Claude Code, matriz de capacidades, fluxos completos. |
| [`esteira-dfl/`](esteira-dfl/SKILL.md) | Gera a esteira técnica completa (sprints/etapas/tasks/pontuação) a partir de um spec/orçamento aprovado pelo comercial. |

Essas skills não são a fonte de verdade de nada — quando o comportamento real do sistema divergir do que
está escrito aqui, o sistema manda. Atualize o arquivo correspondente quando achar uma divergência.
