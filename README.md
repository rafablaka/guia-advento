# Guia do Advento

Pacote de implementação do app Guia do Advento: escopo, design e plano em fases, prontos para o Claude Code construir o app.

## O que tem aqui

| Pasta ou arquivo | O que é |
| --- | --- |
| `CLAUDE.md` | Instruções que o Claude Code lê primeiro: regras do produto, stack e como trabalhar |
| `docs/escopo.md` | Escopo completo do produto |
| `docs/plano-de-implementacao.md` | As 7 fases de construção, da base às métricas |
| `docs/design-tokens.md` | Cores, fontes e medidas da interface |
| `docs/vitral-style-guide.md` | Guia do estilo de ilustração |
| `design/telas/` | As 6 telas de referência em HTML (abra no navegador) |
| `design/capturas/` | Imagens das 6 telas. Aqui as fontes aparecem trocadas por uma serifada padrão; no app serão Fraunces e DM Sans |
| `public/illustrations/` | Coroa (0 a 4 velas) e Anunciação. **Provisórias**, para trocar pelas artes finais |

## Como usar com o Claude Code

1. Abra este repositório no Claude Code (no computador ou em claude.ai/code).
2. Mande o primeiro pedido:

   > Leia o CLAUDE.md e todos os arquivos em docs/ e design/. Depois me explique, em linguagem simples, o plano da Fase 0 e o que você vai precisar de mim (contas, chaves). Não programe ainda.

3. Aprove o plano e deixe ele construir a fase. No fim de cada fase, ele publica um preview e para para você revisar.
4. Repita para as próximas fases, na ordem do plano.

## Para trocar as artes provisórias

Salve as artes finais em `public/illustrations/` com os mesmos nomes (`coroa-0.svg` a `coroa-4.svg`, `anunciacao.svg`) e as mesmas proporções (coroa 4:3, ilustração do dia 340 × 292). As novas artes (santos, Antífonas, Natividade, ícone) entram como arquivos novos. Peça ao Claude Code para ligá-las.

## Estado atual (versão de teste)

O app está construído das Fases 0 a 6, exceto a integração com a Guru. Enquanto a Guru não entra:

- **Qualquer e-mail consegue entrar** e começa no plano Completo.
- Em **Você → Ferramentas de teste** dá para simular qualquer data, trocar de plano, completar dias passados e recomeçar a jornada.
- O painel de métricas fica em **Você → Painel de métricas**.
- Todo o conteúdo religioso está marcado como `[RASCUNHO]` (`content/dias/`). O áudio `public/audio/exemplo.wav` é só um som de teste.

Para desligar o modo de teste, defina `NEXT_PUBLIC_MODO_TESTE=0` na Vercel e `modo_teste = false` na tabela `config_privada` do Supabase.

### Onde fica cada coisa

| Pasta | O que é |
| --- | --- |
| `app/` | As telas do app (Início, O Dia, Caminho, Grupo, Você, Retrospectivas, Painel) |
| `components/` | Peças reaproveitadas (coroa, portas, player, barra de navegação) |
| `lib/` | Regras do calendário, sequência, conteúdo e retrospectivas |
| `content/dias/` | Um arquivo por dia. O conteúdo real substitui os rascunhos com o mesmo nome |
| `supabase/migrations/` | Estrutura do banco (já aplicada no projeto Supabase `guia-do-advento`) |
| `public/sw.js` | Service worker: funciona sem internet e recebe as notificações |

### Notificações

Um agendador dentro do banco (pg_cron) roda a cada 5 minutos, decide quem recebe lembrete (no máximo 2 por dia) e chama `/api/notificacoes/enviar`. As chaves das notificações ficam guardadas no banco, não no código.
