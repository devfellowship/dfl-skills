---
name: spec-run-item-taxonomy
description: "Taxonomia de tags de item num spec run — UMA tag de camada por item, de um vocabulário fechado (front-end, back-end, db, ai, infra, qa, docs, spec), para que a coluna some. Cobre por que tag livre não serve, por que a tag precisa de eixo diferente do stage, e o que uma tag de camada NÃO mede. Use quando: precisar responder quanto do orçamento é UI, banco ou IA; ou quando as tags do run viraram palavra-chave solta."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash Grep Glob
metadata:
  purpose: Marcar itens de um spec run com uma taxonomia que pode ser somada
  version: "1.0.0"
---

# Spec Run — taxonomia de itens

---

## 1. A regra: UMA tag de camada por item

Vocabulário fechado:

| tag | o que é |
|---|---|
| `front-end` | a tela e a interação dela |
| `back-end` | serviço, API, integração, job |
| `db` | schema, migration, índice, view, busca full-text |
| `ai` | tudo que chama um modelo — inclusive busca por linguagem natural e embeddings |
| `infra` | ambiente, CI/CD, deploy, observabilidade, empacotamento |
| `qa` | suíte de testes, review de segurança, QA, UAT |
| `docs` | handover, treinamento, documentação de entrega |
| `spec` | item que especifica o produto **atravessando** camadas |

---

## 2. Por que exatamente uma

**O propósito inteiro da tag é que a coluna dela some.** Uma segunda tag no mesmo
item conta ele duas vezes, e a soma para de significar qualquer coisa — que era o
único motivo de existir a tag.

Se você quer saber "quanto do orçamento é front-end?", a resposta só existe se
cada ponto pertence a exatamente um balde.

**Item que é genuinamente metade de uma camada e metade de outra é candidato a
split, não a duas tags.** Se metade dele é tela e metade é serviço, ele é dois
itens que ainda não foram separados — e separar melhora o run em mais de um
sentido, porque também deixa estimar e atribuir melhor.

---

## 3. A tag precisa de um eixo DIFERENTE do `stage_id`

`stage_id` já diz **em que fase** o item está (`spec`, `design`, `execution`,
`review`, `decision`). Se a tag repetir isso, ela é peso morto.

A tag diz **em que camada** o trabalho vive. Os dois eixos juntos é que informam:

| item | `stage_id` | tag | o que você aprende |
|---|---|---|---|
| definir o schema do banco | `spec` | `db` | é especificação **de banco** |
| definir o requisito de IA | `spec` | `ai` | é especificação **de IA** |
| design system e shell | `design` | `front-end` | é design **de tela** |
| arquitetura de interface **e** de servidor | `spec` | `spec` | atravessa camadas, não tem uma dominante |

Ou seja: **`spec` é tag certa só para o item que atravessa camadas.** Um item de
fase `spec` que fala do schema é `db`, não `spec` — senão você perdeu a
informação nova e ficou com a repetida.

---

## 4. O anti-padrão: palavra-chave livre

Tags geradas item a item — `["catalogo","importacao","multi-tenant","fase2"]`,
`["estoque","sincronizacao","beta"]` — leem bem **num item** e **não somam** no run.
Não dá para responder nenhuma pergunta útil com elas, e responder perguntas
agregadas é a única coisa que tag faz melhor que a descrição.

Se o run está assim, limpe e re-tagueie tudo de uma vez, com `commit_message`
explicando a mudança de modelo. É uma chamada de `update_spec_run_items` com uma
edição por item.

---

## 5. ⚠️ O que a tag de camada NÃO mede

> **Uma tag de camada mede onde o código MORA, não por que ele existe.**

Encanamento que só existe para servir a IA — um servidor de tools, um serviço que
monta contexto, um driver que entrega o que o modelo produziu — cai em
`back-end`, porque é lá que ele mora. Então ler "quanto é IA?" direto da coluna
`ai` **subestima**, às vezes bastante.

Isso não é defeito da taxonomia; é o preço de ter uma que soma. A correção é de
leitura, não de modelo:

- **use a tag como localização** — "onde está o trabalho";
- para "por que existe", você precisa de outro eixo (agrupamento por capacidade),
  que é assunto de outro estudo e ainda está em aberto.

Diga isso quando apresentar a tabela. Um número que subestima e é apresentado
como exato é pior que nenhum número.

---

## 6. Como aplicar

```
1) classifique todos os itens em memória, e confira que a soma bate
   com o points_total do run antes de escrever
2) update_spec_run_items com uma edição por item: tags: ["<camada>"]
   (tags SUBSTITUEM a lista inteira, não são adicionadas)
3) releia o run e confira que nenhum item ficou com duas tags ou nenhuma
```

O passo 1 é o que evita descobrir no fim que faltou item: se a soma das camadas
não bate com o total do run, sua classificação está incompleta.

---

## Referências

- [`spec-run-coverage-audit`](../spec-run-coverage-audit/SKILL.md) — a tabela de camadas costuma denunciar um front-end pequeno demais
- [`spec-run-pricing-discipline`](../spec-run-pricing-discipline/SKILL.md) — pontos por camada e o que eles significam
