# Spec Builder — skills de operação

Sete skills que cobrem **como conduzir bem um spec run** no AI Spec Builder
(`engineering.mcp.devfellowship.com`), do jeito que a ferramenta funciona hoje.

A doc oficial ([`docs.devfellowship.com/tools/spec-builder`](https://docs.devfellowship.com/tools/spec-builder/))
já tem o schema exato de cada tool. Estas skills cobrem outra coisa: **as regras
que não estão no schema** — o que quebra em silêncio, o que precisa de duas
chamadas em vez de uma, e o que faz um orçamento mentir sem dar erro.

Um spec run é uma **proposta comercial em forma de tabela**. Os pontos viram
preço. Por isso quase toda regra aqui existe para impedir que um número fique
errado sem ninguém perceber.

| Skill | Responde |
|---|---|
| [`spec-run-review-playbook/`](spec-run-review-playbook/SKILL.md) | Sou eu que reviso o run. Como comento pra o agente conseguir agir? |
| [`spec-run-comment-round/`](spec-run-comment-round/SKILL.md) | Recebi um batch de comentários. Como aplico sem corromper o run? |
| [`spec-run-pricing-discipline/`](spec-run-pricing-discipline/SKILL.md) | Movi escopo entre itens. Quais pontos mudam, e o que digo ao cliente? |
| [`spec-run-coverage-audit/`](spec-run-coverage-audit/SKILL.md) | O orçamento está completo? O que ele esqueceu de cobrar? |
| [`spec-run-scope-packages/`](spec-run-scope-packages/SKILL.md) | Como monto MVP vs completo sem que os totais mintam? |
| [`spec-run-feature-groups/`](spec-run-feature-groups/SKILL.md) | Como agrupo os itens pela unidade que o cliente liga e desliga? |
| [`spec-run-item-taxonomy/`](spec-run-item-taxonomy/SKILL.md) | Como marco os itens pra saber quanto é UI, banco, IA? |

## Ordem de leitura

Se você **revisa** runs (papel de quem decide escopo e preço), leia
`spec-run-review-playbook` e `spec-run-pricing-discipline`. É o suficiente.

Se você **opera** o run com um agente, leia na ordem:
`spec-run-comment-round` → `spec-run-pricing-discipline` → `spec-run-coverage-audit`
→ `spec-run-scope-packages` → `spec-run-feature-groups` → `spec-run-item-taxonomy`.

**Os dois eixos, e eles não são o mesmo.** O **pacote** é a unidade de venda
(`spec-run-scope-packages`); o **feature group** é a unidade de conversa
(`spec-run-feature-groups`). Um grupo atravessa pacotes — a busca básica pode ser
MVP enquanto a busca semântica é pacote 2, e as duas são do mesmo grupo. Ler uma
skill sem a outra leva a tentar fundir os eixos, que é o erro de modelagem mais
caro deste conjunto.

## As cinco armadilhas que mais custam caro

1. **`update_spec_run_items` ignora campo desconhecido em silêncio.** O nome do
   campo errado não dá erro; dá `applied: 0` e segue a vida. Sempre leia de volta.
2. **Item sem pacote não é camada 1** — é "fora de todo pacote". Um item novo que
   você esqueceu de atribuir faz **todos** os totais de pacote mentirem, sem alarme.
3. **Tirar escopo de um item e não re-pontuar o pai** cobra o mesmo trabalho duas
   vezes. O orçamento infla e ninguém vê, porque cada item isolado parece certo.
4. **Baixar os pontos e não aparar os critérios de aceite** deixa um item que
   custa 8 e promete 16. O erro não aparece no orçamento — aparece na entrega,
   porque quem constrói lê o critério e não o histórico de versão.
5. **Um pacote que perdeu escopo e manteve os compartilhados** cobra fundação de
   um produto que ele não vai entregar. É a armadilha 3 na direção contrária.

## O que estas skills NÃO resolvem

**Automatizar o encolhimento do trabalho compartilhado.** A decisão está tomada —
compartilhado encolhe **à mão**, e o procedimento está em
[`spec-run-pricing-discipline`](spec-run-pricing-discipline/SKILL.md) §7 — mas
nada no sistema **lembra** você de fazer isso. Enquanto ninguém re-estimou, o
total do pacote interno é um teto, não um preço, e só a disciplina de quem opera
impede que ele seja apresentado como preço.

**Medir se o agrupamento é bom.** Dá para verificar que a soma fecha e que todo
item foi classificado; não dá para verificar que os grupos são os grupos certos.
O único sinal honesto é quantos itens o humano reclassifica depois de uma
sugestão — e isso ninguém registra hoje.

O modelo de camadas está em
[`20260818-spec-builder-scope-packages-tiers`](https://plans.devfellowship.com/20260818-spec-builder-scope-packages-tiers)
e o de feature groups em
[`20260818-spec-run-capability-groups`](https://plans.devfellowship.com/20260818-spec-run-capability-groups).
