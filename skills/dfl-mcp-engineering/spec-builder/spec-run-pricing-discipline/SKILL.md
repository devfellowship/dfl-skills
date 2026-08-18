---
name: spec-run-pricing-discipline
description: "Disciplina de pontos num spec run — escala Fibonacci, proveniência ai vs human, o gate repoint, a regra de re-pontuar o pai quando escopo sai dele, e a regra de negócio de que contagem de capacidade e esforço de build são eixos diferentes. Use quando: mover escopo entre itens, estimar item novo, revisar preço de um run, ou escrever a porcentagem de escopo entregue numa proposta."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash Grep Glob
metadata:
  purpose: Manter os pontos de um spec run honestos quando o escopo se move entre itens
  version: "1.0.0"
---

# Spec Run — disciplina de pontuação

Um spec run é uma **proposta comercial em forma de tabela**. Os pontos viram
preço. Toda regra aqui existe para impedir que um número fique errado sem
ninguém perceber.

---

## 1. Escala

Fibonacci: **1 · 2 · 3 · 5 · 8 · 13 · 21**.

- **1** — menos de uma hora.
- **21** — um épico que deveria ser decomposto. Um 21 que sobrevive à revisão é
  quase sempre um item que ninguém entendeu direito.

Não existe 4 nem 6. Se você está tentando escrever 4, a pergunta certa é se o
item perdeu ou ganhou escopo — e não qual número intermediário inventar.

---

## 2. Proveniência: `ai` até um humano decidir, `human` para sempre

| campo | significado |
|---|---|
| `points_set_by: "ai"` | número gerado, ninguém confirmou |
| `points_set_by: "human"` | uma pessoa decidiu; **nenhum gerador sobrescreve** |
| `points_needs_review: true` | número que existe mas espera confirmação humana |
| `repoint: [ids]` | opt-in **explícito, por item**, que autoriza mexer num ponto `human` |

`repoint` **não limpa** a marca `human`. O item continua sendo do humano na
rodada seguinte, e o opt-in não autoriza nada além dos ids listados.

> `points_needs_review = true` **não é defeito, é sinal honesto.** Deixe ligado em
> todo número que o agente estimou e o humano ainda não confirmou. Limpar essa
> marca é uma afirmação de que uma pessoa concordou — se ninguém concordou, é
> mentira registrada no banco.

---

## 3. 🚨 A REGRA PRINCIPAL — escopo saiu, ponto desce

**Quando trabalho sai de um item para um item novo, re-pontue o pai PARA BAIXO na
mesma rodada.**

Se você não faz isso, o mesmo trabalho fica precificado duas vezes: uma no pai
que manteve o número antigo, outra no filho que nasceu. O orçamento infla e
**ninguém vê**, porque cada item olhado isoladamente parece certo.

Forma concreta, com números neutros:

```
antes:   SR-A  5 pts, 5 critérios de aceite

durante: dois critérios saem para itens novos
         (a tela de revisão e a medição de custo)

depois:  SR-A  3 pts, 3 critérios   ← re-pontuado
         novo  5 pts                ← a tela de revisão
         novo  3 pts                ← a medição de custo
```

O total sobe (5 → 11) e isso está **certo**: o trabalho sempre foi 11, só estava
escondido dentro de um 5. O que estaria errado é o pai continuar valendo 5.

Lembre que `split` **não** mexe no pai — então essa correção é sempre uma segunda
chamada (`update_spec_run_items`). Ver
[`spec-run-comment-round`](../spec-run-comment-round/SKILL.md) §4.

### A regra espelhada

**Item que ABSORVE escopo sobe.** Um item que passa a implementar uma costura de
driver, ou que ganha uma segunda responsabilidade, vale mais do que valia — e o
`commit_message` precisa dizer isso, com a aritmética:

> "SR-A 8 → 10, SR-B 5 → 6: os três passam a implementar a costura de driver."

---

## 4. Quando NÃO re-pontuar

- **O mecanismo ficou.** Se o item perdeu um gatilho ou uma delegação mas manteve
  o mecanismo que os outros reusam, ele mantém o ponto. Diga isso na descrição.
- **O humano pediu para revisar depois.** Aí você registra o número como pendente
  (`points_needs_review`) e reporta, em vez de decidir sozinho.
- **Você não tem base.** Um chute com marca de humano é pior que um chute com
  marca de IA, porque trava o gerador em cima de um número inventado.

---

## 5. 🧾 A regra de negócio: contagem de capacidade ≠ esforço de build

Um run costuma carregar **dois** números para o mesmo escopo:

| número | o que mede | responde |
|---|---|---|
| **% de capacidades** | quantos requisitos do cliente são entregues | conversa de **escopo** |
| **total de pontos** | tamanho da obra | conversa de **preço** |

Eles **se movem de forma independente**, e é fácil ser pego por isso.

Uma capacidade conta como entregue **no momento em que ela existe**. Um schema,
uma API e nenhuma tela já contam. Aí, quando alguém audita e descobre que faltam
as telas, o total de pontos sobe bastante e a porcentagem **não se move um
milímetro** — porque nenhuma capacidade nova nasceu, só apareceu o custo real de
uma que já estava contada.

**Analogia:** dez cômodos, todos com parede, nenhum com piso nem pintura.
"10 de 10 cômodos" está certo. "Obra 60% pronta" também está certo. São medidas
diferentes da mesma casa.

### O que fazer com isso

> **Nunca coloque a porcentagem ao lado do preço.**

Lado a lado, o leitor conclui "75% do escopo = 75% do custo", e isso não é
verdade em nenhum run. Separe:

- a **porcentagem** entra na seção de escopo — o que fica de fora;
- os **pontos** entram na seção de preço.

E quando uma auditoria adicionar trabalho sem adicionar capacidade, **diga isso
explicitamente** em vez de deixar o leitor reconciliar sozinho: a contagem não
mudou, o preço mudou, e o motivo é que a capacidade já estava contada antes de
ter tela.

---

## 6. Checklist antes de fechar uma rodada de preço

- [ ] Todo pai que perdeu critério foi re-pontuado para baixo
- [ ] Todo item que absorveu escopo foi re-pontuado para cima, com o motivo no commit
- [ ] Todo número estimado pelo agente está com `points_needs_review = true`
- [ ] Nenhum ponto `human` foi alterado sem `repoint` explícito
- [ ] O total por pacote foi relido do servidor, não calculado de cabeça
- [ ] A porcentagem de capacidade não está encostada no preço em nenhum documento

---

## Referências

- [`spec-run-comment-round`](../spec-run-comment-round/SKILL.md) — por que re-pontuar é sempre uma segunda chamada
- [`spec-run-coverage-audit`](../spec-run-coverage-audit/SKILL.md) — como achar o trabalho que ninguém cobrou
- [`spec-run-scope-packages`](../spec-run-scope-packages/SKILL.md) — totais por pacote
