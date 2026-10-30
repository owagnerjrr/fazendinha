# Progressão e convites — 0.23.0

Novas fazendas online começam com 50 moedas, 6 sementes de cenoura, 6 canteiros e ferramentas básicas. Não recebem animais, ração, remédios ou outras sementes. O marcador `progressionVersion:1` aplica as novas liberações; fazendas anteriores preservam bens e acesso, sem reset.

| Nível | Liberações |
| --- | --- |
| 1 | Cenoura e 6 canteiros |
| 2 | Alface e compra da expansão para 12 canteiros |
| 3 | Morango, tulipa, galinha, pintinho e expansão para 18 |
| 4 | Tomate, pesca, galo, cachorro e expansão para 24 |
| 5 | Milho, vaca, cabra e decoração |
| 6 | Girassol, terrenos, construções e cultivo nas clareiras |

Liberação permite comprar; não entrega itens nem cobra automaticamente. Expansões custam 100/250/500 moedas. XP: 10 por colheita, 8 por produção animal coletada, 5 por peixe capturado e 5 pela ajuda diária já existente. Curva: 40 × (nível−1)² XP. Regras ficam em `src/progression.ts` e são conferidas no servidor, inclusive plantio por ajuda a amigos. Itens obtidos por feira não ignoram o nível para plantar.

Convite pessoal: aba Amigos e feira → Copiar convite. Link `/?ref=CODIGO`. Atribuição de sessão por até 24 horas, preservada no retorno Google; não salva nome/avatar anônimo. O crédito é de 1.000 moedas ao concluir o primeiro perfil de uma conta criada nas últimas 24 horas, após confirmação do e-mail. Google já confirmado recebe na inicialização; cadastro com senha aguarda confirmação por código na aba Amigos. Conta existente, autoindicação e repetição do mesmo e-mail não geram crédito. Gmail com pontos, sufixo `+` e googlemail compartilha a mesma impressão digital. Não há garantia de identificar uma pessoa usando várias contas realmente diferentes.

Migrações 005 e 006 são aditivas. O registro guarda apenas IDs internos e impressão digital de e-mail, sem nome, senha ou e-mail em texto. Fica retido após exclusão de conta para impedir novo bônus com o mesmo e-mail. A função de crédito usa transação, trava de economia e trava do registro; altera saldo, revisão e recibo juntos. O cliente não escolhe valor. Um convite não cria amizade automaticamente: pedidos continuam exigindo aceite.

Verificação: 148 testes automatizados e build; migrações e teste SQL com rollback em branch isolada, conferindo e-mail pendente, confirmação, valor exato, repetição, revisão, e-mail duplicado e autoindicação. Teste de concorrência usa exclusivamente contas sintéticas no branch isolado. `scripts/smoke-progression-referrals.mjs` é teste adicional de integração para ambientes com conexão Postgres; nesta execução a conexão direta foi bloqueada por DNS, e a verificação SQL usa o conector Neon. Nenhuma conta pessoal é usada como fixture.
