# Cadência nativa — 0.53.2

## Defeito reproduzido
Havia um segundo relógio (`FramePacer`) sobre o requestAnimationFrame do navegador. A tolerância de 0,4 ms descartava callbacks quando os intervalos oscilavam ligeiramente. Com intervalos repetidos de 16,67 / 15 / 18,33 ms, o navegador oferece 60 callbacks por segundo, mas o limitador podia apresentar somente cerca de 40 quadros. O resultado dependia da fase inicial do relógio; intervalos ideais dos testes anteriores não cobriam a falha.

No runtime local com replay dessa sequência e reinício do relógio, foram apresentados 224 de 337 callbacks (39,88 quadros por segundo do relógio simulado). Após a correção, foram apresentados todos os 740 callbacks recebidos (60,01 por segundo simulado). Estes são testes de cadência com timestamps controlados, não uma medição física no Samsung A34 informado pelo jogador.

## Correção
Removido o limitador manual. Cada callback do navegador agora chega ao jogo. A proteção de avanço da simulação continua limitada a 100 ms após uma pausa longa. Mantidos física de passo fixo, colisões, velocidades, sincronização visual 0.53.1, qualidade leve automática no celular e todos os dados/economia. Não há migração de banco.

A meta continua sendo pelo menos 60 FPS em dispositivos compatíveis. Telas de maior frequência podem apresentar mais quadros; não há contador artificial fixado em 60. O painel Desempenho e animação continua contando apresentações reais do jogo.

## Validação
- 400 testes e build aprovados.
- Regressões com intervalos irregulares e telas de 30/90/120/144 Hz: nenhum callback descartado e tempo transcorrido preservado. Retomada após pausa limitada sem eliminar o desenho.
- Comparação no runtime com CPU emulada 4×, conforme os números acima.
- Toque local 390px com CPU 4×: 769 quadros em 6,52 s (117,92 FPS), sem erro JavaScript. Sandbox autenticado desktop/toque confirmou casa, celeiro, venda e sul, continuidade das trilhas, preferências e bens preservados. O painel do jogo no sandbox móvel mediu 120 FPS, quadro p95 8,6 ms e CPU p95 0,4 ms, após caminhar. Trata-se de emulação, não do telefone físico.
- Produção: verificar o deployment da versão 0.53.2 após o merge.

Pendência explícita: confirmar os FPS no celular físico do jogador, inclusive sem o gravador de tela. Não foi diagnosticado um limite de hardware apenas pelo modelo ou pelo vídeo; a captura do WhatsApp, aproximadamente 42 FPS, não mede isoladamente a taxa interna do jogo.
