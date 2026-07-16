---
name: dfl-plans
description: "Uso completo do DFL Plans MCP — conexão, listagem, leitura, criação de planos e geração de questions relevantes para execução. Use quando: criar um plano técnico, listar planos recentes, gerar questions de execução para um projeto DFL, ou publicar ADRs."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash PowerShell Grep Glob
metadata:
  purpose: Operação completa do DFL Plans via MCP HTTP
  version: "1.0.0"
---

# DFL Plans — Skill de Uso

Skill de referência para operar o `plans.mcp.devfellowship.com` diretamente via PowerShell,
cobrindo conexão, ferramentas disponíveis, criação de planos e geração de questions de execução.

---

## 1. Credenciais e Token

As credenciais ficam em `~/.dfl-mcp/credentials.json`:

```powershell
$creds = Get-Content "$env:USERPROFILE\.dfl-mcp\credentials.json" | ConvertFrom-Json
$token = $creds.access_token
```

Se o token estiver expirado (`expires_at` < agora):

```bash
npx @devfellowship/dfl-auth refresh
```

---

## 2. Iniciar Sessão MCP (obrigatório antes de qualquer chamada)

O MCP usa Streamable HTTP — cada sessão precisa de um `Mcp-Session-Id`. Sempre inicializar primeiro:

```powershell
$token = (Get-Content "$env:USERPROFILE\.dfl-mcp\credentials.json" | ConvertFrom-Json).access_token

$initBody = @{
    jsonrpc = "2.0"; id = 1; method = "initialize"
    params  = @{
        protocolVersion = "2024-11-05"
        capabilities    = @{}
        clientInfo      = @{ name = "claude-code"; version = "1.0" }
    }
} | ConvertTo-Json -Depth 5

$bytes = [System.Text.Encoding]::UTF8.GetBytes($initBody)
$req   = [System.Net.HttpWebRequest]::Create("https://plans.mcp.devfellowship.com/mcp")
$req.Method = "POST"; $req.ContentType = "application/json"
$req.Accept = "application/json, text/event-stream"
$req.Headers.Add("Authorization", "Bearer $token")
$req.ContentLength = $bytes.Length
$s = $req.GetRequestStream(); $s.Write($bytes, 0, $bytes.Length); $s.Close()

$resp      = $req.GetResponse()
$sessionId = $resp.Headers["Mcp-Session-Id"]   # guardar para todas as chamadas seguintes
$reader    = New-Object System.IO.StreamReader($resp.GetResponseStream())
$reader.ReadToEnd() | Out-Null; $reader.Close()
```

**Importante:** `$sessionId` é necessário em TODAS as chamadas seguintes como header `Mcp-Session-Id`.

---

## 3. Função auxiliar de chamada (reutilizar em toda sessão)

