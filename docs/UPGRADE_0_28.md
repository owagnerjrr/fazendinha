# Versão 0.28.0 — passos, vendas, trilha e relógio

## Implementação

- Patas articuladas em oito quadros, com tronco preservado. O corte anterior atuava principalmente no rodapé transparente e deslocava as patas apenas um pixel: a textura mudava, mas os passos eram pouco visíveis. Agora os membros flexionam a partir do quadril. Gatos e cães têm quatro direções e quadro de repouso próprio; os demais animais mantêm sua arte e anatomia. A fase usa distância percorrida, inclusive comprimento do arco da trajetória do celeiro. Não são criadas texturas a cada atualização.
- Cada linha da venda mantém quantidade numérica e ganha **Vender tudo**, com estoque e total antes do clique. O servidor valida preço, estoque, lista de itens e proximidade; estoque alterado invalida o total apresentado. Bloqueio de interface e recibos existentes impedem repetição.
- **Caminhos do Orvalho**: composição original em código, 74 BPM, 96 compassos, aproximadamente 5min11s por ciclo, seis seções melódicas, piano sintetizado suave, flauta, pad e baixo. Sem gravações, amostras ou melodias de terceiros. `src/music-score.ts` contém a partitura e a síntese. Um único contexto Web Audio agenda notas com envelopes e sobreposição nas emendas; os volumes dos instrumentos mudam suavemente por período. Volume/silêncio ficam no aparelho (`wj-music-v1`), separados do progresso online. Exige gesto inicial, conforme o navegador; aba oculta suspende áudio.
- Iluminação interpolada pelo relógio em cinco períodos; cenário, objetos e atores recebem a mesma tonalidade. Brilho localizado nas janelas/luminárias. Casa e celeiro têm intensidade própria; menus DOM permanecem legíveis. Efeito atualizado a cada 100ms, sem mapas de luz em tempo real.
- Cama abre seletor de hora/minuto, previsão de mesmo/próximo dia e tempo avançado. Confirmação inicia transição de seis segundos; calendário pausa durante ela e vai exatamente à próxima ocorrência escolhida. Mesmo horário significa dia seguinte. Cancelar não altera estado. Estado de sono é salvo e recuperável; cliente versão 12 impede que clientes incompatíveis sobrescrevam o novo sono.

## Regra de tempo preservada

Dormir avança o calendário. Plantações, produção e necessidades dos animais continuam seguindo **tempo real**, conforme as regras anteriores: dormir não cria colheitas/recompensas nem simula um dia inteiro de fome. Solo vazio preparado continua seguindo o calendário, como antes. Não houve migração, reset ou substituição de dados.

## Validação local

- 207 testes automatizados aprovados; build TypeScript/Vite/PWA aprovado.
- Navegador Edge/Chromium, 1280px e emulação móvel com toque de 390px: venda parcial, venda das 23 unidades de um item, clique repetido, saldo e outro item preservados; volume/silêncio e progresso após recarregar; um contexto musical; cinco períodos; sono 23:55 → 00:05, troca de data e economia preservada. Sem erros JavaScript.
- Renderizador real dos pets: pelo menos seis quadros distintos observados por direção para gato/cão e retorno ao quadro 8 ao parar. Renderização completa do celeiro alterna quadros de vaca, cabra, galinha, galo e pintinho. Teste de pixels exige oito poses distintas e tronco superior idêntico.
- Partitura inteira renderizada pelo OfflineAudioContext, incluindo trecho após a emenda. WAV de 318,8s, pico 0,055 e RMS na emenda 0,0119: sem silêncio ou saturação na emenda.
- Regressão de carinho/brincadeira em fazenda, casa e celeiro executada separadamente.

Scripts DEV: `scripts/qa-gait-browser.mjs`, `scripts/qa-time-music-sales.mjs`, `scripts/qa-pets-browser.mjs`; usam Playwright (`PLAYWRIGHT_MODULE`, `CHROME_PATH`, `QA_OUTPUT_DIR`). Fixtures interceptam somente o módulo local de entrada, sem acessar contas reais. Não executar esses fixtures contra produção.

## Limites

Emulação móvel não substitui aparelho físico. A música foi verificada por execução/síntese e análise do sinal; avaliação auditiva em alto-falantes reais permanece recomendada. Não foi medida garantia de 60 FPS em todo hardware. Pagamentos não foram criados ou modificados nesta versão. Resultados de publicação e persistência remota devem ser registrados após o deploy.
