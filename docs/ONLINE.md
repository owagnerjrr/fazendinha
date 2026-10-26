# Versão online 0.4 — beta

Frontend Vite/Phaser na Vercel; API `api/game.ts` Node; Postgres no Neon, região AWS us-east-1; identidade Managed Better Auth com transporte de sessão em `/api/auth/` no mesmo domínio para funcionar em navegadores móveis que bloqueiam cookies de terceiros. A API verifica assinatura EdDSA, emissor e expiração do token e confirma a existência da conta. Nenhuma senha é tratada pelo servidor do jogo. Credenciais de banco ficam somente nas variáveis do servidor.

A fazenda local v1 permanece no navegador. A conta começa com uma fazenda nova: não importar saldos arbitrários do localStorage é parte da proteção da economia. O progresso online não é gravado pelo cliente; o cliente envia intenções e recebe um estado confirmado. Sem conexão, as ações online param. Crescimento e recuperação de energia usam o horário do servidor.

## Economia de testes

| Cultura | Crescimento após regar | Semente | Rendimento | Venda por unidade | Lucro por plantio |
|---|---:|---:|---:|---:|---:|
| Cenoura | 45 s | 8 | 3 | 12 | 28 |
| Alface | 90 s | 12 | 3 | 18 | 42 |
| Tomate | 150 s | 18 | 3 | 26 | 60 |

80 de energia; recuperação de 1/minuto; enxada custa 2, plantar/regar/colher custam 1. Colheita dá 10 XP. Nível = 1 + piso(raiz(XP/40)). Começa com 12 canteiros; mais 6 por 200 moedas no nível 2; últimos 6 por 500 no nível 3. Configuração em `src/online-rules.ts`; renderização independente.

## Consistência

Transação única para moedas, inventário, reservas da feira e recibo de ação. UUID de idempotência por conta; reenvio do mesmo pedido retorna o resultado sem repetir o efeito. Reutilização do UUID com outro conteúdo é rejeitada. Revisão otimista impede gravação de uma sessão antiga sobre outra. Conflito recarrega o estado, sem repetir automaticamente uma intenção que pode ter mudado. Pedidos sem resposta ficam temporariamente no sessionStorage para consultar o mesmo recibo. Não há fila de ganhos offline.

Um lock consultivo global serializa a economia desta beta e evita deadlocks de trocas entre contas. Antes de escalar, substituí-lo por locks de linhas em ordem estável, adicionar limites por IP e métricas de latência/erros. Limite mínimo de 150ms por mutação por conta. Posição/proximidade e velocidade plausível são verificadas nas ações de canteiro; servidor ainda não simula colisões físicas completas. Não é um sistema anticheat completo.

## Social

Código público de amigo, pedido e aceite. Visitas são uma grade dos canteiros no painel; caminhar dentro do mapa do amigo ainda não faz parte desta versão. Uma ajuda para regar por amigo por dia UTC, +5 XP. A feira reserva produtos no anúncio, transfere moedas e produtos atomicamente e devolve itens ao cancelar. Limite de 10 ofertas abertas por jogador e 50 exibidas. Sem dinheiro real e sem co-op em tempo real.

## Infraestrutura e operação

`migrations/001-online.sql` é aplicada explicitamente, nunca pelo navegador. `DATABASE_URL` deve usar hostname pooled e TLS; `NEON_AUTH_BASE_URL` somente servidor; `VITE_NEON_AUTH_URL` é público. Exemplo sem segredos em `.env.example`. Preview não recebe o banco de produção automaticamente. Projeto Neon: `old-firefly-99318880`; branch `br-hidden-tree-b8x7e5ve`. API e banco na região leste dos EUA.

Autenticação usa e-mail/senha e oferece código por e-mail. A configuração inicial permite cadastro sem verificar e-mail, adequada apenas à beta. Antes de lançamento público: SMTP próprio, verificação de e-mail, política de privacidade/LGPD, exclusão de conta e dados, observabilidade/alertas, ensaio de restauração e revisão de abuso. Nenhum pagamento ou upgrade foi configurado por esta implementação.

A PWA armazena somente interface e arte próprias, com cache versionado. A navegação usa o HTML do mesmo cache que os seus arquivos JS/CSS, para evitar misturar versões durante uma publicação. Nunca intercepta `/api/` ou autenticação externa. A conta online exige rede; o teste local continua disponível offline após o primeiro carregamento. Atualização do service worker entra após fechar as abas antigas. O botão Instalar depende do suporte do navegador; no iOS, Compartilhar → Adicionar à Tela de Início.

## Verificação

`npm test` testa fronteiras de maturação, duplicação, energia, expansão, entradas inválidas e rotas. `npm run build` inclui verificação TypeScript da API e gera o service worker. `scripts/smoke-online.mjs` permite exercitar duas contas de QA, isolamento, persistência, repetição de compra, conflito de revisão e amizade no serviço publicado. Dados de sessão de QA são ignorados pelo git; nunca usar credenciais de um jogador nesse script.

Testes em aparelhos físicos e publicação nas lojas ainda precisam ser realizados. A PWA é instalação pelo navegador, não um binário Android/iOS.
