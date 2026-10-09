# Estado do projeto

Atualize este arquivo no fim de cada conversa. Ele existe para a próxima conversa retomar sem reler os documentos todos.

Última atualização: 09/10/2026

## Já feito

- Fases 0 a 6 do plano construídas (base, conta e planos, jornada, espera e onboarding, grupo, retrospectivas, métricas), **exceto a integração com a Guru**.
- App em modo de teste: qualquer e-mail entra no plano Completo. Ferramentas de teste em Você → Ferramentas de teste (simular data, trocar plano).
- Supabase `guia-do-advento` com migrações aplicadas. Deploy de preview na Vercel.
- Todo o conteúdo religioso é `[RASCUNHO]`. Artes e áudio são provisórios.

## Pendente

1. **Checkout e pagamento (Guru + processador).** Em definição. Ver "Decisões".
2. **Webhook da Guru** (Fase 1): criar usuário e plano, reembolso remove acesso, upgrade de R$ 27, order bumps. Depende do item 1. Ler a documentação atual da Guru antes de modelar o payload.
3. Desligar o modo de teste (`NEXT_PUBLIC_MODO_TESTE=0` na Vercel e `modo_teste = false` em `config_privada`).
4. Conteúdo real dos 26 dias (chega em levas semanais, com revisão doutrinal).
5. Artes finais e áudios reais.
6. Teste no iPhone (instalação e notificações).
7. Domínio do app.

## Decisões

- Compra pela Guru. A Guru não processa pagamento: precisa de um processador conectado.
- Pagar.me (hoje aparece como Stone no painel da Guru) tem integração na Guru. Cadastro por indicação e taxas sob negociação. Asaas e Mercado Pago também têm integração documentada. **Escolha ainda em aberto.**

## Perguntas em aberto

- Data de início das vendas.
- O webhook da Guru vai direto para o app ou passa pelo sistema do Rafa?
- Quantas contas a licença família libera e como o guia de confissão é entregue.
- Domínio e conta de deploy.
- Quem faz a revisão doutrinal.
