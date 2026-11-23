---
name: No Prazo
description: Controle offline de validade por produto e lote.
colors:
  background: "#FFFFFF"
  surface: "#F3F7F7"
  surface-strong: "#E5EEEE"
  primary: "#006B6B"
  primary-pressed: "#004F51"
  primary-soft: "#DDF0F0"
  ink: "#172527"
  muted: "#52686B"
  border: "#CCDADA"
  warning: "#9A5B00"
  warning-soft: "#FFF1D6"
  danger: "#B42318"
  danger-soft: "#FEE9E7"
  success: "#16794A"
  success-soft: "#E2F4EA"
typography:
  headline:
    fontFamily: "System, Roboto, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.4px"
  title:
    fontFamily: "System, Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "System, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.47
  label:
    fontFamily: "System, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.33
rounded:
  sm: "8px"
  control: "12px"
  container: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "48px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "52px"
  lot-container:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "16px"
---

# Design System: No Prazo

## Overview

**Creative North Star: "Balcão em Ordem"**

No Prazo é uma ferramenta comercial clara, rápida e confiável, inspirada na objetividade de Shopify, Square e Mercado Pago. Superfícies claras mantêm o estoque legível; o azul-petróleo guia ações e seleção; cores semânticas aparecem somente quando carregam informação.

A interface rejeita o alarmismo de painéis de antivírus e a densidade sem hierarquia de ERPs legados. Movimento é responsivo, curto e funcional. Controles permanecem familiares para que a ferramenta desapareça durante o trabalho.

**Key Characteristics:**

- Hierarquia operacional direta.
- Uma linha independente por lote.
- Estados explícitos por texto, ícone e cor.
- Alvos de toque com no mínimo 48px.
- Movimento de 150–220ms usado apenas como feedback.

## Colors

A paleta usa branco literal, neutros discretamente azulados e azul-petróleo para confiança operacional.

### Primary

- **Azul-petróleo operacional:** ação primária, foco, seleção e marca.
- **Azul-petróleo profundo:** estado pressionado e texto sobre fundos claros da marca.
- **Névoa petróleo:** seleção leve, ícones contextuais e superfícies de apoio.

### Secondary

- **Âmbar de atenção:** lotes que vencem nos próximos sete dias.
- **Vermelho de vencimento:** erros e lotes vencidos; nunca é cor de ação comum.
- **Verde em dia:** confirmação e estado saudável.

### Neutral

- **Branco de balcão:** fundo principal e controles.
- **Superfície fria:** fundo estrutural que separa áreas sem sombra.
- **Tinta petróleo:** texto principal com contraste alto.
- **Texto auxiliar:** metadados e descrições; não deve ser usado abaixo de 14px sobre fundo tonal.

### Named Rules

**The Restrained Commerce Rule.** O azul-petróleo ocupa menos de 10% da tela e serve a ações, foco e seleção.

**The Semantic Red Rule.** Vermelho é exclusivo de erro, exclusão e vencimento. Se um botão comum está vermelho, ele está errado.

## Typography

**Display Font:** System/Roboto, sans-serif  
**Body Font:** System/Roboto, sans-serif

**Character:** Uma única sans humanista mantém leitura rápida e uma presença profissional sem rigidez. Peso cria hierarquia; não há tipografia decorativa.

### Hierarchy

- **Headline** (800, 30px, 36px): título principal da listagem.
- **Title** (800, 20px, 26px): seções, estados vazios e nomes em destaque.
- **Body** (400, 15px, 22px): instruções e conteúdo corrente.
- **Label** (700, 12px, 16px): badges, contagens e metadados curtos.

### Named Rules

**The One Family Rule.** Nunca introduza fonte display ou monoespaçada para dar personalidade a controles operacionais.

## Elevation

O sistema é plano por padrão. Profundidade vem de fundo tonal, espaçamento e bordas de 1px. A única sombra persistente pertence ao botão flutuante de adicionar, com deslocamento curto, blur contido e opacidade baixa.

### Shadow Vocabulary

- **Floating action:** deslocamento vertical de 3px, blur de 6px e opacidade de 16%; somente para a ação fixa acima do conteúdo.

### Named Rules

**The Flat-by-Default Rule.** Containers em repouso usam borda ou diferença tonal, nunca borda combinada com sombra decorativa ampla.

## Components

### Buttons

- **Shape:** cantos firmemente arredondados (12px), altura mínima de 48px.
- **Primary:** azul-petróleo com texto branco e peso 700.
- **Pressed / Focus:** azul profundo no pressionado; foco preserva contraste e semântica nativa.
- **Ghost:** sem preenchimento em repouso, texto azul-petróleo e fundo tonal ao pressionar.
- **Danger:** vermelho apenas para exclusão confirmada.

### Chips

- **Style:** pill completa, altura mínima de 48px, fundo tonal quando inativa.
- **State:** selecionada usa azul-petróleo com texto branco; o texto sempre nomeia o filtro.

### Cards / Containers

- **Corner Style:** suavemente arredondado (14px).
- **Background:** branco sobre superfície fria.
- **Shadow Strategy:** sem sombra.
- **Border:** 1px neutra em linhas de lote.
- **Internal Padding:** 16px.

### Inputs / Fields

- **Style:** fundo branco, borda neutra de 1px, 12px de raio e 52px de altura mínima.
- **Focus:** borda azul-petróleo de 2px sem alterar o tamanho externo.
- **Error / Disabled:** borda vermelha e mensagem textual; nunca apenas cor.

### Navigation

Pilha nativa com cabeçalho branco, título em tinta petróleo e ação de retorno azul-petróleo. O fluxo principal não usa abas: listagem, cadastro e edição formam uma única hierarquia.

### Status Badge

Badge compacta com ícone, texto e fundo tonal. “Vence hoje”, “Próximos 7 dias”, “Vencido” e “Em dia” nunca dependem somente da cor.

## Do's and Don'ts

### Do:

- **Do** mostrar produto, lote, quantidade e validade em uma varredura visual.
- **Do** manter todos os alvos interativos com pelo menos 48px.
- **Do** usar texto e ícone junto da cor para comunicar status.
- **Do** reservar o azul-petróleo para ação, seleção e foco.
- **Do** reduzir ou remover movimento quando o sistema solicitar movimento reduzido.

### Don't:

- **Don't** reproduzir um painel de antivírus com vermelho dominante, contadores ameaçadores ou urgência constante.
- **Don't** criar a densidade sem hierarquia de um ERP legado.
- **Don't** usar recompensas, confetes ou padrões de app gamificado.
- **Don't** combinar borda fina com sombra ampla em cards.
- **Don't** usar vermelho em ações comuns ou como decoração.
- **Don't** criar cards com raio superior a 16px.
