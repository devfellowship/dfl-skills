---
name: dfl
description: "DFL Code Standards — componentização, nomenclatura e estrutura de arquivos para qualquer projeto frontend DFL (dfl-diagrams, dfl-ventures, dfl-template-app, etc.). Use quando: criar/organizar componentes React, decidir onde colocar tipos/consts/utils/hooks, revisar código antes do push."
license: MIT
compatibility: Claude Code
metadata:
  purpose: Padrões de código consolidados das revisões do Tainan/Samuel
  version: "1.0.0"
---

# DFL Code Standards — Componentização, Nomenclatura e Estrutura

Skill de referência para qualquer projeto DFL (dfl-diagrams, dfl-ventures, dfl-template-app, etc.).
Consolidado das revisões do Tainan (Samuel) e do trabalho de componentização feito em produção.

---

## 1. Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente React | `kebab-case.tsx` | `diagram-name-field.tsx` |
| Hook | `use-kebab-case.ts` | `use-diagram-editor.ts` |
| Constante | `kebab-case.ts` dentro de `consts/` | `consts/type-label.ts` |
| Util (função pura) | `kebab-case.ts` dentro de `utils/` | `utils/time-ago.ts` |
| Tipo/interface | `kebab-case.ts` dentro de `types/` | `types/diagram.ts` |
| Service | `kebab-case.ts` dentro de `services/` | `services/diagrams.ts` |
| Teste | mesmo nome + `.test.ts` ao lado | `time-ago.test.ts` |

**Regra:** nunca PascalCase em nomes de arquivo. Sempre kebab-case.

---

## 2. Estrutura de Diretórios

```
src/
├── pages/               # Thin — apenas orquestram (máx. ~40 linhas)
├── components/
│   ├── pages/
│   │   └── <page-name>/      # Componentes decompostos da página
│   │       ├── consts/       # Constantes específicas da página
│   │       └── utils/        # Utils específicos da página (se existirem)
│   ├── <feature>/            # Feature components (ex: projects/, diagrams/)
│   │   ├── consts/           # Constantes da feature
│   │   └── utils/            # Utils da feature
│   ├── layout/               # AppLayout, Sidebar, Navbar
│   └── ui/                   # shadcn/ui — NÃO TOCAR
├── hooks/               # Hooks globais — use<Entidade>.ts
├── services/            # Acesso a dados — nunca chamar Supabase direto nos componentes
├── types/               # Interfaces e tipos por entidade de domínio
├── utils/               # Funções puras reutilizáveis globalmente
└── lib/                 # Wrappers de libs externas (supabase, mermaid, etc.)
```

**Regra:** sem `index.ts` barrel dentro de `consts/`, `utils/`, `hooks/`. Importar direto pelo caminho.

---

## 3. Um Arquivo, Uma Coisa

Cada arquivo contém **exatamente uma** das seguintes:
- Um componente React exportado
- Uma função util exportada
- Um bloco de constantes relacionadas
- Um hook

**Proibido:** dois componentes React no mesmo arquivo, função util dentro de componente, constante inline que vai ser reutilizada.

**Exemplos de decomposição correta (padrão Tainan):**

Antes — `node-palette.tsx` com tudo:
```
DiagramSidebar.tsx  (componente + constantes + utils + sub-componentes)
```

Depois — cada coisa no lugar certo:
```
sidebar/consts/flowchart-nodes.tsx   ← constantes de nós
sidebar/consts/erd-nodes.tsx
sidebar/consts/mode-tabs.tsx
sidebar/utils/nodes-for-mode.ts      ← função pura
sidebar/utils/tip-for-mode.ts
sidebar/tab-button.tsx               ← sub-componente
sidebar/node-item.tsx                ← sub-componente
DiagramSidebar.tsx                   ← só o orquestrador
```

---

## 4. Regra do Hook (>40 Linhas)

Se um componente tem **mais de ~40 linhas de lógica** (estado, efeitos, handlers, derivações), extrair para um hook.

```
// ❌ Errado — lógica no componente
function DiagramEditorCore() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  // ... 80 linhas de handlers, callbacks, efeitos
  return <ReactFlow ... />;
}

// ✅ Correto — lógica no hook
function DiagramEditorCore() {
  const { nodes, edges, onNodesChange, onSave } = useDiagramEditorCore(id);
  return <ReactFlow nodes={nodes} edges={edges} ... />;
}
```

Pages são os orquestradores mais thin: apenas `useState` de UI (modal aberto/fechado), derivações triviais, e JSX. Tudo mais vai pro hook.

---

## 5. Constantes — Dictionary, não Switch

Quando uma função retorna strings/configs por tipo, usar `Record<K, V>` em vez de `switch`.

```ts
// ❌ Não fazer
function typeLabel(type: DiagramType): string {
  switch (type) {
    case "erd": return "ERD";
    case "sequence": return "Sequence";
    default: return "Flowchart";
  }
}

// ✅ Fazer — em consts/type-label.ts
import type { DiagramType } from "@/types/diagram";

export const TYPE_LABEL: Record<DiagramType, string> = {
  flowchart: "Flowchart",
  erd: "ERD",
  sequence: "Sequence",
};
```

