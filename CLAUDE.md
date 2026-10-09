# Guia do Advento

Web app instalável (PWA) de 26 dias para jovens adultos católicos viverem o Advento: de 29/11 a 24/12/2026, com a retrospectiva final em 25/12. Todo dia o usuário ouve um santo, reza e cumpre uma missão. Funciona sozinho e melhor ainda em grupo. É um produto low ticket do Rafa, vendido pela Guru.

Toda a interface e todos os textos são em português do Brasil.

## Leia antes de qualquer coisa

1. `docs/escopo.md`: o escopo completo do produto (fonte da verdade).
2. `docs/plano-de-implementacao.md`: as fases, nesta ordem.
3. `docs/design-tokens.md`: cores, tipografia e medidas da interface.
4. `docs/vitral-style-guide.md`: o sistema de ilustração (Vitral Litúrgico Contemporâneo).
5. `design/telas/*.html` e `design/capturas/*.png`: as 6 telas de referência (Início, O Dia e Retrospectiva, nos modos Noite e Pergaminho).

## Como trabalhar neste projeto

- Implemente uma fase de cada vez. No fim de cada fase, publique um preview, resuma o que foi feito e pare para o Rafa revisar.
- Antes de começar, proponha o plano da fase e espere aprovação.
- O Rafa não é programador. Explique decisões em linguagem simples e peça a ele só o que só ele pode dar (contas, chaves, decisões de produto).
- Se algo não está nos documentos, pergunte. Não invente regra de produto, preço, texto religioso ou dado da Guru.
- Nunca escreva conteúdo religioso definitivo (textos dos santos, orações, missões). Use rascunhos marcados com `[RASCUNHO]`. O conteúdo real chega em levas semanais e passa por revisão doutrinal.
- Teste sempre no tamanho de 390 × 844 e no Safari do iPhone, onde as notificações de PWA têm mais restrições.
- Acessibilidade: botões de verdade, `aria-label` em botões só com ícone, contraste AA e alvos de toque de 44px ou mais.

## Stack

- Next.js (App Router, TypeScript) + Tailwind, com os tokens como variáveis CSS.
- Supabase: Postgres com RLS, Auth por link mágico, Storage para os áudios.
- PWA com service worker e Web Push (VAPID).
- Fontes: Fraunces (títulos) e DM Sans (interface), via `next/font/google`.
- Deploy: sugestão Vercel, a confirmar.

## Regras de domínio

- **Calendário:** dia N = 29/11/2026 + (N − 1). Fuso America/Sao_Paulo. A porta abre à 00:00 local. Datas futuras ficam fechadas, mesmo que o conteúdo já exista.
- **Dia completo:** Ouvir + Rezar + Agir. Fechar é opcional e alimenta a "frase que mais te marcou".
- **Sequência:** dias seguidos completos. O dia perdido pode ser feito até o fim do dia seguinte sem quebrar a sequência.
- **Coroa:** as velas acesas são o número de domingos já alcançados. Ordem: roxa, roxa, rosa (13/12, Domingo da Alegria), roxa. Arquivos em `public/illustrations/coroa-0.svg` a `coroa-4.svg`.
- **Semana Gaudete (13 a 19/12):** o acento da interface muda para rosa (ver tokens).
- **Domingos:** santo convidado (Afonso, Agostinho, Bernardo e Newman, ordem a definir).
- **8/12:** Imaculada Conceição, conteúdo mariano próprio.
- **Antífonas do Ó (17 a 23/12):** uma letra por dia, que lidas de trás para frente formam ERO CRAS ("amanhã estarei aí"): 17 S (Sapientia), 18 A (Adonai), 19 R (Radix), 20 C (Clavis), 21 O (Oriens), 22 R (Rex), 23 E (Emmanuel).
- **Entrada tardia:** quem compra depois de 29/11 começa no dia corrente e pode recuperar os dias anteriores.
- **Antes de 29/11:** modo de espera (contagem regressiva, setup, grupo e convite).
- **Planos:** `simples` (R$ 20): textos, missões, coroa, sequência e retrospectivas. `completo` (R$ 47): tudo + áudios + grupo. Upgrade por R$ 27. No Simples, o conteúdo do Completo aparece com cadeado, nunca escondido.
- **Grupo:** a coroa do grupo acende só quando todos completam o dia. Sem ranking.
- **Retrospectivas:** semanais em 6, 13 e 20/12, final na manhã de 25/12, e coletiva no grupo. Todas geram uma imagem 9:16 para Stories.

## Modelo de conteúdo (proposta)

Um arquivo por dia em `content/dias/AAAA-MM-DD.json`. Os áudios ficam no Supabase Storage. O app precisa lidar com dias futuros ainda sem conteúdo.

```json
{
  "dia": 15,
  "data": "2026-12-13",
  "tipo": "domingo",
  "semana": 3,
  "santo": { "nome": "Santo Afonso de Ligório", "titulo": "Doutor da Igreja", "retrato": null },
  "titulo": "[RASCUNHO] Ninguém tem medo de uma criança",
  "citacao": { "texto": "[RASCUNHO]", "autor": "[RASCUNHO]" },
  "ouvir": { "slides": ["[RASCUNHO] trecho fiel do santo", "[RASCUNHO] explicação"], "audio": null, "duracao_seg": null },
  "rezar": { "texto": "[RASCUNHO]", "audio": null, "duracao_seg": null },
  "agir": { "missao": "[RASCUNHO]" },
  "ilustracao": { "arquivo": "anunciacao.svg", "credito": "A Anunciação · releitura a partir de Fra Angelico" },
  "antifona": null
}
```

`tipo`: `comum` | `domingo` | `solenidade` | `antifona` | `vespera`. Em `antifona`: `{ "letra": "S", "latim": "O Sapientia", "texto": "[RASCUNHO]" }`.

## Design

- A interface é quieta e a ilustração é a protagonista. Siga `docs/design-tokens.md` à risca.
- Sem vidro líquido, sem degradês e sem brilhos. Desfoque só na barra de navegação.
- As ilustrações em `public/illustrations/` são **provisórias**. As artes finais do Rafa vão substituí-las com os mesmos nomes de arquivo e proporções.
- Ilustrações entram sem moldura nem cartão por trás. Elas já trazem o próprio campo de luz.

## Perguntas em aberto (confirmar com o Rafa quando chegar a hora)

- Data de início das vendas.
- O webhook da Guru vai direto para o app ou passa pelo sistema próprio do Rafa, que já recebe webhooks da Guru?
- Quantas contas a licença família libera e como o guia de confissão é entregue (PDF no app ou por e-mail).
- Domínio do app e conta de deploy.
- Quem faz a revisão doutrinal do conteúdo.