```powershell
function Invoke-Plans($id, $method, $arguments) {
    $payload = [ordered]@{
        jsonrpc = "2.0"; id = $id; method = "tools/call"
        params  = [ordered]@{ name = $method; arguments = $arguments }
    }
    $jsonStr = $payload | ConvertTo-Json -Depth 10 -Compress
    $bytes   = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)

    $req = [System.Net.HttpWebRequest]::Create("https://plans.mcp.devfellowship.com/mcp")
    $req.Method = "POST"; $req.ContentType = "application/json"
    $req.Accept = "application/json, text/event-stream"
    $req.Headers.Add("Authorization", "Bearer $token")
    $req.Headers.Add("Mcp-Session-Id", $sessionId)
    $req.ContentLength = $bytes.Length
    $s = $req.GetRequestStream(); $s.Write($bytes, 0, $bytes.Length); $s.Close()

    $resp   = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $result = $reader.ReadToEnd(); $reader.Close()

    $dataLine = ($result -split "`n" | Where-Object { $_ -match "^data:" }) | Select-Object -First 1
    return ($dataLine -replace "^data: ", "" | ConvertFrom-Json).result.content[0].text
}
```

---

## 3.1 `create_plan`/`publish_plan` com corpo grande — usar `curl.exe`, não `Invoke-Plans`/`HttpWebRequest`

**Confirmado em 2026-07-08 (com Tainan/Lainar validando server-side que o serviço está saudável):** `HttpWebRequest` do .NET/PowerShell trava indefinidamente em chamadas POST de `create_plan`/`publish_plan`, mesmo com corpo pequeno — não é timeout do servidor, é o stack .NET engasgando no handshake da requisição (suspeita: `Expect: 100-continue`). `list_plans`/`read_plan`/`patch_status` (corpo pequeno, mas isso não é o fator — o padrão exato ainda não isolado) continuam funcionando via `Invoke-Plans` normalmente; o problema apareceu especificamente em `create_plan` com corpo de plano completo.

**Solução:** montar o payload em arquivo via Node.js (evita BOM — `Out-File -Encoding utf8` do PowerShell insere BOM que corrompe headers `Authorization`/`Mcp-Session-Id` se lidos de arquivo) e enviar via `curl.exe`:

```bash
# 1. Salvar token/session SEM BOM (Node.js, não Out-File)
node -e "
const fs = require('fs');
fs.writeFileSync('/tmp/token.txt', '$token');
fs.writeFileSync('/tmp/session.txt', '$sessionId');
"

# 2. Montar o payload JSON-RPC em arquivo
node -e "
const fs = require('fs');
const body = fs.readFileSync('/caminho/para/plano.md', 'utf-8');
const payload = {
  jsonrpc: '2.0', id: 1, method: 'tools/call',
  params: { name: 'create_plan', arguments: {
    slug: 'YYYYMMDD-descricao-kebab', title: 'Título', body,
    source: 'claude-main', status: 'draft', tags: ['tag1','tag2'], visibility: 'shared'
  }}
};
fs.writeFileSync('/tmp/payload.json', JSON.stringify(payload));
"

# 3. Enviar via curl
TOKEN=$(cat /tmp/token.txt)
SESSION=$(cat /tmp/session.txt)
curl.exe -sS -m 40 -X POST "https://plans.mcp.devfellowship.com/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Mcp-Session-Id: $SESSION" \
  --data-binary "@/tmp/payload.json" \
  -w "HTTP_STATUS:%{http_code} TIME:%{time_total}s\n"
```

Isso resolveu de primeira (~5.6s pra um corpo de ~16KB) depois de duas sessões inteiras travando via PowerShell. Usar esse caminho direto para qualquer `create_plan`/`publish_plan` — não vale a pena tentar `HttpWebRequest` primeiro.

**Sessão expira rápido — reinicializar logo antes de cada lote de chamadas de escrita.** Uma sessão usada com sucesso em `create_plan` retornou `Invalid or missing session` poucos minutos depois ao tentar `post_question` (tempo gasto montando os payloads em Node.js entre as duas chamadas). Não reaproveitar `Mcp-Session-Id` antigo entre passos separados por mais de ~1-2 minutos — inicializar de novo via curl (`initialize`, capturar `Mcp-Session-Id` do header de resposta com `curl -D`) imediatamente antes do lote de `post_question`/`create_plan`/`publish_plan`.

---

## 4. Ferramentas disponíveis

### 4.1 Listar planos

```powershell
Invoke-Plans 2 "list_plans" @{}

# Com filtros (status, tag, source)
Invoke-Plans 2 "list_plans" @{ status = "draft,executing"; tag = "pipeline" }
```

Campos retornados: `slug`, `title`, `status`, `created_at`, `updated_at`, `adr_count`, `pending_questions_count`.

### 4.2 Buscar planos

```powershell
Invoke-Plans 3 "search_plans" @{ query = "pipeline esteira dfl"; limit = 10 }
```

### 4.3 Ler plano completo

```powershell
Invoke-Plans 4 "read_plan" @{ slug = "20260624-pipeline-esteira-tecnica-dfl-learn" }

