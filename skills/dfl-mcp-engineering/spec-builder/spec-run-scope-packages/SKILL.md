---
name: spec-run-scope-packages
description: "Montar pacotes de escopo (MVP vs completo) num spec run com o modelo de cebola — camada 1 é o núcleo, pacote N contém tudo com camada <= N. Cobre a armadilha do item sem pacote, a regra de que a tela viaja no pacote do driver dela, e o que o total de um pacote NÃO significa. Use quando: criar MVP e pacote completo, atribuir itens novos a pacote, ou explicar por que excluir um pacote não economiza o total dele."
license: MIT
compatibility: Claude Code
allowed-tools: Read Bash Grep Glob
metadata:
  purpose: Montar e manter pacotes de escopo num spec run sem que os totais mintam
  version: "1.0.0"
---

# Spec Run — pacotes de escopo

---

## 1. O modelo de cebola

Cada item aponta para o **pacote mais interno** que o contém. `layer` é a
profundidade a partir do núcleo:

- **camada 1** = pacote mais interno (o MVP);
- **pacote N** contém **todo item cuja camada é ≤ N**.

Consequência prática: atribuir um item à camada 1 põe ele em **todos** os
pacotes. "Pacote N = itens com camada ≤ N" é verdadeiro **por construção**, não
por manutenção — não existe estado em que um item esteja no MVP e fora do
completo.

`layer` **não** é o número que o cliente lê. Esse é o `client_label`
("Pacote 1 — MVP").

---

## 2. 🚨 `package_id` nulo NÃO é camada 1

Item sem pacote está **fora de todos os pacotes**, não dentro do primeiro.

Essa é a armadilha mais cara desta skill, porque ela é **silenciosa**: um item
novo que ninguém atribuiu simplesmente não aparece em total nenhum. Todos os
pacotes ficam menores do que a realidade, nenhum erro é levantado, e o número
que vai para o cliente está errado para baixo.

> **Regra:** toda rodada que cria item termina com atribuição, e depois com a
> afirmação de que `unassigned_items` está **vazio**.

```
1) regenerate_spec_run   → itens novos nascem
2) assign_spec_run_layers → cada item novo ganha pacote
3) list_spec_run_packages → confira: unassigned_items == []
```

O passo 3 não é zelo, é a única forma de saber.

---

## 3. Comportamento de `assign_spec_run_layers`

- **Item que você não lista fica como está.** Você só precisa mandar o que muda.
- **`package_id: null`** tira o item de todos os pacotes — de novo, isso **não** é
  camada 1.
- **A escrita é recusada** se outro escritor mexeu no run entre a leitura desta
  chamada e a gravação. Nada é escrito; releia e refaça.

---

## 4. A regra: a superfície viaja no pacote do back-end dela

**Uma tela entra no mesmo pacote do back-end de que ela depende.**

Um botão de conexão sem o driver atrás não é uma feature incompleta — é uma
feature **quebrada**. O usuário aperta e não existe nada do outro lado para
segurar o resultado.

Duas coisas boas saem dessa regra:

1. **O empacotamento vira mecânico.** Não há julgamento tela a tela: você olha de
   qual item ela depende e copia o pacote.
2. **Trocar qual provedor vem primeiro fica barato.** Se a decisão de qual
   integração entra no MVP muda, a tela muda de pacote junto com o driver, e o
   custo não se move — porque as duas telas equivalentes valem o mesmo.

A regra generaliza: **qualquer superfície sobre um driver segue o driver.**

---

## 5. O que o total de um pacote NÃO diz

> **Excluir um pacote não remove os pontos dele do build.**

Parte do trabalho de um pacote é **compartilhada** com o que fica. Uma camada de
autenticação, um design system, um scheduler, uma costura de driver: eles são
consumidos por itens de vários pacotes. Tirar o pacote de fora reduz a lista de
itens; não reduz aquele trabalho na mesma proporção.

O efeito no orçamento é real: o pacote interno costuma carregar **100% do custo
compartilhado**, e o pacote externo parece mais barato do que é para construir
sozinho.

**Isto é uma questão em aberto, não um problema resolvido.** Não prometa
proporcionalidade que o modelo não entrega. O estudo está em
[`20260818-spec-run-capability-groups`](https://plans.devfellowship.com/20260818-spec-run-capability-groups),
e o modelo de camadas em
[`20260818-spec-builder-scope-packages-tiers`](https://plans.devfellowship.com/20260818-spec-builder-scope-packages-tiers).

O que dá para dizer com segurança hoje:

- o total de um pacote é **o que ele contém**, não **o que ele custaria isolado**;
- a diferença entre dois pacotes é o custo **incremental** do de fora, e essa
  leitura é honesta;
- a leitura desonesta é "então o pacote 2 sozinho custa X" — não custa.

---

## 6. Checklist

- [ ] Cada pacote tem `layer` e `client_label` coerentes
- [ ] Todo item novo da rodada foi atribuído
- [ ] `unassigned_items` está vazio, verificado no servidor
- [ ] Toda tela está no mesmo pacote do back-end dela
- [ ] O total foi relido do servidor depois da atribuição, não somado de cabeça
- [ ] Ninguém está apresentando o total de um pacote como custo isolado dele

---

## Referências

- [`spec-run-comment-round`](../spec-run-comment-round/SKILL.md) — a rodada que cria os itens
- [`spec-run-pricing-discipline`](../spec-run-pricing-discipline/SKILL.md) — pontos e proveniência
