# Loja de moedas — configuração segura do Mercado Pago

## Estado na entrega 0.24.0

**Vendas desativadas.** O projeto não tem credenciais Mercado Pago. A chave Pix informada pelo proprietário não foi usada como credencial nem como destino presumido. Não foram realizadas cobranças reais. A homologação no sandbox oficial ainda depende das credenciais de teste; testes de contrato com fixtures e testes transacionais no banco não a substituem.

Loja publicada: cinco pacotes, Pix via Payments API, cartão à vista via Checkout Pro hospedado, pedidos por conta, consulta após reconexão, histórico paginado e processamento de notificações. O jogo não recebe número de cartão/CVV. CPF do pagador, quando necessário ao Pix, é enviado ao Mercado Pago e não fica no banco, log ou armazenamento do jogo.

## Onde cadastrar os valores

Use **Vercel → projeto fazendinha-wj → Settings → Environment Variables**. Segredos devem ter tipo **Secret**, sem prefixo VITE_, e ambientes separados. Não envie tokens, segredo de webhook ou arquivos de credenciais pelo chat ou por Git.

### Preview / homologação (banco isolado)

- `MP_ACCESS_TOKEN`: Access Token de testes fornecido na aplicação Mercado Pago da conta recebedora.
- `MP_WEBHOOK_SECRET`: assinatura secreta das notificações dessa aplicação/ambiente.
- `MP_COLLECTOR_ID`: ID do vendedor esperado, conferido pelo proprietário no Mercado Pago.
- `MP_MODE=test`.
- `MP_APP_ORIGIN`: origem HTTPS exata do preview de homologação, sem barra final.
- `MP_TEST_CHECKOUT_ENABLED=true`.
- `DATABASE_URL`: conexão do branch isolado de testes; nunca usar dados de jogadores para a homologação.

O servidor consulta `/users/me`, exige ID igual ao configurado e site MLB. Pagamentos devem retornar o mesmo `collector_id`, referência do pedido, método, valor, BRL e `live_mode=false`. Sandbox não é habilitado no ambiente Vercel Production.

### Produção — somente após homologação e revisão do proprietário

Configure Access Token **de produção**, segredo de notificações **de produção**, ID do vendedor esperado e:

- `MP_MODE=production`.
- `MP_APP_ORIGIN=https://fazendinha-wj.vercel.app`.
- `MP_ACCOUNT_VERIFIED=true` apenas depois de conferir que `/users/me` corresponde à sua conta, comparando o ID no painel Mercado Pago. O telefone Pix sozinho não comprova isso.
- `MP_SANDBOX_VALIDATED=true` apenas depois de executar todos os cenários de homologação abaixo no provedor.
- `MP_FEES_ACKNOWLEDGED=true` apenas depois de revisar as taxas/prazos reais da sua conta.
- `MP_SALES_ENABLED=true` como último passo, após a revisão.

Faça novo deployment depois de alterar variáveis. Sem qualquer requisito, a interface mostra indisponibilidade e o backend recusa criar pagamentos. É possível pausar novas vendas retirando `MP_SALES_ENABLED`; preserve token/segredo para continuar conciliando pagamentos e reembolsos anteriores.

`node --import tsx scripts/check-mp-setup.mjs` confere a configuração e o recebedor por API sem cobrar. Execute com as variáveis injetadas de forma segura; não passe tokens em argumentos da linha de comando. O script não imprime token nem segredo.

## Taxas, recebimento e preços

Valores ao jogador: 10.000/R$10; 20.000/R$20; 30.000/R$30; 40.000/R$40; 50.000/R$50. Pix tem validade de 30 minutos. Preferência de cartão tem validade de 24 horas e uma única parcela.

**Não foi possível determinar as taxas contratuais da conta sem acesso à integração. Elas ainda precisam ser informadas e aceitas pelo proprietário antes de ativar.** Consulte no Mercado Pago as condições de Checkout/API para Pix e cartão à vista e os prazos de disponibilidade escolhidos. Não adote uma porcentagem genérica como se fosse a taxa da sua conta. O valor bruto do pacote é fixo; a integração não adiciona taxa ao comprador. O líquido, as taxas retornadas pelo provedor e a data de liberação ficam registrados no pagamento para conciliação.

Cartão gera recebível no saldo da conta Mercado Pago identificada pelo token/collector_id, conforme as condições contratadas. Isso não é uma transferência Pix para a chave de telefone. Pix usa QR dinâmico gerado pela API, não um QR estático com crédito manual.

## Notificações

Configure no painel da aplicação o endpoint HTTPS `/api/mp-webhook` na origem correspondente ao ambiente. Habilite notificações de **pagamentos e contestações (chargebacks)** e guarde a assinatura secreta em `MP_WEBHOOK_SECRET`.

