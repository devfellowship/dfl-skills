---
name: esteira-dfl
description: "Gera a esteira técnica completa (sprints, etapas, tasks, pontuação) a partir de um documento de spec/orçamento de projeto que saiu do comercial e precisa entrar em produção, seguindo as regras DFL. Use quando: um projeto acabou de ser aprovado/assinado pelo cliente e existe spec/orçamento pronto para virar tasks de execução."
license: MIT
compatibility: Claude Code
metadata:
  purpose: Geração de esteira técnica DFL a partir de spec/orçamento comercial
  version: "1.0.0"
---

# Skill: /esteira_dfl — Esteira Técnica DFL

Você recebeu um documento de spec/orçamento de um projeto que saiu do comercial e precisa entrar em produção. Gere a esteira técnica completa seguindo as regras DFL.

## O que gerar

Produza um documento markdown com esta estrutura exata:

```
# [Nome do Projeto] — Esteira Técnica DFL

## Informações do Projeto
## Links Úteis
## Escopo MVP (o que entra)
## Fora do MVP (v2+)
## Cronograma por Sprint
## Etapas e Tasks
## Resumo Final
```

## Regras de geração

### Pontuação
- **1 ponto = 1 hora de trabalho** (padrão DFL · R$ 100/h pleno)
- Granularidade por task: **1–16 pts**
- Tasks com >16pts devem ser quebradas
- Total de pontos deve bater com total de horas do orçamento

### Organização
- Sprints de **2 semanas** como unidade base
- Numeração de sprints começa em **0**
- Etapas seguem a ordem lógica de dependência (auth → dados → UI → QA)
- QA + Deploy é **sempre** etapa separada com pontos próprios

### Status das tasks
- `⬜` Pendente
- `✅ Confirmado` (escopo fechado)
- `🔄 A Definir` (orçamento reservado, tasks ainda não detalhadas)
- `❌ v2+` (fora do MVP)

### Conteúdo obrigatório

**Links Úteis** — sempre incluir a tabela com estes campos (preencher com "_a preencher_" se não informado):
- Site real do cliente
- Protótipo / Figma
- Supabase Dashboard (ou banco equivalente)
- Repositório GitHub
- Miro (board do projeto)
- App Store Connect (se mobile)
- Google Play Console (se mobile)

**Escopo MVP** — tabela: `# | Módulo | Pontos | Status`

**Fora do MVP** — lista bullet com o que foi adiado e por quê (1 linha por item)

**Cronograma por Sprint** — tabela: `Sprint | Semanas | Módulos | Pontos`

**Etapas e Tasks** — para cada etapa:
- Header com nome, pontos totais e sprint
- Tabela: `Task | Pts | Status`
- Subtotal conferindo com o orçamento
- Se etapa "A Definir": reservar pontos e mencionar que tasks serão detalhadas em sessão de refinamento

**Resumo Final** — tabela de todas as etapas + total geral

**Texto Explicativo** — sempre ao final, após o Resumo Final. Seção obrigatória com header `## Visão da Esteira — [Nome do Projeto]`. Deve conter:
- Estrutura geral: quantidade de sprints, total de pontos, critério de priorização
- Decisões técnicas relevantes (plataforma, APIs externas, itens adiados para v2) com justificativa
- Foco especial na fase de **Revisão e Entrega Final**: o que é validado no QA, por que é etapa separada, e o que define o encerramento do projeto
- Tom de engenheiro sênior: sem promessas vagas, decisões justificadas, riscos nomeados

## Aprendizados (primeira execução: App Dra. Laura · 2026-05-22)

1. Confirmar com o cliente o que é "inegociável" antes de detalhar tasks — esses são os primeiros a ter tasks completas
2. Módulos "a definir" reservam orçamento e exigem sessão de refinamento separada — não bloquear a geração da esteira
3. Sempre validar: `Σ tasks por etapa = horas do orçamento daquela etapa`
4. Assets externos (ilustrador, textos do cliente) viram tasks de "coordenação/importação"
5. Limitações de plataforma (ex: iOS vs Android) viram tasks de UX informativa — não sumir silenciosamente
6. Push notifications entram na etapa que as dispara, não em etapa separada
7. Storage/upload é task separada do fluxo de UI que o usa
8. A seção de links úteis deve ser preenchida mesmo que parcialmente — forçar o cliente a compartilhar os links cedo

## Quando usar

- Projeto acabou de sair do comercial e o cliente assinou/aprovou a proposta
- Existe documento de spec, orçamento ou levantamento de requisitos
- O objetivo é ter tasks prontas para iniciar execução em até 1 sprint
