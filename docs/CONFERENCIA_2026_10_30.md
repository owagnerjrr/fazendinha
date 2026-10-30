## Estado conferido — 30/10/2026

Este registro prevalece sobre os relatos históricos abaixo.

### Evidências desta conferência
- Produção: alias fazendinha-wj.vercel.app no deploy dpl_CfZuGbwnWj47z6rX5y1Zsn4w6JFM, READY, commit 2f01a0282d34262eaceb6ecc421704bb567774d3. Status Vercel no GitHub: success.
- Branch codex/mercadopago-orders no mesmo commit; main em c3eee6358bb999b4ec61eb541fe0d7a9eba6a781, ancestral 15 commits atrás. PR #2 aberto, rascunho, não integrado e mergeável segundo GitHub. Sua descrição ainda retrata a fase inicial.
- Página pública HTTP 200. GET /api/mp-webhook HTTP 200, Orders, ready=true e salesEnabled=true. testAccountVerified=false é esperado em produção: esse campo só consulta conta em modo teste.
- Projeto isolado fazendinha-wj-mp-test READY; saúde HTTP 200, ready=true, testAccountVerified=true e salesEnabled=true no sandbox.
- Logs da última hora consultada: duas notificações assinadas do mesmo recurso processadas com HTTP 200; nenhuma entrada error/fatal. Logs não demonstram sozinhos saldo/ledger nem garantem ausência de falhas fora da janela.
- Metadados das variáveis de Production consultados sem descriptografar valores: token e assinatura presentes como sensitive; flags de produção presentes. CRON_SECRET ausente; Vercel informa zero variáveis de produção ocultas.
- vercel.json agenda /api/mp-reconcile em 0 6 * * *: 06h UTC / 03h de São Paulo. Handler exige Bearer com segredo de pelo menos 32 caracteres; sem ele retorna 401 antes de acessar banco/provedor. Consulta pública retornou 401. A reconciliação automática está pendente de configuração em produção; execução autenticada não foi disparada.
- Catálogo confirmado: 10.000/R$10, 20.000/R$20, 30.000/R$30, 40.000/R$40 e 50.000/R$50. Pix e cartão novos usam checkout hospedado Orders; pedidos legacy preservam o caminho anterior.

### Histórico informado pelo proprietário, sem repetição nesta conferência
- Sandbox: cartão aprovado e recusado; notificações repetidas sem crédito duplicado; reembolso integral retirando moedas uma única vez. Pix indisponível nessa conta de testes.
- Produção: Pix real de R$10 aprovado, entrega única de 10.000 moedas para Wagner. Último saldo informado: 12.255, referência histórica que pode mudar e jamais deve ser restaurada por esta documentação.
- Collector 212340658 e aplicação 6764936069161189 verificados anteriormente. Migração 009 aplicada aditivamente em produção, preservando pedidos legacy. Não houve nova consulta ao provedor ou banco para revalidar esses fatos.
- Cartão e reembolso reais permanecem sem teste; validação desses fluxos foi em sandbox.

### Pendências e continuidade
1. Cadastrar CRON_SECRET aleatório forte como segredo em Production do projeto principal, incorporar em novo deploy revisado e comprovar ativação do cron e execução autenticada por registros. A rotina GET altera checked_at e pode atualizar moedas conforme prova oficial: não é leitura pura. Não reutilizar credenciais de teste. POST administrativo de reembolso é exclusivo do sandbox.
2. Atualizar descrição do PR #2, concluir revisão e integrar pelo fluxo do repositório após conferir proteções e checks. Não resetar main nem publicar seu estado antigo, que perderia Orders. AGENTS.md exige português, ausência de segredos, preservação de progresso e testes/build em mudanças relevantes. Proteções remotas não foram confirmadas: conector disponível não expõe essa consulta e gh não está instalado. Mergeável não significa aprovado.
3. Reconciliador processa no máximo dez pedidos Orders dos últimos 45 dias por execução, priorizando checked_at. Avaliar cobertura de volume e reversões tardias.
4. Nenhum merge, push, deploy, migração, cobrança, pagamento ou reembolso foi executado nesta conferência. Banco de produção não foi acessado; nenhuma conta, saldo, personagem, roupa, animal, plantação ou progresso foi alterado. Saúde HTTP não certifica sessão de jogador ou fluxo visual completo.

---


### Verificação local
- npm ci concluído com avisos de peer dependencies; auditoria automática relatou 16 vulnerabilidades (6 baixas, 2 moderadas, 7 altas, 1 crítica), sem triagem de alcance nesta conferência. Nenhuma atualização automática foi aplicada.
- npm test: 184 testes passaram, zero falhas, zero ignorados. npm run build aprovado (TypeScript, Vite e PWA). Avisos de anotações de dependências e tamanho de bundle, sem falha.