# Só metadados (mais rápido)
Invoke-Plans 4 "read_plan" @{ slug = "meu-slug"; metadata_only = $true }
```

### 4.4 Criar plano

```powershell
Invoke-Plans 5 "create_plan" @{
    slug       = "20260624-meu-plano"         # convenção: YYYYMMDD-descricao-kebab
    title      = "Título do Plano"
    body       = $planBody                    # markdown string
    source     = "claude-main"
    status     = "draft"                      # draft | fired | executing | done | archived
    tags       = @("tag1", "tag2")
    visibility = "shared"                     # shared | personal
}
```

### 4.5 Publicar nova versão (atualizar corpo)

```powershell
Invoke-Plans 6 "publish_plan" @{
    slug   = "meu-slug"
    title  = "Título atualizado"
    body   = $novoConteudo
    status = "executing"
}
```

### 4.6 Atualizar status

```powershell
# Ciclo: draft → fired → executing → done (ou archived)
Invoke-Plans 7 "patch_status" @{ slug = "meu-slug"; status = "executing" }
```

> **Atenção:** transição para `fired`/`executing` é bloqueada se houver questions com `blocks_execution = true` ainda abertas.

---

## 5. Questions — Criação e Gestão

Questions são decisões pendentes que precisam ser respondidas antes (ou durante) a execução do plano.

### 5.1 Postar question

```powershell
Invoke-Plans 10 "post_question" @{
    slug             = "meu-slug"
    question_text    = "Como tratar X?"
    context          = "Contexto técnico relevante..."
    author_reasoning = "Por que esta questão importa e o que ela desbloqueia."
    blocks_execution = $true        # $true = gate de fired/executing
    recommended_option_letter = "A"
    options = @(
        [ordered]@{ letter="A"; label="Opção A"; description="Descrição detalhada da opção A." }
        [ordered]@{ letter="B"; label="Opção B"; description="Descrição detalhada da opção B." }
        [ordered]@{ letter="C"; label="Opção C"; description="Descrição detalhada da opção C." }
    )
}
```

### 5.2 Listar questions de um plano

```powershell
Invoke-Plans 11 "list_questions" @{ slug = "meu-slug" }
```

### 5.3 Responder uma question

```powershell
# question_id vem do list_questions (UUID)
Invoke-Plans 12 "answer_question" @{
    slug                    = "meu-slug"
    question_id             = "uuid-da-question"
    selected_option_letters = @("A")
    freeform_notes          = "Observação adicional opcional."
}
```

### 5.4 Retirar question obsoleta

```powershell
Invoke-Plans 13 "withdraw_question" @{
    slug        = "meu-slug"
    question_id = "uuid-da-question"
}
```

### 5.5 Inbox global de questions abertas

```powershell
# Todas as questions abertas nos planos que você pode ler
Invoke-Plans 14 "list_global_questions" @{}

# Só as que bloqueiam execução
Invoke-Plans 14 "list_global_questions" @{ blocking = $true }
```

---

## 6. Convenções de Slug e Status

| Campo | Convenção |
|-------|-----------|
| `slug` | `YYYYMMDD-descricao-kebab` (ex: `20260624-pipeline-esteira-dfl`) |
| `source` | sempre `"claude-main"` quando criado pelo Claude Code |
| `visibility` | `"shared"` por padrão; `"personal"` só para rascunhos privados |
| `status` inicial | sempre `"draft"` — o Tainan move para `fired`/`executing` |

---

## 7. Estrutura de corpo de plano (boas práticas)

Um plano bem estruturado facilita a geração de questions e a execução do projeto.

```markdown
# Título do Plano

## Visão Geral
O que é, por que existe, qual o impacto esperado.
**Stack / contexto técnico relevante.**
**Estimativa:** Xh · R$ Y · N semanas

---

