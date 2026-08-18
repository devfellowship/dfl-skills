---
name: spec-run-comment-round
description: "Como APLICAR um batch de comentários num spec run sem corromper o run — os dois eixos de versão, a regra de cobertura total do regenerate_spec_run, a semântica real de split/merge/remove, e o padrão de DUAS CHAMADAS que toda rodada com split precisa. Use quando: recebeu um hand-off de comentários, vai dividir/juntar/criar itens, ou precisa re-pontuar um item que acabou de sofrer split."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash Grep Glob
metadata:
  purpose: Aplicar uma rodada de comentários num spec run com as operações certas, na ordem certa
  version: "1.0.0"
---

# Spec Run — aplicando uma rodada de comentários

Esta skill é o lado do **agente**. O lado de quem revisa está em
[`spec-run-review-playbook`](../spec-run-review-playbook/SKILL.md).

---

## 1. Dois eixos de versão, e eles não se tocam

| eixo | o que conta | quem move |
|---|---|---|
| **versão do run** (`current_version`) | mudança de **conteúdo** | `update_spec_run_items`, `regenerate_spec_run` |
| **versão de comentário** (`comment_version`) | batches **já enviados** | só `handoff_spec_run_comments` |

Consequências que importam:

- **Postar comentário não bumpa nada.** Um comentário é um pedido; a edição que o
  satisfaz é a mudança.
- **`get_spec_run` lê o batch aberto sem efeito colateral.** É a leitura certa
  quando você só quer ver o que está pendente.
- **`handoff_spec_run_comments` sem `dry_run` ENVIA e bumpa.** Se você só quer
  ver o prompt, use `dry_run: true`.
- Uma edição de conteúdo **não** mexe no cursor de comentário, e vice-versa.

---

## 2. `regenerate_spec_run` com `operations` exige cobertura TOTAL

Todo item vivo precisa ser nomeado por **exatamente uma** operação. Item que
sobrou fora da lista derruba a chamada inteira com `unreferenced_item`.

O motivo não é burocracia: uma lista parcial é uma lista nova disfarçada, e
aplicar lista nova sobre linhas existentes só consegue adivinhar identidade ou
destruí-la. Use `keep` para os que não mudam.

```
ops = [keep(id) para todo item que não muda]
    + [split/merge/update/add/remove para os que mudam]
```

**Tudo ou nada.** Qualquer rejeição na lista e nada é escrito, nenhuma versão é
cortada. A resposta nomeia cada rejeição — conserte e reenvie.

---

## 3. A semântica real de cada operação

### `split` — o pai CONTINUA

`split(item_id, new_items)` **não toca** em `item_id`. Mesma linha, mesmo id,
mesmo `short_ref`, **mesmos pontos**, `removed_at` continua nulo. Só os
`new_items` nascem.

Cada filho nasce com `lineage_kind = "split_from"`, `points_set_by = "ai"` e
`points_needs_review = true`.

> **Os pontos do pai NUNCA são divididos entre os filhos.** Se o escopo saiu do
> pai, você tem que re-pontuar o pai **você mesmo** — ver §5 e a skill de pricing.

Não liste a parte que continua dentro de `new_items`. Ela já é o `item_id`.

### `merge` — um sobrevive, os outros são absorvidos

`merge(into_id, from_ids, fields?)` mantém `into_id` (opcionalmente reescrito) e
faz soft-remove dos `from_ids`, cada um marcado `lineage_kind = "merged_into"`.

Se **qualquer** item absorvido tinha ponto `human`, o sobrevivente é marcado
`points_needs_review = true` em vez de absorver o valor calado — uma estimativa
mesclada é uma estimativa nova.

### `remove` — sempre soft

Nunca há delete físico. Uma versão antiga fixada continua resolvendo, e um
`short_ref` que já foi colado num orçamento não vira link quebrado. `reason` é
obrigatório porque é a única operação cujo motivo não dá pra reconstruir do diff.

