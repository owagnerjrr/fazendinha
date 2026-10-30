## Estado atual — 30/10/2026

Vendas reais Orders habilitadas; Pix real validado anteriormente. Cartão/recusa/reembolso e repetição validados em sandbox. CRON_SECRET ausente em produção; reconciliação automática pendente. PR #2 ainda é rascunho, não integrado à main. **184 testes passaram nesta conferência.** Evidências, limites e continuidade em [Conferência de 30/10/2026](CONFERENCIA_2026_10_30.md).

Os registros abaixo descrevem etapas históricas; afirmações antigas sobre vendas desativadas, falta de credenciais ou homologação pendente foram superadas pelo registro atual.

---

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
- Branch `codex/mercadopago-orders`, com Preview protegido no projeto principal.
- Endpoint público em projeto dedicado `fazendinha-wj-mp-test`: https://fazendinha-wj-mp-test.vercel.app/api/mp-webhook. Sua publicação usa o slot Production desse projeto de testes, sem promover o jogo principal.
- Neon branch existente `dev-store-wardrobe-024`, separado de produção, com migração aditiva `009_orders_api.sql`.
- Autenticação Neon do próprio branch de teste, sem reutilizar o endpoint de produção.
- Token de testes fornecido pelo proprietário cadastrado como Secret em Preview e no projeto dedicado de homologação; nunca no ambiente Production do jogo principal. `MP_APPLICATION_ID` e `MP_COLLECTOR_ID` são da conta de testes mostrada no painel.
- Novas compras seguem bloqueadas (`MP_TEST_CHECKOUT_ENABLED=false`). Falta cadastrar a assinatura real do webhook em `MP_WEBHOOK_SECRET`; não foi usado segredo inventado.

## Validação e limites
178 testes automatizados passam, incluindo oito cenários adicionais de Orders: criação/restrições, vínculo financeiro, estados sem crédito, refund/contestação/QR, assinatura HMAC e chave única do ledger. Testes de contrato usam fixtures; não equivalem à homologação no provedor.

O servidor deve ser publicado e o endpoint deve ser acessível pelo Mercado Pago antes de salvar o webhook. Conferir em homologação a assinatura real, o pagamento Pix, cartão aprovado/recusado, notificações repetidas e o jogo fechado. Habilitar produção requer as credenciais correspondentes e a validação da conta recebedora, com homologação concluída. Nenhuma cobrança real deve ser criada para realizar esses testes.

## Fontes primárias consultadas em 30/10/2026
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/create-order
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/notifications
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/payment-management/status/order-status
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/additional-settings/exclude-payment-methods
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/web-integration/configure-back-urls
- https://raw.githubusercontent.com/mercadopago/sdk-nodejs/master/src/clients/order/commonTypes.ts

O slot público do projeto dedicado só aceita modo de teste quando `MP_SANDBOX_PROJECT_ID` corresponde ao próprio ID da Vercel. O ID do jogo principal é explicitamente bloqueado nesse caminho. A proteção SSO dos previews existentes permanece intacta. O endpoint de saúde da Vercel confirmou que o token informado pertence à conta de testes esperada (sem cobrar e sem expor o token).


## Validação no provedor — 30/10/2026
- Assinatura do webhook cadastrada pelo proprietário como Secret no projeto dedicado; redeploy concluído. A saúde informa configuração presente, conta de testes verificada e checkout de testes habilitado. Produção do jogo permanece desativada.
- Requisição de webhook sem assinatura recusada com HTTP 401. Ainda falta comprovar uma notificação oficial assinada; a criação da order não gerou evento recebido nesta validação.
- `/v1/orders` aceitou a criação de cartão via checkout hospedado: `ORDTST01M6782DPQ7P44MRP0YRSKXB68`, 10.000 moedas / R$10,00, status pendente. Replay devolveu o mesmo pedido. API/banco confirmaram zero crédito e saldo inicial preservado. O pagamento de cartão ainda não foi concluído.
- A lista oficial de meios de pagamento da conta de teste não contém Pix. Portanto o sistema recusa gerar um Pix para essa conta; não foi usado QR inventado nem habilitada cobrança real para contornar a indisponibilidade.
- Corrigida exclusão indevida de bandeiras com IDs compartilhados entre crédito e pré-pago. O esquema real do provedor rejeitou `wallet` (apesar da documentação): as restrições agora usam o enum retornado pela API. 178 testes passam após a correção.
- Próxima validação: simular notificação `Order` usando o ID acima no painel Mercado Pago, conferir HTTP 200 e registro processado; depois concluir pagamento com comprador/cartão de teste oficiais, conferir entrega única e testar recusa/reembolso. Não marcar homologação concluída antes disso.

## Resultados confirmados no banco isolado
Cartao APRO concluido pelo proprietario: pedido aprovado, 10.000 moedas entregues, saldo de 50 para 10.050, um unico movimento apos tres notificacoes processadas. A entrega foi confirmada apos reenvio pelo simulador, nao como comprovacao de entrega automatica inicial.
Cartao OTHE recusado no checkout: webhook automatico validado com HTTP 200, zero credito e saldo 50. Pedido consolidado permaneceu pendente. Ajustado mapeamento para exibir recusado quando pedido aberto contem somente tentativas failed; tentativas ativas e aprovacoes mantem prioridade. Falta confirmar esse mapeamento na consulta real apos deploy. Pix continua ausente nos meios da conta de teste. Reembolso e demais cenarios ainda nao homologados no provedor. Producao desativada.
