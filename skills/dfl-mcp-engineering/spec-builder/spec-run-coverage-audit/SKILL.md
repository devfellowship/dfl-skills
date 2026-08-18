---
name: spec-run-coverage-audit
description: "Três auditorias que encontram o trabalho que o orçamento esqueceu de cobrar — entidade sem tela, critério de aceite órfão, e fragmento transversal sem dono. Use quando: antes de mandar um spec run para o cliente, quando o front-end parece pequeno demais, quando um critério promete qualidade que ninguém constrói, ou quando alguém pergunta se o orçamento está completo."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash Grep Glob
metadata:
  purpose: Encontrar escopo real que existe no produto e não existe em nenhum item do run
  version: "1.0.0"
---

# Spec Run — auditoria de cobertura

> **Um orçamento está completo quando toda entidade tem dono para a tela dela e
> todo critério de aceite tem dono para o mecanismo dele.**

Essas duas frases são o teste inteiro. Um run passa em revisão com facilidade
porque cada item, olhado sozinho, parece bom. O que escapa é o que **não está em
item nenhum** — e isso não aparece lendo a lista, só cruzando a lista com outra
coisa.

Rode as três auditorias antes de um run virar proposta.

---

## Auditoria A — entidade → tela

**Pergunta:** para cada entidade do modelo de domínio registrado, qual item
constrói a tela dela?

### Como fazer

1. Leia o **artefato registrado** (o ERD no Diagrams), entidade por entidade.
   Nunca de memória, e nunca da sua lembrança do documento do cliente.
2. Para cada entidade, ache o item que constrói a tela. Se não existe, marque.
3. **Separe os dois tipos de "não tem tela":**
   - **Legítimo** — tabela de junção, sub-objeto, entidade de log. Não precisa.
   - **Acidental** — a entidade central do produto sem lista, sem detalhe, sem
     criar/editar. Isso é buraco.
4. Reporte como tabela, com a coluna "quem constrói".

### O que costuma aparecer

Muito mais do que se imagina. Numa auditoria real de um produto de gestão, a
**maioria** das entidades do modelo não tinha tela nenhuma: todo serviço de
back-end estava orçado, o schema estava orçado, os jobs estavam orçados — e o
CRUD de registros, que é literalmente o que o usuário abre o dia inteiro, não
tinha um único item. O front-end era cerca de um quarto do orçamento num produto
cujo valor é uma pessoa lendo e movendo registros.

O padrão por trás disso é sistemático, não azar: **itens de back-end nascem da
arquitetura, que está escrita; itens de tela nascem do fluxo de uso, que
raramente está.**

### Armadilhas

- **"O design system cobre".** Não cobre. Um item de `design` entrega o layout
  aprovado e os componentes; ele é **entrada** para os itens de front-end, não
  substituto deles. Leia a descrição: se ela diz "é o insumo para todo item de
  front-end abaixo", os itens abaixo precisam existir.
- **Lista ≠ detalhe.** Uma tela de board/kanban é a **lista** de uma entidade.
  A **página de detalhe** é outra tela, e costuma ser a mais movimentada do
  produto — é onde penduram notas, anexos, histórico e relacionados.
- **Duas entidades, um CRUD.** Se o modelo usa um discriminador (um campo
  `record_type`, um `kind`), é **um** CRUD com filtro, não dois. Auditar sem ler
  o modelo cria itens duplicados.
- **Entidade de configuração é tela também.** Uma entidade de usuário que guarda
  fuso horário e horário de trabalho não é "admin opcional" se algum serviço lê
  esses campos: sem a tela, aquele serviço não tem entrada.

---

## Auditoria B — critério de aceite órfão

**Pergunta:** este critério nomeia um mecanismo que nenhum item constrói?

### Como fazer

Varra **todos** os critérios de aceite do run procurando frases que prometem
capacidade em vez de descrever o item. Padrões que quase sempre são órfãos:

- "medido contra um conjunto de referência"
- "um humano pode corrigir / aceitar / descartar"
- "o custo é medido e visível"
- "o teto é aplicado"
- "a qualidade é comparável entre execuções"

Para cada um, pergunte: **qual item constrói o conjunto de referência? qual item
constrói a tela de correção? qual item instrumenta o custo?**

Se a resposta é "nenhum", é uma **promessa com orçamento zero**.

### Por que passam na revisão

Porque elas **leem como qualidade**. "Medido contra um conjunto de referência" é
exatamente o tipo de frase que um revisor aprova com satisfação. Ela só falha na
entrega, quando alguém pergunta onde está o conjunto.

---

## Auditoria C — o fragmento transversal

**Pergunta:** este critério aparece em três ou mais itens?

Se sim, **não são três trabalhinhos**. É **uma capacidade que ninguém possui**,
picada em pedaços que individualmente parecem pequenos demais para merecer item.

### O que fazer

1. Promova para **um** item, com dono e pontos.
2. **Remova o fragmento de cada item de origem.**
3. **Re-pontue cada origem para baixo** — senão você cobrou duas vezes (ver
   [`spec-run-pricing-discipline`](../spec-run-pricing-discipline/SKILL.md) §3).

Exemplos clássicos do padrão: observabilidade de custo, harness de avaliação,
superfície de revisão humana, camada de auditoria. Todos são "uma camada sobre o
cliente/serviço", nunca N implementações.

---

## A dependência que não é nossa

Quando uma auditoria descobre que a peça faltante depende de **material que só o
cliente tem** — casos reais, dados de exemplo, o que ele considera resposta certa
— o resultado da auditoria **não** é uma suposição. É uma **pergunta endereçada ao
cliente**.

O motivo é direto: se nós escrevemos o gabarito, nós corrigimos a nossa própria
prova. A medição passa a medir concordância com a gente, não com quem paga.

Peça o material com número e forma ("cerca de 20 casos típicos, e para cada um o
resultado que uma pessoa do time considera certo"), e registre como pergunta
bloqueante.

---

## Como reportar uma auditoria

1. **A tabela** — entidade/critério × quem constrói × veredito.
2. **O número** — quantas entidades sem tela, quantos critérios órfãos, quantos
   pontos isso representa.
3. **A correção de leitura** — os pontos onde a primeira interpretação do buraco
   estava errada (duas entidades que são um CRUD só; uma entidade que parecia
   opcional e não é). Isso vale tanto quanto o buraco.
4. **O que você decidiu NÃO criar**, e por quê. Julgamento registrado é julgamento
   barato de reverter; julgamento silencioso vira buraco de novo na próxima
   auditoria.

---

## Referências

- [`spec-run-pricing-discipline`](../spec-run-pricing-discipline/SKILL.md) — re-pontuar as origens depois de promover um transversal
- [`spec-run-comment-round`](../spec-run-comment-round/SKILL.md) — como aplicar o resultado da auditoria
- [`dfl-mcp-engineering`](../../SKILL.md) — ler o ERD registrado no Diagrams
