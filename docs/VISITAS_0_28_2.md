# 0.28.2 — chegada e presença nas visitas

Corrige “Entre pela chegada da fazenda” ao cuidar de um canteiro visitado.

Causas: a visita não registrava explicitamente a chegada antes de permitir movimento; heartbeats independentes podiam chegar fora de ordem; o filtro de 750ms descartava trocas de fazenda e coordenadas recentes, embora retornasse sucesso.

Correções: registro na chegada (750,650), movimento/ação somente após confirmação; canal serial compartilhado por presença própria, visita e ação; saída limpa apenas a presença temporária. O servidor sempre mantém troca de dono/coordenadas, preservando o filtro de frequência para posição parada. Verificações de amizade, bloqueio, água, posição, velocidade e alcance de ações não foram removidas. Sem migração ou alteração em saldos, compras, animais e plantações.

211 testes e build aprovados. Teste PostgreSQL isolado reproduziu a chegada descartada no código anterior dentro de 750ms; o SQL novo mantém troca de fazenda e posição da ação na mesma janela. Testes unitários verificam ordenação sob atraso e recuperação de falha. Navegador 1280px/390px com chegada atrasada em 1,6s: não move/não age antes da confirmação; depois carpir, plantar, regar, limpar e pegar um produto funcionam sem modal, com um comando por ação. Fixtures locais não acessam contas reais.

Scripts: `scripts/qa-presence-sql.mjs` (PGlite via PGLITE_MODULE), `scripts/qa-visit-arrival.mjs` (Playwright via PLAYWRIGHT_MODULE, CHROME_PATH, QA_OUTPUT_DIR).