A assinatura HMAC SHA-256 de `x-signature` é validada com `data.id`, `x-request-id` e `ts`. O corpo não é prova de pagamento. Após a validação, o backend consulta o recurso oficial com seu token. Para chargeback, resolve `payment_id` pelo recurso oficial e consulta o pagamento.

Registre no sandbox uma notificação oficial aprovada e uma de alteração de status, validando a assinatura real gerada para esta aplicação. Reenviar a notificação não pode mudar o saldo novamente. Não há botão “Já paguei”, concessão por retorno do navegador ou aprovação por comprovante.

## Homologação obrigatória antes da produção

Com compradores/cartões de teste oficiais e banco isolado:

1. Pix pendente, aprovado, cancelado e expirado. Conferir QR/Copia e Cola, valor e validade; confirmar por API/webhook, não pelo retorno da tela.
2. Cartão aprovado, recusado, em análise; uma parcela, valor total exato e checkout no domínio Mercado Pago. Nenhuma cobrança real apenas para teste.
3. Repetição de criação, callback e webhook; chamadas simultâneas; alteração de pacote/valor; assinatura inválida; pagamento de outro vendedor/modo/pedido.
4. Fechar e reabrir checkout; recuperar pedido autenticado; recusar consulta por outra conta.
5. Reembolso integral/parcial e contestação; evento antigo fora de ordem e disputa revertida. Conferir histórico e saldo no banco.
6. Conferir o ID recebedor e as taxas/prazos reais no painel, antes das flags finais.

Esses cenários precisam ser realizados no **provedor** após fornecer as credenciais seguras. A entrega atual tem testes automatizados de contrato e de persistência, mas não certifica uma conta Mercado Pago ainda não configurada.

## Reembolsos, contestação e auditoria

Cada pagamento tem crédito próprio e ledger de movimentos, imunes a reenvios. Reembolso parcial remove proporcionalmente as moedas; reembolso integral/contestação remove o crédito. Se o saldo já tiver sido gasto, ele fica em zero e a diferença vira ajuste explícito (`coinDebt`). Ganhos futuros abatem esse ajuste. Itens adquiridos e progressos não são apagados. Uma contestação resolvida a favor do vendedor restaura apenas o direito líquido oficial, sem crédito repetido. Histórico registra os movimentos; nada é apagado silenciosamente.

Caso duas cobranças efetivamente diferentes sejam aprovadas para o mesmo pedido, cada pagamento real validado tem sua entrega e ledger próprios; o histórico expõe os pagamentos e o total. Repetições de clique normalmente reutilizam o pedido/preferência, e reenvios do mesmo pagamento não criam uma segunda entrega. Não emitir reembolsos automáticos nem movimentar dinheiro da conta do proprietário para testar.

As tabelas retêm referências internas e dados mínimos financeiros. Não guardam CPF, e-mail do pagador, número de cartão, CVV ou corpo completo de notificações. Falhas de conciliação retornam erro para nova tentativa do provedor; registros não processados ficam em `store_webhook_events`.

## Referências consultadas

Contratos atuais do SDK oficial Mercado Pago (fonte primária, consultada nesta implementação):

- https://github.com/mercadopago/sdk-nodejs/blob/master/src/clients/payment/create/types.ts
- https://github.com/mercadopago/sdk-nodejs/blob/master/src/clients/payment/commonTypes.ts
- https://github.com/mercadopago/sdk-nodejs/blob/master/src/clients/preference/commonTypes.ts
- https://github.com/mercadopago/sdk-nodejs/blob/master/src/clients/preference/search/types.ts
- https://github.com/mercadopago/sdk-nodejs/blob/master/src/clients/chargeback/commonTypes.ts
- https://github.com/mercadopago/sdk-nodejs/blob/master/src/clients/chargeback/get/index.ts

As páginas web do portal Developers não retornaram conteúdo utilizável neste ambiente. Isso reforça a necessidade de validar assinatura e fluxos reais no sandbox da aplicação antes de ativar produção; não foi declarada homologação inexistente.

Recuperação de interrupções: a consulta oficial restaura QR/validade Pix e a preferência do cartão quando o provedor criou o recurso mas a resposta inicial se perdeu. A criação usa lease e chave de idempotência; consultas não criam cobranças. As funções e o cliente permitem tempo suficiente para conciliar, mantendo o histórico como caminho de recuperação.

Verifique também no painel da conta recebedora se o Pix está habilitado e se a chave informada pertence a ela. Essa verificação não é substituída pelo simples preenchimento de um telefone na aplicação.