### `add` — sem linhagem

Item novo que **não** nasce de outro. Se ele nasce de um existente, use `split`,
senão o diff conta a história falsa de um item morrendo e outro aparecendo.

---

## 4. 🚨 O PADRÃO DE DUAS CHAMADAS

**Este é o erro operacional mais comum.**

Como um item só pode ser nomeado por **uma** operação, você **não consegue**
dar `split` num item e re-pontuar ele na mesma chamada. Não existe
`split + update` do mesmo id.

Então uma rodada com split é sempre **duas chamadas**:

```
1)  regenerate_spec_run   → estrutura   (split / merge / add / remove / keep)
2)  update_spec_run_items → conteúdo    (pontos, títulos, critérios dos que continuaram)
```

Duas versões, cada uma com seu `commit_message`. Isso é bom, não ruim: a primeira
versão conta o que mudou de forma, a segunda conta o que mudou de preço.

Tentar fazer numa chamada só termina em `unreferenced_item` ou, pior, num pai que
manteve os pontos antigos com metade do escopo — que é um erro **silencioso**.

---

## 5. `update_spec_run_items` IGNORA CAMPO DESCONHECIDO EM SILÊNCIO

Nome de campo errado **não dá erro**. A chamada responde sucesso com
`applied: 0` e uma mensagem do tipo "nenhuma edição carregava campo para mudar".

> **Nunca confie no `applied: N`. Leia o run de volta e afirme o valor.**

Isso vale para toda a rodada, não só para pontos. A verificação certa no fim de
uma rodada é:

- reler o run (`get_spec_run`);
- conferir contagem de itens e `points_total`;
- conferir os campos exatos que você escreveu, item a item;
- conferir que `unassigned_items` está vazio (ver a skill de pacotes).

---

## 6. Ponto que você escreve vira `human` para sempre

Setar `estimated_points` via `update_spec_run_items`:

- marca `points_set_by = "human"` **permanentemente**;
- limpa `points_needs_review`;
- registra o campo em `human_edited_fields`.

Depois disso, `regenerate_spec_run` **recusa** mexer naquele número sem o item
estar listado em `repoint`. Isso é proteção, não obstáculo — mas significa que
setar ponto é uma afirmação forte. Só faça quando for decisão, não quando for
palpite (para palpite, deixe a marca de review).

---

## 7. Escreva o PORQUÊ na descrição, não só no commit

O `commit_message` vive no histórico de versões. A **descrição do item** vive onde
a pessoa vai olhar daqui a seis semanas.

Toda vez que um item nasce, muda de escopo ou é mesclado, a descrição precisa
dizer de onde ele veio, em frase estável:

> "Nasceu do split de SR-X no batch N."
> "SR-Y foi mesclado aqui no batch N: uma passada só produz as duas estruturas."
> "Re-pontuado 5 → 3: dois critérios saíram para itens novos."

Sem isso, seis semanas depois o item parece arbitrário e alguém vai
"consertar" uma decisão que foi deliberada.

---

## 8. Checklist de fim de rodada

- [ ] Estrutura aplicada com cobertura total, sem `unreferenced_item`
- [ ] Pais que perderam escopo foram re-pontuados **para baixo** na 2ª chamada
- [ ] Itens novos atribuídos a pacote, e `unassigned_items` vazio
- [ ] Run relido e valores conferidos campo a campo (§5)
- [ ] Cada item novo/alterado tem o porquê na descrição (§7)
- [ ] Aritmética reportada: o que mudou, de quanto para quanto, totais por pacote

---

## Referências

- [`spec-run-pricing-discipline`](../spec-run-pricing-discipline/SKILL.md) — a regra de re-pontuar
- [`spec-run-scope-packages`](../spec-run-scope-packages/SKILL.md) — atribuição de item novo a pacote
- [`docs.devfellowship.com/tools/spec-builder`](https://docs.devfellowship.com/tools/spec-builder/) — schema das tools
