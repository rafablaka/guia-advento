# Design tokens · Guia do Advento

Tokens da interface, extraídos das 6 telas em `design/telas/`. A interface é quieta: a riqueza visual fica nas ilustrações (ver `docs/vitral-style-guide.md`, seção 14).

## Regras

- Fundos lisos. Sem glassmorphism, sem degradês grandes, sem brilhos (glow). A única exceção é um desfoque leve na barra de navegação inferior.
- Cartões lisos com borda de 1px e raio de 20px. Sem sombra forte.
- Botão principal: violeta chapado, sem degradê.
- Dourado com moderação: ícones de progresso, citações e destaques pequenos.
- Rosa Gaudete só na 3ª semana (13 a 19/12): dia de hoje, frase da vela, progresso.
- Nada de molduras góticas, ornamentos nos cantos ou padrões de vitral na interface. O arco aparece só dentro das ilustrações e no topo arredondado das "portas" do caminho da semana (`border-radius: 20px 20px 6px 6px`).

## Tipografia

| Uso | Fonte | Tamanho / peso |
| --- | --- | --- |
| Títulos e números | Fraunces (Google Fonts) | 34px/500 saudação, 30px/500 título do dia, 104px/600 número da retrospectiva |
| Citações | Fraunces itálico | 19–20px/400, entrelinha 1.35–1.4 |
| Interface e textos | DM Sans (Google Fonts) | 15px/600 rótulos, 14px corpo, 12–13px secundário |
| Sobrancelhas (eyebrow) | DM Sans | 11–12px/600, caixa alta, `letter-spacing: 0.1em` |

## Cores · modo Noite (escuro)

| Token | Valor | Uso |
| --- | --- | --- |
| `bg` | `#1B1224` | Fundo da tela |
| `surface` | `#251A30` | Cartões, pílulas, botões secundários |
| `border` | `rgba(247,238,220,0.10–0.12)` | Borda de cartões |
| `text` | `#F7EEDC` | Texto principal |
| `text-2` | `#C9BBCF` | Texto secundário |
| `text-3` | `#9D8FA8` | Legendas, rótulos |
| `quote` | `#F3E6C9` | Citações |
| `gold` | `#E1B65A` | Acentos, progresso, links |
| `primary` | `#74508B` | Botão principal |
| `primary-deep` | `#553070` | Círculo do ícone dentro do botão, avatar do santo |
| `gaudete` | `#D792AA` (texto) / `#96476A` (preenchimento) | 3ª semana |
| `track` | `rgba(247,238,220,0.16)` | Trilho das barras de progresso |

## Cores · modo Pergaminho (claro)

| Token | Valor | Uso |
| --- | --- | --- |
| `bg` | `#F7EEDC` | Fundo da tela |
| `surface` | `#FFFBF3` | Cartões |
| `border` | `rgba(41,24,47,0.12–0.14)` | Borda de cartões |
| `text` | `#29182F` | Texto principal (mesma cor do "chumbo" das ilustrações) |
| `text-2` | `#5E4B63` | Texto secundário |
| `text-3` | `#74627A` | Legendas |
| `quote` | `#3A2440` | Citações |
| `gold` | `#8A5E1A` | Acentos e links (escurecido para contraste) |
| `primary` | `#553070` | Botão principal |
| `primary-deep` | `#74508B` | Círculo do ícone dentro do botão |
| `gaudete` | `#96476A` | 3ª semana |
| `track` | `rgba(41,24,47,0.14)` | Trilho das barras de progresso |

## Paleta das ilustrações

Não usar na interface, salvo os acentos acima. Referência completa no guia do vitral, seção 7: violeta `#553070 #74508B`, rosa `#C36F91 #D792AA`, azul `#244C75 #315F8A`, celeste `#5D8EB7 #78A9CB`, pinho `#315B4C #3F6D59`, jade `#4F806C #6A9B83`, dourado `#D9A742 #E1B65A`, creme `#F3E6C9 #F7EEDC`, contorno (chumbo) `#29182F`.

## Medidas

- Tela de referência: 390 × 844 (iPhone). Margem lateral de 24px.
- Alvos de toque de no mínimo 44px.
- Barra de navegação: flutuante, 66px de altura, 20px das laterais e 18px do rodapé, raio de 33px.
- Botão principal: 58–62px de altura, raio igual à metade da altura.
- Coroa no Início: 320 × 240. Ilustração do dia: 300 × 258, centralizada, sem moldura.
