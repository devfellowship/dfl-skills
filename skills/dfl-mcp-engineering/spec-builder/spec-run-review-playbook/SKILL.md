---
name: spec-run-review-playbook
description: "Como REVISAR um spec run do AI Spec Builder de um jeito que o agente consiga executar — comentar por item com instrução acionável, dar número explícito quando você tem um, pedir validação antes de criar em lote, e responder com regra em vez de caso. Use quando: você é quem decide escopo e preço de um run, vai abrir uma rodada de comentários, ou o agente devolveu um batch e você precisa julgar o que voltou."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash Grep Glob
metadata:
  purpose: O lado humano de uma rodada de revisão de spec run — como comentar para o agente conseguir agir
  version: "1.0.0"
---

# Spec Run — playbook de quem revisa

Esta skill é para **quem revisa**, não para quem executa. Ela existe porque a
qualidade do que volta de uma rodada é decidida quase inteiramente na hora de
comentar, e não depois.

O texto do seu comentário é **copiado literalmente** para o prompt de hand-off.
Comentário vago chega vago. Não existe um passo no meio que interprete você.

---

## 1. Comente por item, com instrução acionável

Comentário de run inteiro (`item_id` omitido) só serve pra recado geral. Tudo que
é sobre **uma linha** vai no item — é o `short_ref` que faz o hand-off virar um
prompt sem ambiguidade.

| ❌ vago | ✅ acionável |
|---|---|
| "isso tá estranho" | "quebra em tasks mais objetivas" |
| "acho caro" | "isso vale 10 pontos" |
| "falta coisa aqui" | "falta a tela; cria um item de front-end pra isso" |
| "vê se dá pra juntar" | "SR-A e SR-B pode mesclar, é uma tarefa só, e 5 pts tá ok" |

A diferença não é educação, é **executabilidade**. "Está estranho" obriga o agente
a adivinhar qual dos cinco eixos você quis dizer, e ele vai adivinhar errado em
algum deles.

---

## 2. Dê o número quando você tem um

Se você sabe que aquilo vale 10 pontos, escreva **10**. Um número que você deu
vira ponto `human` e **nenhum gerador sobrescreve depois** — nem numa
re-geração completa. É a forma mais barata de travar uma decisão de preço.

Se você não tem número, não invente: diga o critério ("um CRUD são 5 pontos") e
deixe o agente aplicar. O critério vale mais que o número.

---

## 3. Peça validação antes de criar, quando o batch é grande

Quando um comentário seu vai gerar **muitos itens novos**, peça a lista primeiro:

> "Calma, vamos validar aqui primeiro. Lista aí o que a gente criaria de novo."

Uma rodada de listagem custa minutos. Recriar doze itens mal escopados custa a
rodada inteira — e pior, alguns já entraram em pacote e em total.

Nessa rodada de validação, o que você quer ver:

- quantos itens, com nome e pontos;
- em que pacote cada um cai;
- o total antes e depois;
- **e onde o agente discorda de você**, com o motivo.

O último item é o mais valioso. Se o agente concorda com tudo, ou você acertou
tudo, ou ele não pensou.

---

## 4. Espere aritmética de volta, não prosa

O relatório certo de uma rodada é:

```
SR-X  5 → 3   (perdeu 2 critérios pra itens novos)
SR-Y  8 → 5   (agregação saiu pro banco)
novos +31
Pacote 1  337 → 360
Pacote 2  447 → 475
```

Se voltou um parágrafo dizendo que "foi tudo aplicado com sucesso", você não tem
como conferir nada. Peça os números.

---

## 5. Responda com regra, não com caso

| caso (não escala) | regra (escala) |
|---|---|
| "essa tela são 5 pontos" | "um CRUD são 5 pontos" |
| "essa telinha de integração são 2" | "tela de conexão são 2, o back-end faz a mágica" |
| "esse item entra no MVP" | "a tela entra no pacote do driver dela" |

Uma regra atravessa o run inteiro e sobrevive à próxima rodada. Um caso morre
quando o item muda de nome.

---

## 6. Número que o agente propôs não é número seu

Todo ponto que o agente estimou e você não confirmou deve chegar marcado como
**estimativa do agente** (`points_needs_review = true`). Isso não é defeito, é
honestidade — e é o que te permite fazer uma passada de revisão de preço depois
sem reler o run inteiro.

Se o agente limpa essa marca sozinho, ele está afirmando que **você concordou**.
Cobre isso.

---

## 7. O ciclo completo

```
você comenta N itens  →  hand-off (uma vez)  →  agente aplica  →  aritmética de volta
        ↑                                                                  |
        └──────────────────  você julga e comenta de novo  ←───────────────┘
```

Comentar **não** avança nada sozinho. O hand-off é o cursor: ele marca o batch
como enviado e é o que impede o mesmo comentário de ser reprocessado na rodada
seguinte. Comente à vontade, faça hand-off **uma vez** por rodada.

---

## Referências

- [`spec-run-comment-round`](../spec-run-comment-round/SKILL.md) — o outro lado: como o agente aplica o que você comentou
- [`spec-run-pricing-discipline`](../spec-run-pricing-discipline/SKILL.md) — o que acontece com os pontos quando escopo se move
- [`docs.devfellowship.com/tools/spec-builder`](https://docs.devfellowship.com/tools/spec-builder/) — schema das tools
