# Landing page · Guia do Advento

Página de vendas. Protótipo validado como artifact (versão 7) e salvo em `design/landing/prototipo.html`.

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

- **Pré-venda:** começa nesta semana, com preço promocional até 28/11. A página traz a faixa do topo, a etiqueta "Pré-venda" na primeira dobra, a contagem até o fim da pré-venda nos planos, o passo a passo "Comprou na pré-venda?" e duas perguntas no FAQ.
- **Acesso vitalício:** aparece embaixo do botão de compra, nos dois planos, na faixa de confiança, no FAQ e nos Termos.

## Pendências

- [ ] **Depoimentos reais** (o Rafa vai enviar): colher de quem testar o app antes da venda (foto, nome, cidade ou print de Stories).
- [ ] **Links de checkout da Guru** (conversar com o Rafa): Simples e Completo. A barra fixa e o fecho hoje levam aos planos.
- [x] **Garantia:** 7 dias contados a partir de 29/11 (ou da compra, se for depois de 29/11). Aparece na página, nas perguntas frequentes e nos Termos.
- [ ] **Rodapé** (o Rafa vai enviar): razão social, CNPJ, e-mail de contato e Instagram.
- [x] **Páginas legais:** Termos de uso e Política de privacidade (LGPD) incluídos no protótipo, em versão simples. A página de política de reembolso foi descartada. Faltam razão social, CNPJ, contato e data de atualização (junto com os dados do rodapé). Vale uma leitura de um advogado antes de anunciar.
- [ ] **Capturas das telas:** mostram conteúdo `[RASCUNHO]` (título e citação do dia) e o nome "Ana". Trocar por capturas com conteúdo revisado antes de anunciar.
- [x] **Imagens dos santos:** o Rafa confirmou que todas são de domínio público.
- [ ] **Papéis de parede:** é uma funcionalidade nova no app (tela de escolha) e precisa entrar no plano de implementação. As artes devem vir em formato de tela de celular. Confirmar se o bônus vale para todos os planos.
- [ ] **"Acesso por e-mail na hora":** depende de como o webhook da Guru chega ao app (pergunta em aberto no CLAUDE.md).
- [ ] **"Pagamento único":** confirmar a configuração na Guru.
- [ ] **Para anunciar:**
  - imagem de prévia para links (WhatsApp, Meta)
  - favicon
  - Pixel da Meta
  - domínio
- [ ] **Preço depois da pré-venda:** quanto custa cada plano a partir de 29/11 (aparece como "A definir" nos planos). Confirmar se o Simples também tem preço de pré-venda.
- [ ] **Fim da pré-venda:** confirmar 28/11. Depois dessa data, a página precisa trocar os textos de pré-venda (e a Guru, o preço).
- [ ] **"Vitalício" no app:** depois de 25/12, as portas e as retrospectivas continuam abertas. Definir se o app abre de novo nos próximos Advents para quem já comprou (hoje a página não promete isso).
- [ ] **Revisão final do texto de venda.**
