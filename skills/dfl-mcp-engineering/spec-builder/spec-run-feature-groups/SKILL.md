---
name: spec-run-feature-groups
description: "Feature groups num spec run — a unidade que o COMPRADOR liga e desliga, o teste de admissão que decide o que é grupo, por que 'fora de todo grupo' é uma classificação e não um campo vazio, e por que grupo e pacote são eixos ortogonais. Use quando: montar a conversa comercial de um run, agrupar itens para uma proposta, decidir se algo merece virar grupo, ou explicar por que um terço do preço não sai por corte de escopo."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash Grep Glob
metadata:
  purpose: Agrupar os itens de um spec run pela unidade sobre a qual o cliente tem opinião
  version: "1.0.0"
---

# Spec Run — feature groups

O pacote de escopo (a "cebola") responde **o que a gente vende**. O feature group
responde **sobre o que o cliente tem opinião**. São perguntas diferentes, e um
run precisa das duas.

---

## 1. O teste de admissão

> **É um feature group se o comprador tem opinião sobre a frase.**

O cliente tem opinião sobre *"eu quero o copiloto de IA"*. Ele **não tem** opinião
sobre *"eu quero o pipeline de indexação"* — isso é consequência de ter busca, não
uma escolha que alguém faz.

O teste não é de tamanho, e essa é a parte que costuma ser entendida errado. A
tentação é definir granularidade ("nem tão fino que vire teste, nem tão grosso que
vire fase"). Granularidade é o **sintoma**; o critério é a frase. Um grupo de um
item só é legítimo se existe uma frase que o cliente aceita ou recusa; um grupo de
nove itens é ilegítimo se ninguém consegue dizer não a ele.

Escreva a frase no `notes` do grupo. Se você não consegue escrever, não é um grupo.

---

## 2. 🚨 "Fora de todo grupo" é uma RESPOSTA, não um buraco

`feature_group_id IS NULL` significa **fora de todo grupo** — a base que existe em
qualquer versão do projeto: CI/CD, deploy, o banco, o design system, o handover, o
UAT, as telas de registro que todo produto daquele tipo tem.

Isso é uma **classificação**. Não é "ainda não olhei", não é "grupo padrão", e não
é um campo que faltou preencher.

Duas consequências operacionais:

- **Atribua `null` EXPLICITAMENTE.** No banco, "não toquei neste item" e "decidi
  que este item é base" são o mesmo valor. Só a sua rodada distingue os dois, e só
  se ela nomear todo item vivo. Uma atribuição que cobre 51 de 74 itens e chama o
  resto de base **não decidiu nada** sobre os 23.
- **Não crie `DEFAULT` nessa coluna.** Um default tornaria os dois estados
  idênticos para sempre. É o mesmo raciocínio de `package_id`
  ([`spec-run-scope-packages`](../spec-run-scope-packages/SKILL.md) §2).

### O bucket de base é um NÚMERO COMERCIAL, e ele fala

Num run real, medido: a base foi de **32% para 37,6%** dos pontos ao longo de uma
curadoria. E o crescimento não veio de feature nova — veio de **telas de registro
que ninguém tinha precificado** (contatos, organizações, detalhe do negócio,
configurações), mais responsivo e gestão de conexões.

Os grupos subiram 23 pontos no mesmo período; a base subiu 54.

> **Leia isso em voz alta na conversa comercial:** aproximadamente 40% do preço
> **não sai por corte de escopo nenhum**. O cliente pode recusar todos os grupos e
> ainda paga a base.

É a informação mais útil que este eixo produz, e ela só aparece porque "fora de
grupo" é uma classificação em vez de um vazio.

---

## 3. Grupo e pacote são ORTOGONAIS

O instinto é "o grupo carrega o pacote, e os itens seguem". Não funciona, e o
contra-exemplo aparece em qualquer run com busca:

- a **busca full-text** é candidata natural ao MVP;
- a **busca semântica** é candidata natural ao pacote de fora.

As duas são do mesmo grupo *Busca*. **Um grupo atravessa pacotes.**

> **O pacote é a unidade de VENDA. O grupo é a unidade de CONVERSA.**

O ganho prático não é atribuir 13 grupos em vez de 74 itens — é **atribuir em lote
com uma justificativa por grupo**, e enxergar o corte por grupo em vez de por
linha solta:

- *"o pacote 2 leva a busca até o full-text"* é uma frase;
- *"o pacote 2 leva estes dois itens de busca mas não estes outros dois"* é uma
  planilha.

---

## 4. Uma classificação escrita num documento nasce velha

Este é o erro mais caro desta skill, e ele é de **processo**, não de ferramenta.

Num caso real: a tabela de classificação foi escrita contra a versão 24 de um run
(58 itens, 444 pontos) e aplicada contra a versão 35 (74 itens, 521 pontos). No
intervalo nasceram **19 itens**, morreram **3**, e um grupo inteiro **deixou de
existir** porque o seu único item foi removido.

Quem colasse a tabela do documento teria criado um grupo vazio e deixado 16 itens
sem classificação — sem nenhum erro sendo levantado.

**As três regras que saem disso:**

1. **A tabela do documento é ponto de partida, nunca entregável.** Releia o run e
   reconcilie antes de escrever qualquer coisa.
2. **Cobertura total na atribuição.** Todo item vivo nomeado por exatamente uma
   operação. É a mesma regra do `regenerate_spec_run`
   ([`spec-run-comment-round`](../spec-run-comment-round/SKILL.md) §2), pelo mesmo
   motivo: uma lista parcial é uma lista nova disfarçada.
3. **Grupo sem item não existe.** Se o único item de um grupo foi removido, o
   grupo sai junto. Não deixe grupo vazio "para lembrar" — ele mostra 0 pontos e
   não afirma nada.

---

## 5. Apagar um grupo é recusado enquanto ele tiver item

`delete_spec_run_feature_group` **recusa** enquanto houver item apontando para o
grupo, e a recusa é mais importante do que parece.

A FK é `ON DELETE SET NULL`. Como `null` significa **"é base do projeto"**, um
delete direto faria o run **afirmar** que uma dúzia de itens são fundação — sem
ninguém ter decidido isso, e sem nenhum erro aparecer.

A ordem certa é sempre: reatribuir os itens **explicitamente** (para outro grupo
ou para base, e isso é uma decisão), e só então apagar o grupo vazio.

---

## 6. A escrita tem compare-and-set, e ele não é decorativo

`assign_spec_run_feature_groups` compara uma base de **três partes** — versão do
run, contagem de itens vivos, e o `updated_at` mais novo entre eles — e **recusa**
a escrita inteira se qualquer uma tiver mudado.

Duas coisas para não errar:

- **Leia a base ANTES de compor a atribuição, e passe adiante.** Uma base lida no
  instante da escrita sempre bate, e aí o compare-and-set vira enfeite.
- **A versão sozinha não bastaria.** O alocador numera a partir de
  `max(version_number) + 1`, então um run que nunca teve checkpoint fica na versão
  1 **e o primeiro corte também produz 1**. Num inventário real isso descrevia 15
  de 18 runs — uma checagem só de versão seria no-op em quase todos.

Se a escrita for recusada, **releia e refaça**. Nunca force.

---

## 7. Checklist

- [ ] Todo grupo tem uma frase que o cliente aceitaria ou recusaria, escrita no `notes`
- [ ] Todo item vivo foi nomeado — inclusive os de base, com `null` explícito
- [ ] `Σ(em grupo) + Σ(fora de grupo)` bate com o total do run, lido do servidor
- [ ] Nenhum grupo vazio sobrou
- [ ] As dependências entre grupos estão no `notes` de quem depende
- [ ] O percentual da base foi dito em voz alta na conversa de preço

---

## Referências

- [`spec-run-scope-packages`](../spec-run-scope-packages/SKILL.md) — o outro eixo, o de venda
- [`spec-run-pricing-discipline`](../spec-run-pricing-discipline/SKILL.md) — pontos e proveniência
- [`spec-run-comment-round`](../spec-run-comment-round/SKILL.md) — a rodada que cria os itens
