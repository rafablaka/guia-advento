# Posts orgânicos · Guia do Advento

Templates para os posts do Instagram (1080 × 1080, PNG). Cada template é uma página HTML; os textos vêm de um arquivo JSON. Cada item do JSON vira uma imagem (ou duas, uma no modo claro e outra no escuro).

## Como gerar as imagens

Na primeira vez, no seu computador:

```bash
npm install
npx playwright-core install chromium
```

Depois, sempre que mudar um texto:

```bash
npm run posts                 # gera todos
npm run posts -- tweet notas  # gera só os indicados
```

As imagens aparecem em `posts/saida/`, com o nome `<template>-<id>-<modo>.png`.

## Como criar um post novo

1. Abra o arquivo do template em `posts/dados/` (por exemplo, `tweet.json`).
2. Copie um item da lista `itens`, troque o `id` (vira o nome do arquivo) e os textos.
3. Rode `npm run posts`.

Por padrão, os templates de UI saem nos dois modos. Para gerar só um, coloque `"modos": ["escuro"]` no item.

## Os 6 templates

| Arquivo | O que é | Modos |
| --- | --- | --- |
| `tweet` | Print de post do X | claro e escuro |
| `notificacao` | Tela de bloqueio do iOS com notificações | claro e escuro |
| `notas` | App Notas do iOS | claro e escuro |
| `pintura` | Releitura em vitral + frase (identidade do app) | um só |
| `whatsapp` | Conversa de grupo no WhatsApp do iOS | claro e escuro |
| `busca` | Busca que completa a frase (iOS ou Google) | claro e escuro |

### Campos

Fotos e papéis de parede (`busca` e `notificacao`) recebem um filtro duotone roxo e um leve desfoque. A foto não precisa ser muito nítida. O ícone do Guia (no selo e nas notificações) fica em `imagens/icone-guia.jpg`; para trocar, salve outra imagem quadrada com o mesmo nome.

Caminhos de imagem são relativos à pasta `posts/` (por exemplo, `../public/illustrations/anunciacao.svg` ou `imagens/fotos/coroa-vela-acesa.jpg`).

**tweet**: `nome`, `handle`, `avatar` (imagem; os retratos ficam em `imagens/santos/`, e sem o arquivo entram as iniciais sobre roxo), `texto` (até 280 caracteres; a fonte diminui sozinha se o texto for longo), `hora_data`, `respostas`, `reposts`, `curtidas`, `views`. Opcional: `iniciais`, para trocar as iniciais calculadas.

**notificacao**: `wallpaper`, `data`, `hora`, `notificacoes[]` com `titulo`, `corpo` e `tempo` (de 1 a 3).

**notas**: `titulo`, `itens[]` com `texto` e `marcado` (`true` ou `false`), `texto_livre`.

**pintura**: `imagem`, `frase`, `autor`, `credito`. Opcionais para enquadrar a arte: `foco` (ponto da imagem que fica fixo, como `"50% 22%"`), `escala` (aproxima a arte, como `1.4`) e `campo` (cor que aparece onde a arte não cobre).

**whatsapp**: `nome_grupo`, `foto_grupo` (imagem, emoji ou vazio para o ícone padrão de grupo), `mensagens[]` com `remetente`, `cor`, `texto`, `hora`, `enviada` (`true` = balão verde, seu) e `link_preview` (`imagem`, `fundo`, `titulo`, `descricao`, `dominio`). Cores: `roxo` (o da marca), `laranja`, `azul`, `verde`, `rosa`, `vinho` ou um código como `#C4581C`. Opcional: `dia` (padrão "Hoje").

**busca**: `ui` (`ios` ou `google`), `fundo` (foto), `digitado`, `referencia`, `sugestoes[]` (de 3 a 5). Opcionais: `posicao` do card (`alto`, `centro` ou `baixo`), `foco` e `escala` da foto, para tirar o assunto da foto de baixo do card.

## O que ainda é provisório

- **Frases dos santos:** tradução provisória. Trocar depois da revisão doutrinal.
- **Isaías 9,5:** trocar pelo texto da Bíblia Ave-Maria depois da autorização.
- **Fotos da busca** (`imagens/fotos/`): fotos livres (CC0) em resolução baixa, só para montar o layout. Para os posts de verdade, use fotos boas, com pelo menos 1080 px de altura e o ponto focal no terço de cima ou de baixo, que o card fica no meio.
- **Domínio** `guiadoadvento.com.br` no WhatsApp: é só exemplo, o domínio do app ainda não foi decidido.
- **Releituras em vitral, retrato do santo e ícone:** usam as artes provisórias de `public/illustrations/`. Quando as finais chegarem, é só apontar o JSON para elas.

## Fontes

Fraunces e DM Sans vêm de `assets/fonts/`. Para imitar o iPhone, o template usa a fonte do sistema: num Mac, sai com SF Pro e os emojis da Apple, idêntico ao celular. Em outros computadores, entra a Inter (parecida com a SF Pro) e os emojis do Google. O template do Google usa a Google Sans. As fontes livres ficam em `posts/fontes/`.
