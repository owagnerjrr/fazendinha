# Guardião da Clareira — R$ 15,00

Roupa permanente `forest`, pacote `outfit_forest`. Túnica e gorro verdes, luvas de couro, cabelo um pouco mais longo e equipamentos guardados nas costas em todas as poses. A roupa respeita a aparência escolhida pelo jogador; a prévia aprovada usa cabelo loiro. Não acrescenta combate.

Pix e cartão utilizam o checkout Orders existente. Preço inicial de 1.500 centavos validado no servidor. Não entrega moedas, não pode ser adquirida pelo comando de moedas e não é consumível. Equipar após aquisição é grátis. Presentes administrativos, pedidos em andamento e reembolso usam o ledger existente, distinguindo cada roupa.

Migração 023 prepara oferta inativa e amplia o ledger sem alterar fazendas ou contratos anteriores. Migração 024 ativa a oferta após a versão compatível estar publicada e pronta. Clientes do protocolo 19 não recebem nem podem comprar o produto novo; protocolo 20 o suporta. Conta com a roupa exige cliente atualizado.

Validação inicial: 366 testes passaram, incluindo entrega única, aprovação repetida, valor divergente, reembolso integral, eventos antigos, presente, múltiplos pagamentos e isolamento da Sentinela Nebulosa. Build aprovado. Migrações executadas na branch isolada de testes. Conferência no navegador e publicação em andamento. Nenhuma cobrança real foi criada.
## Conferência no ambiente isolado

- Deploy de testes dpl_CSUjFy4eafywbTgGZUWKMrabFZ71 READY, commit cc961ee29c93c79849ebd992492a6ca06f88ffac.
- Navegador autenticado em 1280px e 390px: cartão da roupa por R$15, prévia animada, formulário Pix/cartão, apenas o produto selecionado e pedido hospedado ORDTST com zero moedas/1.500 centavos.
- Repetição reaproveita o pedido; preço enviado pelo cliente, método oposto em pedido aberto e compra por cliente antigo são recusados. Nenhuma roupa foi liberada pelo pedido pendente. Saldo preservado.
- Presente de fixture exclusivamente a uma conta QA no sandbox: equipamento gratuito, caminhada nas quatro direções, reabertura, propriedade única e impedimento de nova compra. Nenhuma concessão em produção. Sem erros JavaScript.
- 366 testes aprovados. Ledger PGlite exercita aprovação, reembolso e eventos repetidos isoladamente para as duas roupas.
- Limite: não foi concluído novo pagamento no checkout do provedor. Pix da conta de testes continua indisponível; criação do pedido de cartão foi verificada, sem informar dados de cartão nem efetuar cobrança real. Presente de fixture não equivale a aprovação de pagamento.
- Migração 023 aplicada em produção com verificação transacional de igualdade integral das fazendas e pedidos antes/depois. Oferta permanece inativa até deploy compatível READY e aplicação de 024.

## Correção 0.48.1 — Guerreiro Link

O nome público passa a Guerreiro Link, mantendo o identificador forest/outfit_forest e o preço R$15. A migração 025 cria nova versão de nome da oferta, com auditoria, preservando versões e nomes dos pedidos anteriores. Não altera propriedade ou progresso.

O renderizador usa cabelo loiro e modelo curto próprio para essa roupa, com mechas alongadas e olhos azuis nas direções frontais/laterais. Independe do cabelo/chapéu do jogador. A aparência original salva não muda e reaparece ao retirar a roupa.

Prévia local conferida nas quatro direções e seis poses, inclusive iniciando com boné e cabelo castanho. 367 testes: configuração visual em todos os nove modelos originais, sem mutação da personalização; renomeação idempotente preservando preço, fazendas e versões antigas. Build validado.
