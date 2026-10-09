# Plano de implementação · Guia do Advento

O app precisa estar no ar, testado no iPhone e no Android, antes de 29/11/2026 (1º domingo do Advento). Também precisa estar pronto antes do início das vendas, cuja data ainda não foi definida. A tela de espera (Fase 3) tem que existir quando as vendas abrirem.

Cada fase termina com um preview publicado e uma pausa para o Rafa revisar. Não comece a fase seguinte sem aprovação.

## Fase 0 · Base

- Next.js (App Router, TypeScript), Tailwind com os tokens de `docs/design-tokens.md` como variáveis CSS, Fraunces e DM Sans via `next/font/google`.
- Modo Noite e Pergaminho (segue o sistema por padrão, com escolha manual em "Você").
- PWA: manifest, ícones provisórios, service worker, tela de abertura.
- Supabase: projeto, cliente, migrações versionadas no repositório.
- Deploy de preview (sugestão: Vercel, a confirmar com o Rafa).
- **Pronto quando:** o app instala na tela inicial do iPhone e do Android e abre uma tela vazia nos dois modos.

## Fase 1 · Conta, planos e compra

- Login por link mágico no e-mail (Supabase Auth). Sem senha.
- Webhook da Guru (Digital Manager Guru): ao aprovar uma compra, cria ou atualiza o usuário pelo e-mail com o plano (`simples` ou `completo`) e os order bumps. Validar a assinatura ou o token do webhook. Ler a documentação atual da Guru antes de modelar o payload. Não inventar campos.
- Reembolso ou chargeback na Guru remove o acesso.
- Controle de acesso por plano. Simples: sem áudio e sem grupo. Completo: tudo.
- Upgrade do Simples para o Completo: produto separado na Guru (R$ 27) que troca o plano.
- **Pronto quando:** uma compra de teste na Guru libera o acesso certo e o upgrade troca o plano.

## Fase 2 · Jornada (o coração do app)

- Calendário: dia 1 = 29/11/2026, dia 26 = 24/12/2026. Fuso America/Sao_Paulo. A porta do dia abre à 00:00 local.
- Modelo de conteúdo em arquivos (`content/dias/AAAA-MM-DD.json`, ver CLAUDE.md), com 3 dias de exemplo marcados como `[RASCUNHO]`.
- Telas Início, O Dia (Ouvir em formato stories, Rezar com player de áudio, Agir com a missão) e Fechar (check da noite, 2 ou 3 toques), seguindo `design/telas/`.
- Progresso: o dia conta como completo com Ouvir, Rezar e Agir. Sequência (streak) com tolerância: o dia perdido pode ser feito até o fim do dia seguinte sem quebrar a sequência.
- Coroa: o número de velas acesas é o número de domingos já alcançados (0 a 4). Usar `public/illustrations/coroa-N.svg`.
- Caminho: as 26 portas, com recuperação de dias perdidos.
- Quem entra depois de 29/11 começa no dia corrente, e os dias anteriores ficam abertos para recuperar.
- Variações: domingos (santo convidado), 8/12 (Imaculada, conteúdo mariano), 17 a 23/12 (Antífonas do Ó, com a reflexão de cada antífona), 24/12 (fechamento).
- Plano Simples: Ouvir e Rezar em texto. O áudio aparece bloqueado, com prévia de alguns segundos e o botão "Ouvir no Completo".
- **Pronto quando:** dá para simular qualquer data entre 29/11 e 25/12 (com uma data de teste configurável) e ver o estado correto.

## Fase 3 · Espera e onboarding

- Antes de 29/11, o Início vira a tela de espera: contagem regressiva com a coroa apagada (`coroa-0.svg`), setup antecipado e convite compartilhável.
- Onboarding: como funciona, instalação na tela inicial (com instruções específicas para o Safari do iPhone), horário do lembrete e escolha entre solo ou grupo.
- Notificações Web Push (chaves VAPID), no máximo 2 por dia, com as regras da seção 11 do escopo.
- **Pronto quando:** um iPhone com o app instalado recebe o lembrete no horário escolhido.

## Fase 4 · Grupo (só no Completo)

- Criar um grupo e convidar por link. Entrar por link. Sem chat, sem feed e sem ranking.
- A coroa do grupo do dia só acende quando todos completam o dia. O Início mostra "4 de 5 já rezaram hoje".
- Notificação "Só falta você para acender a coroa".
- Licença família (order bump): libera contas extras. Quantas, ainda em aberto.

## Fase 5 · Retrospectivas e compartilhamento

- Retrospectiva semanal nos domingos 6, 13 e 20/12 e final na manhã de 25/12, como em `design/telas/retrospectiva-*.html`.
- Imagem 9:16 gerada no servidor para os Stories, com a marca e o link de compra (por exemplo, com `next/og`).
- Versão coletiva do grupo e convite de pré-venda.

## Fase 6 · Métricas

- Tabela de eventos com as métricas da seção 14 do escopo: conclusão (jornada e semana 1), ativação (instalou e ativou as notificações), upgrade, compartilhamento, vendas por indicação (parâmetro no link), grupos e order bumps.
- Uma página simples, só para o Rafa, com esses números.

## Fora da v1

Ranking, quiz inicial, chat ou feed no grupo, diário com texto livre e outros tempos litúrgicos. Ver a seção 15 do escopo.