## Estado Atual
O que já existe, o que está quebrado, o que está parcial.

---

## Arquitetura / Decisões técnicas
Tabela ou descrição das decisões de stack/abordagem.

---

## Escopo — tasks por módulo/mini-app
| Task | Detalhamento | Pts | Status |
Para cada módulo: contexto + tabela de tasks com estimativa.

---

## Regras de Negócio / Restrições
Constraints do schema, RLS, campos obrigatórios, etc.

---

## Sequência de Execução
Fases em ordem, com dependências explícitas e desbloqueadores.

---

## Riscos
Lista numerada de riscos técnicos com impacto e mitigação.

---

## Fora do Escopo
O que NÃO faz parte desta fase.
```

---

## 8. Como gerar questions relevantes para execução

Antes de criar questions, analisar o plano procurando:

| Categoria | Pergunta-gatilho | `blocks_execution` |
|-----------|-----------------|:------------------:|
| **Desbloqueador técnico** | "Esta premissa foi validada?" (RLS, auth, integração externa) | `true` |
| **Ambiguidade de comportamento** | "O que acontece quando X é nulo / ausente / duplicado?" | `true` se gate de fluxo |
| **Decisão de arquitetura** | "Abordagem A vs B — qual o critério?" | `false` |
| **Dependência humana** | "Quem valida / aprova / fornece X?" (Arthur, Tainan, cliente) | `false` |
| **Escopo indefinido** | "Onde termina esta task? Qual o critério de done?" | `false` |
| **Ordem de execução** | "Esta frente pode ser paralela ou depende de Y?" | `false` |

**Regras para questions de qualidade:**

1. `question_text` — pergunta fechada e específica, não genérica
2. `context` — descrever o estado atual do sistema que torna a questão relevante
3. `author_reasoning` — explicar o que esta questão desbloqueia ou qual risco ela mitiga
4. `options` — mínimo 2, máximo 4; cada opção com consequência clara
5. `recommended_option_letter` — sempre recomendar quando houver uma opção tecnicamente superior
6. `blocks_execution = true` — somente quando a resposta errada invalida toda a abordagem

**Número ideal de questions por plano:**
- 1–2 bloqueadoras (`blocks_execution: true`) — os gates reais
- 3–5 não-bloqueadoras — decisões de design e dependências humanas
- Evitar mais de 7 questions por plano — dilui o foco

---

## 9. Fluxo completo (passo a passo)

```
1. Ler o documento fonte (PDF, MD, conversa)
2. Iniciar sessão MCP (seção 2)
3. Buscar planos existentes sobre o tema (search_plans) — evitar duplicatas
4. Criar o plano com body bem estruturado (seção 7)
5. Gerar questions relevantes (seção 8) — bloqueadoras primeiro
6. Confirmar com o usuário antes de patch_status para fired/executing
```

---

## 10. Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `Invalid or missing session` | Não inicializou sessão ou sessão expirou | Rodar bloco de inicialização novamente |
| `401 Unauthorized` | Token expirado | `npx @devfellowship/dfl-auth refresh` |
| `403 Forbidden` | Token válido mas sem permissão RLS | Verificar IAM do usuário no dfl-learn |
| `Request body size did not match Content-Length` | Usar `Invoke-WebRequest` em vez de `HttpWebRequest` | Sempre usar `HttpWebRequest` com `ContentLength` explícito |
| `409 Conflict` ao patch_status | Questions bloqueadoras ainda abertas | Responder ou retirar (`withdraw`) as questions blocking |
| `create_plan`/`publish_plan` trava sem erro nem retorno | `HttpWebRequest` do .NET engasga no handshake POST (servidor está saudável) | Usar `curl.exe` — ver seção 3.1 |
| `401` só depois de trocar pra curl (mesmo token válido) | BOM no arquivo de token/session salvo via `Out-File -Encoding utf8` | Salvar token/session via Node.js (`fs.writeFileSync`), nunca `Out-File` |
