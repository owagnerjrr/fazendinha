# Visitas, produtos e roubos por hora — 0.45

## Regra de roubo

Cada visitante pode pegar até 5 produtos em cada fazenda nos últimos 60 minutos (janela móvel). As vagas reabrem individualmente uma hora após cada ação. Outros visitantes e outras fazendas têm contagens próprias. Ambos precisam ativar a brincadeira, ter amizade aceita e presença próxima; só planta madura, saudável e ainda não beliscada. Continua valendo um produto por canteiro/ciclo, preservando pelo menos um para o dono. Cuidado e tentativa recusada não gastam vaga.

A migração aditiva 019 cria farm_raid_events e índice por visitante/dono/horário. Preserva farm_raids e todos os estados antigos; não inventa horários retroativos. A contagem nova começa na publicação. A antiga pausa global raidProtectionUntil deixa de limitar essa brincadeira; nenhum saldo ou progresso é convertido. Servidor serializa transações e mantém recibos, portanto repetir a requisição não acrescenta evento/produto. A consulta de visita calcula a cota do próprio visitante. Ao atingir 5, explica quando a próxima vaga abre.

Corrigida mensagem genérica que dizia Cuidado concluído mesmo após roubo. A visita mostra a resposta real do servidor. Se a mão remove pragas antes da colheita, informa que foi cuidado, sem registrar roubo nem gastar cota, e orienta usar a mão novamente quando pronta.

## Produtos nas visitas

Defensivo e fertilizante podem ser equipados na bolsa e aplicados diretamente nas plantações do amigo, na fazenda e no sul. A permissão é a mesma da ajuda nos canteiros: amizade aceita, ausência de bloqueio e presença próxima. O estoque usado é exclusivamente o do visitante. Prévia usa cópias e não consome; o servidor confirma condição, disponibilidade e efeito antes de salvar. Item incompatível, planta saudável, fertilização repetida ou falta de estoque preservam o produto.

Alimentos/remédios criados no painel compartilham a mesma implementação de efeito no uso próprio e em visitas, para animais originais e criados. A bolsa permite escolher animais do amigo; ração, palha e remédios comuns abrem os cuidados do visitante com seleção de animal. O dono precisa permitir cuidados de animais. Cenas criadas também oferecem os alimentos/remédios compatíveis da bolsa do visitante, com dieta e comportamentos validados. Não transfere propriedade nem concede o item ao dono.

Criações futuras com ações feed, heal, plantMedicine, fertilizer, hoe e water reutilizam esses caminhos. Defensivos e fertilizantes criados preparam doses na bolsa de quem usa; o borrifador aplica-as em culturas originais compatíveis. Sementes criadas continuam plantáveis nos cenários que suportam sua espécie/versão. Materiais, roupas e construções mantêm suas ações e propriedade; não viram permissões para construir ou editar bens alheios. Culturas de cenários criados ainda não possuem doença/fertilizante: não apresentamos aplicação sem efeito como funcionamento nem consumimos produto para isso. Mecânica inédita exige suporte no motor.

## Interface

Chamar cachorro e gato usa dois botões de 40 × 40, com ícone, descrição acessível e dica, preservando som/animação. Botão R$ de 42 × 42 à direita abre a loja existente de moedas/fertilizantes em dinheiro real. Abrir não cria pedido nem cobrança. Mantidos valores e validações de pagamento. Não sobrepõe controles de movimento/ação; verificar em PC/celular antes da publicação.

## Validação

344 testes previstos nesta etapa, incluindo janela móvel exata, isolamento por fazenda/visitante, migração idempotente sem alteração de estado/histórico antigo, produtos de visitante, dieta, estoque, incompatibilidade, item criado e cenário criado. Build e validações de navegador/API em andamento. Usar apenas contas sintéticas no sandbox; nenhum pagamento real é autorizado por estes testes.
