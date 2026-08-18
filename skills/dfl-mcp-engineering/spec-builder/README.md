# Spec Builder — skills de operação

Seis skills que cobrem **como conduzir bem um spec run** no AI Spec Builder
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
| [`spec-run-item-taxonomy/`](spec-run-item-taxonomy/SKILL.md) | Como marco os itens pra saber quanto é UI, banco, IA? |

## Ordem de leitura

Se você **revisa** runs (papel de quem decide escopo e preço), leia
`spec-run-review-playbook` e `spec-run-pricing-discipline`. É o suficiente.

Se você **opera** o run com um agente, leia na ordem:
`spec-run-comment-round` → `spec-run-pricing-discipline` → `spec-run-coverage-audit`
→ `spec-run-scope-packages` → `spec-run-item-taxonomy`.

## As três armadilhas que mais custam caro

1. **`update_spec_run_items` ignora campo desconhecido em silêncio.** O nome do
   campo errado não dá erro; dá `applied: 0` e segue a vida. Sempre leia de volta.
2. **Item sem pacote não é camada 1** — é "fora de todo pacote". Um item novo que
   você esqueceu de atribuir faz **todos** os totais de pacote mentirem, sem alarme.
3. **Tirar escopo de um item e não re-pontuar o pai** cobra o mesmo trabalho duas
   vezes. O orçamento infla e ninguém vê, porque cada item isolado parece certo.

## O que estas skills NÃO resolvem

Como precificar trabalho **compartilhado** entre pacotes. Desligar um pacote não
remove os pontos dele do build, porque parte do trabalho continua servindo o que
sobrou. Isso é uma questão aberta, não um problema resolvido — está registrada em
[`20260818-spec-run-capability-groups`](https://plans.devfellowship.com/20260818-spec-run-capability-groups).
O modelo de camadas em si está em
[`20260818-spec-builder-scope-packages-tiers`](https://plans.devfellowship.com/20260818-spec-builder-scope-packages-tiers).