O mesmo vale para configs de ícone, cores, labels de status, etc. (`Record<K, { label, color, icon }>`)

---

## 6. Testes de Utils

Todo util em `src/utils/` deve ter um `.test.ts` ao lado. Padrão vitest:

```ts
// src/utils/time-ago.test.ts
import { describe, it, expect } from "vitest";
import { timeAgo } from "./time-ago";

describe("timeAgo", () => {
  it("returns 'just now' for sub-minute diff", () => {
    const iso = new Date(Date.now() - 30_000).toISOString();
    expect(timeAgo(iso)).toBe("just now");
  });

  it("returns minutes with 'm ago' suffix", () => {
    const iso = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(iso)).toBe("5m ago");
  });
});
```

Rodar testes dos arquivos afetados: `npx vitest run src/utils/<arquivo>.test.ts`

---

## 7. Componentes Compartilhados Dentro de uma Feature

Se dois ou mais componentes dentro de uma feature usam o mesmo sub-componente de UI, ele vai para o nível da feature — não para `components/ui/` (que é shadcn, não tocar).

```
// ✅ Padrão — compartilhado dentro de projects/
components/projects/
├── dfl-input.tsx          ← usado por CreateDiagramModal e CreateProjectModal
├── dfl-select.tsx
├── field-label.tsx
├── consts/
│   ├── diagram-types.ts
│   └── color-options.ts
├── CreateDiagramModal.tsx ← importa dfl-input, field-label, DIAGRAM_TYPES
└── CreateProjectModal.tsx ← importa dfl-input, dfl-select, field-label, COLOR_OPTIONS
```

---

## 8. Sem Mock em Componentes

Nenhum dado mockado, hardcoded ou estimado dentro de componentes de produção. Se existir, remover.

```tsx
// ❌ Remover imediatamente
<span>Model: gpt-4o-mini · 0.2€ estimated</span>

// ✅ Mostrar só o que vem de dados reais ou não mostrar nada
{model && <span>{model}</span>}
```

---

## 9. Services — sem Supabase direto nos componentes

Nunca importar `supabase` em componentes ou pages. O acesso a dados passa obrigatoriamente pelo service.

```
// ❌ Errado
import { supabase } from "@/lib/supabase";
const { data } = await supabase.from("diagrams").select();

// ✅ Correto
import { getDiagrams } from "@/services/diagrams";
const diagrams = await getDiagrams();
```

---

## 10. Branches

Formato obrigatório, inegociável:

```
feat/william-dfldiagrams-descricao-da-task-DFL-XXXXX
fix/william-dflventures-descricao-DFL-XXXXX
chore/william-dfldiagrams-descricao-DFL-XXXXX
```

Estrutura: `<tipo>/<autor>-<projeto>-<descricao-kebab>-<ticket>`

Sempre criar a branch a partir da `main` atualizada — nunca em cima de outra feature branch aberta.

---

## 11. `as const` em Arrays de Constantes — Cuidado com Estado React

Usar `as const` em arrays de opções (cores, tipos, etc.) torna cada elemento um tipo literal. Se esse array inicializa um `useState`, o TypeScript infere o estado como o tipo do **primeiro elemento** — e `setState` passa a rejeitar todos os outros.

```ts
// ❌ Causa erro de CI — estado inferido como "red" literal
const COLORS = ["red", "blue", "green"] as const;
const [color, setColor] = useState(COLORS[0]); // tipo: "red"
setColor("blue"); // ❌ Argument of type '"blue"' is not assignable to '"red"'

// ✅ Sem as const — estado inferido como string
const COLORS = ["red", "blue", "green"];
const [color, setColor] = useState(COLORS[0]); // tipo: string ✅

// ✅ Alternativa — tipar o estado explicitamente
type Color = typeof COLORS[number]; // "red" | "blue" | "green"
const [color, setColor] = useState<Color>(COLORS[0]); // ✅
```

**Regra:** arrays de opções usados em `useState` → sem `as const`, ou tipar o estado como `typeof ARRAY[number]`.

---

## 12. Checklist Antes de Push (obrigatório)

```bash
npx tsc --noEmit          # erros de tipo
npx eslint --fix src/     # lint + auto-fix
npx vitest run            # testes (se houver arquivos .test.ts afetados)
```

Os três têm que passar com exit code 0. TypeScript limpo não garante lint limpo — são separados e ambos bloqueiam o CI.

**Erros comuns de lint:**
- `ref.current = value` durante render → envolver em `useEffect`
- `useEffect` depois de early return → mover para antes do return
- Hook chamado condicionalmente → refatorar

---

## Resumo rápido (mental checklist ao criar código)

1. Nome do arquivo em kebab-case?
2. Um componente/const/util por arquivo?
3. Constante que vai ser reutilizada → `consts/`?
4. Função pura reutilizável → `utils/` + `.test.ts`?
5. Componente com >40 linhas de lógica → extrair hook?
6. Switch de label/config → converter para `Record<K,V>`?
7. Acesso a dados → service, não direto?
8. Sem mock hardcoded no JSX?
9. Arrays com `as const` usados em `useState`? → remover `as const` ou tipar o estado
10. tsc + eslint passando?
