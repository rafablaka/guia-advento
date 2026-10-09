# Landing page · Guia do Advento

Página de vendas. Protótipo validado como artifact (versão 4) e salvo em `design/landing/prototipo.html`.

## Decisões

- **Endereços:** landing e app em projetos separados na Vercel. Por enquanto, os dois ficam em endereços `.vercel.app`. Com o domínio próprio, a landing vai para o domínio principal e o app para `app.` (quem já comprou vai precisar reinstalar o app, e vamos avisar).
- **Construção:** feita neste repositório, com o visual do app.
- **Modelos:** a primeira dobra segue o Hallow (Quaresma); o restante segue o Mapa da Bíblia.
- **Ordem das seções:**
  1. Faixa que corre no topo: "Faltam X dias para o Advento ✦ Começa no domingo, 29 de novembro"
  2. Primeira dobra em tela cheia, com os santos e o botão "Quero ver" no pé, que leva às telas do app
  3. Por dentro do app (carrossel de telas) e o primeiro botão de compra
  4. O que você recebe: santos, áudio e missão
  5. Depoimentos
  6. Como é um dia
  7. A jornada (4 semanas, 4 velas)
  8. Bônus
  9. Planos (Completo primeiro, com fundo escuro), seguidos da garantia
  10. Perguntas frequentes
  11. Fecho
  12. Rodapé
- **Botões:** toda ação de venda usa o mesmo botão de vidro líquido dourado. Ele foge do visual do app de propósito, para não se confundir com as telas. O único botão diferente é o do plano Simples, com contorno. Depois do primeiro botão de compra, aparece uma barra fixa embaixo, que some na seção de planos.
- **Fica de fora:**
  - menção a "não é app de loja" e "iPhone e Android" (desvaloriza o produto)
  - Antífonas do Ó e ERO CRAS
  - preço riscado
  - contador de clientes
- **Bônus:**
  1. Advento em grupo (Completo)
  2. Retrospectivas para os Stories
  3. Papéis de parede do Advento: coleção temática para escolher dentro do app, sem número fixo na página

## Pendências

- [ ] **Depoimentos reais:** colher de quem testar o app antes da venda (foto, nome, cidade ou print de Stories).
- [ ] **Links de checkout da Guru:** Simples e Completo. A barra fixa e o fecho hoje levam aos planos.
- [ ] **Prazo da garantia:** está em 7 dias, o mínimo legal.
- [ ] **Rodapé:** razão social, CNPJ, e-mail de contato e Instagram.
- [ ] **Páginas legais:** Termos de uso, Privacidade e Política de reembolso. Os links do rodapé ainda não levam a lugar nenhum.
- [ ] **Capturas das telas:** mostram conteúdo `[RASCUNHO]` (título e citação do dia) e o nome "Ana". Trocar por capturas com conteúdo revisado antes de anunciar.
- [ ] **Direitos das imagens dos santos:** confirmar que os quatro retratos são de domínio público ou licenciados. O de Newman parece uma pintura recente.
- [ ] **Papéis de parede:** é uma funcionalidade nova no app (tela de escolha) e precisa entrar no plano de implementação. As artes devem vir em formato de tela de celular. Confirmar se o bônus vale para todos os planos.
- [ ] **"Acesso por e-mail na hora":** depende de como o webhook da Guru chega ao app (pergunta em aberto no CLAUDE.md).
- [ ] **"Pagamento único":** confirmar a configuração na Guru.
- [ ] **Para anunciar:**
  - imagem de prévia para links (WhatsApp, Meta)
  - favicon
  - Pixel da Meta
  - domínio
- [ ] **Revisão final do texto de venda.**
