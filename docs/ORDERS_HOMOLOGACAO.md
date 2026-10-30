# Orders API — ambiente de homologação

Esta branch migra novas compras para Checkout Pro via Orders. Produção permanece na versão anterior, com vendas desativadas; não foi executada migração no banco de produção.

## Implementação
- `MP_API=orders` seleciona a nova API; cada pedido grava a API utilizada e o identificador imutável do provedor. Pedidos legados conservam sua conciliação original.
- Pix e cartão abrem o checkout hospedado do Mercado Pago, que apresenta QR/Copia e Cola no Pix e coleta dados de cartão. Dados Pix retornados na consulta oficial também podem aparecer no histórico do jogo.
- Criação usa chave de idempotência do pedido local, preço do catálogo no servidor, uma parcela e restrições de meios de pagamento. Uma resposta perdida é recuperada repetindo a mesma criação idempotente.
- Webhook assinado `order` consulta `/v1/orders/{id}` com token privado. Confere vendedor, aplicação, ambiente, país, moeda, referência, valor e método antes de alterar o saldo.
- Crédito usa um único ledger por order, com a mesma função transacional existente: reenvios não duplicam, eventos antigos não sobrescrevem novos e reembolsos removem o direito proporcional.
- Contestações presentes na resposta oficial suspendem o crédito. Casos encerrados continuam conservadoramente sem crédito até conciliação que comprove a resolução; não se presume vitória do vendedor pelo status `closed`.
- `GET /api/mp-webhook` informa disponibilidade sem revelar credenciais. `POST` sem configuração/assinatura válida jamais credita moedas.

## Ambiente
- Vercel Preview, branch `codex/mercadopago-orders`.
- Neon branch existente `dev-store-wardrobe-024`, separado de produção, com migração aditiva `009_orders_api.sql`.
- Autenticação Neon do próprio branch de teste, sem reutilizar o endpoint de produção.
- Token fornecido pelo proprietário cadastrado como Secret apenas em Preview. `MP_APPLICATION_ID` e `MP_COLLECTOR_ID` são da conta de testes mostrada no painel.
- Novas compras seguem bloqueadas (`MP_TEST_CHECKOUT_ENABLED=false`). Falta cadastrar a assinatura real do webhook em `MP_WEBHOOK_SECRET`; não foi usado segredo inventado.

## Validação e limites
176 testes automatizados passam, incluindo seis cenários adicionais de Orders: criação/restrições, vínculo financeiro, estados sem crédito, refund/contestação/QR, assinatura HMAC e chave única do ledger. Testes de contrato usam fixtures; não equivalem à homologação no provedor.

O servidor deve ser publicado e o endpoint deve ser acessível pelo Mercado Pago antes de salvar o webhook. Conferir em homologação a assinatura real, o pagamento Pix, cartão aprovado/recusado, notificações repetidas e o jogo fechado. Habilitar produção requer as credenciais correspondentes e a validação da conta recebedora, com homologação concluída. Nenhuma cobrança real deve ser criada para realizar esses testes.

## Fontes primárias consultadas em 30/10/2026
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/create-order
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/notifications
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/payment-management/status/order-status
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/additional-settings/exclude-payment-methods
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/web-integration/configure-back-urls
- https://raw.githubusercontent.com/mercadopago/sdk-nodejs/master/src/clients/order/commonTypes.ts
