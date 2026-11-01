# Sentinela Nebulosa — R$ 10,00

Roupa original de armadura violeta, capacete vermelho, visor verde e manopla. Utiliza a versão visual 11 aprovada pelo proprietário. Acréscimo à aba Roupas; as três roupas existentes continuam com os respectivos preços e direitos.

## Compra e entrega

- Produto `outfit_nebula`, roupa `nebula`, preço inicial 1.000 centavos, sem moedas ou fertilizantes.
- Compra única e permanente na conta, com equipamento gratuito. Não é consumível e não modifica atributos econômicos.
- Pix e cartão usam o mesmo checkout hospedado Orders do Mercado Pago já existente. Preço, produto, versão, valor, método, ambiente, recebedor e aplicação são conferidos no servidor. Somente a confirmação obtida da API oficial libera a roupa.
- Endpoint não aceita valor enviado pelo cliente. Comando de compra por moedas é recusado para essa roupa. Já adquirida, novas compras são bloqueadas. Um pedido em andamento é reaproveitado; troca de método enquanto ele estiver aberto é recusada para evitar uma segunda cobrança.
- Pagamentos permanecem no ledger existente e ganham `credited_outfit`. As mudanças de direito são registradas em `outfit_movements`; múltiplas aprovações não duplicam o item.
- Reembolso integral, contestação ou mediação revogam o direito pago e retiram o equipamento, mantendo o restante do guarda-roupa e progresso. Reembolso parcial mantém o item indivisível. Outra aprovação válida ou presente administrativo mantém a propriedade. Eventos antigos/conflitantes e repetições não revertem decisões posteriores.
- Administrador pode conceder a roupa gratuitamente com auditoria. Esse presente fica separado do direito pago, para não desaparecer por reembolso de outro pedido. Preço e disponibilidade para novas compras podem ser editados em Pacotes, com versões imutáveis dos pedidos anteriores.

## Implantação

1. Aplicar 021: acrescenta estruturas, ledger e oferta INATIVA. Não atualiza personagens, saldos ou contratos existentes.
2. Publicar código com renderizador e protocolo 19. Clientes anteriores precisam recarregar.
3. Após o deploy READY e verificações, aplicar 022: ativa exclusivamente essa oferta por R$10, registra a aprovação e não concede roupas. Reexecução preserva posterior suspensão administrativa.

Não alterar credenciais ou criar cobranças reais para validar.

## Validação

364 testes e build aprovados. PGlite: migração repetida preserva estados, contratos de moedas/fertilizantes, entrega única, rejeição de valor divergente, eventos repetidos/antigos, reembolso integral/parcial, contestação, múltiplas aprovações, roupa equipada, presentes e demais bens. Publicação 022 é idempotente e preserva suspensão posterior.

Sandbox autenticado em 1280/390px: cartão da roupa com R$10, prévia animada, formulário Pix/cartão e contrato hospedado Orders criado com 0 moedas/R$10. Repetir devolve o mesmo pedido, preço adulterado e cliente antigo são recusados, método oposto em pedido aberto é bloqueado e nenhum direito é liberado antes do pagamento. Contas de teste preparadas com e-mail verificado; nenhum e-mail foi enviado a terceiros.

Concessão de fixture somente no sandbox permitiu conferir equipamento gratuito, quatro direções, reabertura, propriedade única, roupa antiga e saldo preservados e bloqueio de nova compra. Isso testa o guarda-roupa, não equivale à aprovação do pagamento no provedor.

Limite: o checkout de cartão foi criado no Mercado Pago de testes, mas sua página retornou erro ao acesso automatizado; não foi possível repetir a conclusão com cartão no provedor nesta sessão. Pix não está disponível na conta de testes já conhecida. Entrega/reembolso da nova roupa foram exercitados no ledger isolado e os contratos do provedor em testes automatizados, sem pagamento real. Fluxos gerais de aprovação/recusa/reembolso de cartão foram homologados anteriormente. Não apresentar essa validação como um novo pagamento real aprovado.
