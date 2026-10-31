# Central administrativa — implementação em andamento

Esta entrega é a base administrativa, não a central de criação completa solicitada.

## Acesso

Abra `/admin/` depois de entrar no jogo. A API verifica o JWT existente, o bloqueio da conta e a associação em `studio_admins`. A tabela admite somente uma conta; não existe inscrição pública de administradores. O código de amigo serve apenas para o operador localizar o identificador interno, nunca como credencial. A conta de QA do sandbox deve ser diferente da conta administradora de produção.

## Disponível

- Cadastro, edição e duplicação de definições, com identificadores UUID independentes dos nomes atuais.
- Histórico de rascunhos e versões imutáveis de publicação. Restauração cria novo rascunho e não restaura fazendas.
- Grupos persistentes; públicos administrador, contas específicas, grupos, novos cadastros ou todos, com nível mínimo e percentual estável.
- Prévia das contas afetadas e publicação de **definições no catálogo**, com suspensão sem exclusão de compras ou progresso.
- Consulta de contas, progresso salvo, pedidos e trilha administrativa, sem tokens ou dados de cartão.
- Alterações exigem motivo e identificador de operação; recibo idempotente impede repetir alterações em uma resposta perdida.
- Atividade coletada a partir desta implantação: heartbeat a cada 20 segundos enquanto a página estiver visível, foco e entrada recente (30 segundos). Ativo significa heartbeat há até 45 segundos e entrada há até 60 segundos. Tempo ativo é aproximado e não serve como prova de presença. Abas compartilham o relógio da conta, sem somar o mesmo intervalo duas vezes.
- Eventos de ações confirmadas, com revisão/saldo/XP, sem conteúdo de chat, teclas, email, IP ou credenciais. Eventos têm retenção de 90 dias e sessões 30 dias; limpeza diária oportunista no heartbeat. Agregados por conta e auditoria são mantidos. Não há histórico retroativo de sessões.

## Corrigir valores de uma conta

Em Jogadores, consulte a conta e escolha moedas, XP, ração, fertilizantes ou um item já registrado em sementes, colheitas, produtos ou cuidados. Confira o valor anterior e o novo, confirme e informe o motivo. A revisão da fazenda impede sobrescrever progresso concorrente. A opção de restaurar um ajuste modifica somente aquele valor e é bloqueada se ele já tiver mudado depois. Não substitui o estado inteiro da conta.

## Cadastrar e publicar uma definição

1. Em Criações, escolha Nova criação e informe tipo, nome, descrição, cor, preços e parâmetros estruturados.
2. Salve o rascunho com o motivo. Edições concorrentes usam revisão e recusam sobrescrever um rascunho mais recente.
3. Em Público e publicação, escolha o público e visualize as contas afetadas.
4. Publique a versão do catálogo. Ela passa a ser retornada por `/api/studio` somente para contas autorizadas pelo público.
5. Para recuperar uma configuração antiga, abra Versões e restauração e copie a versão para um rascunho. A publicação atual continua até uma nova publicação explícita.

**Publicar uma definição ainda não a transforma em conteúdo jogável.** Não use essa etapa como indicação de que um novo animal, roupa ou cenário funciona no jogo.

## Pendências antes de considerar o pedido completo

- Executor de conteúdo dinâmico integrado às espécies, roupas, economia e cenários do jogo.
- Catálogo de comportamentos com animações e prévia/teste isolado real.
- Editor visual de mapas, lago funcional, pesca, colisões e portas.
- Biblioteca/versionamento de imagens e áudio, validação dos arquivos e referências em uso.
- Configurações aplicadas efetivamente às regras existentes e à renderização.
- Concessões gratuitas de bens e roupas; validação de dependências e migrações de mapas individuais.
- Edição de animais, plantações, terrenos, roupas individuais, posição e permissões (somente valores numéricos básicos estão disponíveis).
- Gerência de pacotes de pagamento e reprocessamento validado (pedidos estão somente em consulta).
- Os sete exemplos completos pedidos pelo proprietário ainda não foram validados.

Não há execução livre de código, gerador automático de arte, aprovação simulada de pagamento ou substituição de dados reais por demonstração.

