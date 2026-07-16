---
name: dfl-mcp-engineering
description: "Uso completo do pacote dfl-mcp-engineering (diagrams, spec-builder, task-assigner, documents) — login, conexão como tool nativa do Claude Code, matriz de capacidades real, fluxos completos e troubleshooting. Use quando: criar/ler diagramas de um épico, gerar tasks via IA a partir de uma spec, atribuir desenvolvedor a uma task, seedar template de documento ou ler/escrever documento de handoff."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash PowerShell Grep Glob
metadata:
  purpose: Operação completa do pacote dfl-mcp-engineering (engineering.mcp.devfellowship.com) via MCP
  version: "1.0.0"
---

# DFL MCP Engineering — Skill de Uso

Skill de referência para o pacote **`dfl-mcp-engineering`** — um único servidor MCP (`engineering.mcp.devfellowship.com`)
que cobre **quatro mini-apps da esteira DFL**: Diagrams, Spec Builder, Task Assigner e Documents.

Esta skill **não duplica** a doc oficial (`docs.devfellowship.com` — [auth](https://docs.devfellowship.com/auth/),
[getting-started](https://docs.devfellowship.com/getting-started/), [tools/diagrams](https://docs.devfellowship.com/tools/diagrams/),
[tools/spec-builder](https://docs.devfellowship.com/tools/spec-builder/), [tools/task-assigner](https://docs.devfellowship.com/tools/task-assigner/),
[tools/documents](https://docs.devfellowship.com/tools/documents/)), que já tem os schemas exatos de cada tool. Esta skill foca no que
falta lá: **o fluxo prático no Claude Code, uma matriz honesta do que dá e não dá pra fazer, e os fluxos ponta-a-ponta**.

---

## 0. Matriz de capacidades (leia antes de prometer algo a alguém)

| Recurso | Create | Read | Update | Delete |
|---|:---:|:---:|:---:|:---:|
| **Diagramas** (`public.diagrams`) | ✅ só nodes/edges nativos `@xyflow/react` — **sem import Mermaid/PlantUML** | ✅ `get_diagram`/`list_diagrams` | ❌ não existe | ❌ não existe |
| **Tasks via Spec Builder** (`work.tasks`) | ✅ `generate_tasks`, via IA, **sem gate de revisão manual** | usar domínio `dfl-work` pra ler | usar domínio `dfl-work` | usar domínio `dfl-work` |
| **Task Assigner** (`work.tasks.owner_id`) | — | ✅ retorna ranking completo | ✅ `assign_developer` sempre grava o top-score, **sem modo "só sugerir"** | — |
| **Templates de documento** (`documents.template`) | ✅ `seed_template` | ❌ não tem `get_template`/`list_template` | ✅ mesma tool, idempotente por `name` | ❌ não existe |
| **Documento de handoff** (`documents.document`) | ✅ só do template `category: "handoff"` ativo | ✅ `get_handoff_document` lê **qualquer** documento (não só handoff), por `id` ou `epic_id` | ✅ só handoff, mesma tool via `document_id` | ❌ não existe |

**Traduzindo pra quem for perguntar "dá pra criar/ver/editar qualquer documento e diagrama pelo MCP?":** não totalmente.
Diagrama cria e lê, não edita nem apaga. Documento só tem escrita de verdade pro template de handoff — qualquer outro tipo de
documento só dá pra **ler**, não criar/editar ainda.

**Delete é ausência deliberada, não lacuna a preencher.** Decisão confirmada por William (2026-07-16): nenhuma tool MCP da DFL
deve expor delete por padrão — o risco de erro em cascata (um delete errado é irreversível e pode se propagar, ex: apagar
um épico junto com diagramas/tasks relacionados) supera o benefício. Se aparecer a tentação de "completar o CRUD" com uma
tool de delete em qualquer pacote MCP novo, tratar como exceção que precisa aprovação explícita, não como padrão natural.

---

## 1. Login (uma vez por máquina)

```bash
npx @devfellowship/dfl-auth configure   # uma vez por máquina
npx @devfellowship/dfl-auth login       # abre GitHub OAuth no browser
npx @devfellowship/dfl-auth status      # confirma autenticação + validade do token
```

Credenciais ficam em `~/.dfl-mcp/credentials.json` (`access_token`, `refresh_token`, `expires_at`). Token expirado:

```bash
npx @devfellowship/dfl-auth refresh
```

**Nunca dar commit/paste nesse arquivo** — são tokens ao vivo.

---

## 2. Conectar no Claude Code — jeito certo (confirmado em produção, 2026-07-16)

A doc oficial (`getting-started.mdx`) diz para editar `~/.claude/mcp.json` (global) ou `.mcp.json` (projeto). **Isso não
funciona mais** com a CLI atual do Claude Code — editar esse arquivo não tem efeito nenhum (`/mcp` continua dizendo
"No MCP servers are configured"), porque o Claude Code guarda a config real em `~/.claude.json`, dentro de
`projects.<caminho>.mcpServers`, um JSON grande que **não deve ser editado à mão**.

**Forma correta — usar o comando `claude mcp add`:**

```bash
TOKEN=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.env.USERPROFILE + '/.dfl-mcp/credentials.json','utf8')).access_token)")

claude mcp add --transport http --scope user dfl-engineering \
  "https://engineering.mcp.devfellowship.com/mcp" \
  --header "Authorization: Bearer $TOKEN"
```

- **`--scope user`** é importante: registra globalmente (todos os projetos/diretórios), não só o diretório onde o
  comando rodou. Sem isso o padrão é `local`/`project` — preso a um diretório específico (foi assim, sem querer,
  que `dfl-work`/`dfl-learn`/`dfl-ops`/`dfl-plans` ficaram presos ao projeto `dfl-ventures` numa config antiga).
- Confirmar com `claude mcp list` — mostra status de conexão de cada server (`✔ Connected` / erro).
- **Token expira em ~7 dias** — quando `claude mcp list` mostrar erro de auth, rodar `dfl-auth refresh` de novo e
  re-adicionar (`claude mcp add` sobrescreve se o nome já existir) ou remover+re-adicionar (`claude mcp remove dfl-engineering`).

**Gotcha importante:** um servidor adicionado **no meio de uma sessão/conversa já aberta** não aparece pro modelo
instantaneamente — a conexão MCP acontece em background e pode levar um tempinho (a sessão recebe um aviso tipo
"servidor X ainda conectando"). Uma vez conectado, as tools aparecem como *deferred tools*, buscáveis via
`ToolSearch` (ex: `ToolSearch("seed_template")`) sem precisar abrir conversa nova — confirmado em produção
(2026-07-16): `claude mcp add` no meio da sessão, tools apareceram poucos minutos depois, mesma conversa. Se depois
de alguns minutos ainda não aparecer nada no `ToolSearch`, aí sim vale tentar uma conversa nova.

---

## 3. Conectar manualmente (curl/Node) — pra testar sem esperar reconectar, ou fora do Claude Code

Útil quando: você acabou de rodar `claude mcp add` mas está na mesma sessão (tool ainda não visível), ou quer script
de automação fora de um cliente MCP completo. Protocolo é Streamable HTTP — toda chamada depois do `initialize`
repete o header `Mcp-Session-Id`.

```bash
TOKEN=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.env.USERPROFILE + '/.dfl-mcp/credentials.json','utf8')).access_token)")

# 1. initialize — captura o Mcp-Session-Id do header de resposta
curl -sS -D /tmp/headers.txt -X POST "https://engineering.mcp.devfellowship.com/mcp" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"manual-test","version":"1.0"}}}'
SESSION=$(grep -i "mcp-session-id" /tmp/headers.txt | cut -d' ' -f2 | tr -d '\r')

# 2. tools/list — confirma quais tools estão deployadas nesse momento
curl -sS -X POST "https://engineering.mcp.devfellowship.com/mcp" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $TOKEN" -H "Mcp-Session-Id: $SESSION" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# 3. tools/call — chamada real
curl -sS -X POST "https://engineering.mcp.devfellowship.com/mcp" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $TOKEN" -H "Mcp-Session-Id: $SESSION" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_diagrams","arguments":{"limit":5}}}'
```

Toda resposta vem em formato SSE (`event: message\ndata: {...}`) mesmo a requisição sendo JSON puro — parsear a
linha `data:` pra pegar o payload JSON-RPC. **Payload grande (Markdown de template, etc.) é mais confiável montar
num arquivo `.mjs`/`.json` via Node e mandar com `--data-binary "@arquivo"` do que tentar escapar tudo inline no shell.**

Sessão expira rápido (minutos de inatividade) — se um `tools/call` voltar `Invalid or missing session`, refazer o
`initialize` antes do próximo lote de chamadas.

---

## 4. Ferramentas por mini-app

### 4.1 Diagrams

| Tool | Assinatura | Notas |
|---|---|---|
| `create_diagram` | `epic_id, name, type ("flowchart"\|"erd"\|"sequence"), nodes?, edges?` | `epic_id` é `work.epics.id`, **não** `work.projects.id` (ver §5). Nodes/edges no formato nativo `@xyflow/react` — sem import de texto Mermaid/PlantUML. |
| `list_diagrams` | `epic_id?, limit?, offset?, search?` | |
| `get_diagram` | `id` | Retorna nodes/edges completos. |

**RLS é owner-scoped, não member-scoped:** `public.diagrams` só tem uma policy `FOR ALL USING (auth.uid() = created_by)`.
Isso significa `list_diagrams`/`get_diagram` só retornam diagramas **do próprio usuário que chamou**, nunca de colegas
no mesmo épico — mesmo que a intenção seja "ver o que o time todo fez". Comportamento confirmado, não resolvido
(ver PR [dfl-mcp-server#223](https://github.com/devfellowship/dfl-mcp-server/pull/223)).

### 4.2 Spec Builder

| Tool | Assinatura | Notas |
|---|---|---|
| `generate_tasks` | `spec` (obrigatório) + `epic_id` OU `epic_name`+`project_id` | Restrito a projetos das business units **devfellowship/Revera** (MVP — Itera fica de fora). **Sem gate de revisão manual** — insere direto em `work.tasks`, diferente do frontend `dfl-spec-builder` que estagia pra aprovação. |

Cada geração grava uma linha em `work.spec_generation_logs` (`status: completed|failed`, `task_identifiers` reais).

### 4.3 Task Assigner

| Tool | Assinatura | Notas |
|---|---|---|
| `assign_developer` | `task_id` | Resolve `epic_id → project_id → business_unit` server-side, chama a Edge Function `dfl-ai-task-assigner-matching-task`, **sempre atribui o candidato de maior score** (sem modo "só sugerir"). Retorna a lista ranqueada completa pra transparência. |

Se a Edge Function não achar candidatos, retorna `{"status": "no_candidates"}` e **não** grava `owner_id` — isso não é erro.

### 4.4 Documents

| Tool | Assinatura | Notas |
|---|---|---|
| `seed_template` | `name, document_type?, category?, description?, content, variables[]` | Idempotente por `name` — rodar de novo com o mesmo nome atualiza o template e **substitui o conjunto inteiro de variáveis**. Não é específico de handoff, serve pra qualquer template. |
| `get_handoff_document` | `id?` ou `epic_id?` | Lê qualquer `documents.document`, apesar do nome da tool. |
| `write_handoff_document` | `epic_id, title, variables, document_id?` | Cria OU atualiza (se passar `document_id`) uma instância do template **ativo com `category: "handoff"`**. Injeta `{{dfl-diagram:UUID}}` automaticamente pra cada diagrama do épico. |

**Nunca usar `document_type: "handoff"`** — esse valor não existe no enum Postgres `documents.document_type`
(`contract | proposal | nda | sow | other | amendment`). Use `category: "handoff"` (campo livre) + `document_type`
no default `"other"`. Passar `"handoff"` quebra com erro de enum no banco.

**Diagrama injetado é token, não imagem renderizada** — `write_handoff_document` não roda Mermaid/PlantUML
server-side; só troca o placeholder do template por `{{dfl-diagram:UUID}}` real. Quem resolve isso pra imagem é o
frontend `dfl-documents` (`src/utils/diagram-token.ts`), ao abrir/editar o documento lá.

**Estimativas em template de handoff:** nunca usar `variable_type: "currency"` — regra de negócio explícita é que
documento de handoff não expõe valor monetário. Usar `"number"` ou texto livre, com a unidade (pontos/horas) no
`label`.

---

## 5. Resolver `epic_id` / `project_id` / business unit (não é deste pacote)

`dfl-mcp-engineering` **não tem tool de listagem de épicos**. Pra achar um `epic_id` de verdade, consultar o
domínio `dfl-work` (`work.mcp.devfellowship.com`, tools `list_epics`/`get_epic`) — outro servidor MCP, mesma
autenticação (mesmo token). Se `dfl-work` não estiver registrado no Claude Code, `claude mcp add` do mesmo jeito
(seção 2), trocando só o `name`/`url`.

Cadeia de resolução usada internamente pelas tools deste pacote: `work.tasks.epic_id → work.epics.project_id →
work.projects → business_units.name`.

---

## 6. Fluxos completos (passo a passo)

### Fluxo A — criar um diagrama pra um épico

```
1. Achar o epic_id real via dfl-work (list_epics/get_epic) — nunca usar project_id aqui.
2. create_diagram(epic_id, name, type, nodes, edges)
3. get_diagram(id) pra conferir o que foi salvo.
```

### Fluxo B — gerar tasks a partir de uma spec

```
1. Ter um epic_id existente OU (epic_name + project_id) pra criar um novo.
2. generate_tasks(spec, epic_id) — insere direto em work.tasks, sem gate.
3. Conferir em work.spec_generation_logs (via dfl-work) se quiser rastrear a geração.
```

### Fluxo C — atribuir desenvolvedor a uma task

```
1. Ter um task_id (via dfl-work, list_tasks/get_task).
2. assign_developer(task_id) — grava owner_id do top-score automaticamente.
3. Ler a lista ranqueada retornada se quiser confirmar/corrigir manualmente depois.
```

### Fluxo D — seedar template + escrever + ler documento de handoff

```
1. seed_template(name, category: "handoff", document_type: "other" [nunca "handoff"], content, variables)
2. write_handoff_document(epic_id, title, variables) — cria a instância, injeta diagramas do épico.
3. get_handoff_document(id) ou get_handoff_document(epic_id) pra conferir.
```

**Sem tool de delete** — se estiver só testando, ter em mente que o registro fica em produção. Preferir testar
`seed_template` isoladamente (idempotente, sem gerar documento) antes de rodar `write_handoff_document` de verdade.

---

## 7. Troubleshooting

| Sintoma | Causa | Solução |
|---|---|---|
| `/mcp` diz "No MCP servers are configured" depois de editar `~/.claude/mcp.json` | Esse arquivo não é lido pelo Claude Code atual | Usar `claude mcp add` (seção 2), nunca editar `~/.claude/mcp.json`/`~/.claude.json` à mão |
| Tool `seed_template`/etc. não aparece no `ToolSearch` logo após `claude mcp add` | Conexão MCP em background ainda não completou | Esperar alguns minutos e tentar `ToolSearch` de novo; só abrir conversa nova se persistir |
| `{"jsonrpc":"2.0","error":{"code":-32001,"message":"Token expired"}}` no `initialize` | Token JWT expirado | `npx @devfellowship/dfl-auth refresh`, pegar o novo `access_token` de `~/.dfl-mcp/credentials.json` |
| `401 Unauthorized` | Token ausente/malformado/expirado | Conferir header `Authorization: Bearer <token>` (um espaço só) |
| `403 Forbidden` | Autenticado mas RLS/IAM não permite | Comportamento esperado — o MCP roda como o usuário, não bypassa RLS |
| `Invalid or missing session` num `tools/call` | Sessão MCP expirou (inatividade) | Refazer `initialize`, capturar `Mcp-Session-Id` novo |
| `create_diagram` falha com "row violates row-level security policy" | `created_by` não setado (bug corrigido na PR #223, mas confira se está na versão deployada) | Confirmar que a versão do `dfl-mcp-engineering` em produção já tem o fix |
| `seed_template` falha com erro de enum em `document_type` | Passou `"handoff"` como `document_type` | Usar `category: "handoff"` + `document_type: "other"` |
| `assign_developer` retorna `{"status":"no_candidates"}` | Não há devs com histórico suficiente pro matching | Não é erro — sem candidatos, `owner_id` não é gravado |
| Diagramas de colegas não aparecem em `list_diagrams` | RLS owner-scoped (§4.1) | Comportamento atual, não bug — cada um só vê os próprios diagramas |

---

## 8. Referências

- Doc oficial (schemas exatos de cada tool, em inglês): [docs.devfellowship.com](https://docs.devfellowship.com/) —
  páginas `auth`, `getting-started`, `tools/diagrams`, `tools/spec-builder`, `tools/task-assigner`, `tools/documents`.
- Repo: [devfellowship/dfl-mcp-server](https://github.com/devfellowship/dfl-mcp-server), pacote
  `packages/dfl-mcp-engineering`.
- Skill irmã pra outro domínio MCP (mesmo padrão de conexão/sessão): `dfl-plans` (`plans.mcp.devfellowship.com`).
