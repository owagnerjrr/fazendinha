# Caminhada visível dos novos animais — 0.56.2

## Causas e correções

A articulação anterior recortava somente a ponta das patas (até 86–90% da altura no gato/cachorro), resultando em poucos pixels móveis após reduzir o sprite. Agora a região articulada inclui pernas e joelhos, mantendo quadril, tronco e cabeça apoiados. Oito quadros alternam apoio e avanço, com levantamento da pata durante a recuperação, fases próprias para quadrúpedes e sentido correto em esquerda/direita/frente/costas. Preenchimento entre linhas evita separar cascos/patas do membro durante a flexão. A pose parada permanece intacta.

A cadência passa a usar distância real, espécie e tamanho por idade, sem alterar a velocidade de deslocamento. Aplicada na fazenda/sul/visitas pelo controlador compartilhado, nas instalações e na montaria. No celeiro, deslocamentos verticais passam a usar os recursos de frente/costas disponíveis. Ao parar para cuidados, os sprites novos deixam de continuar caminhando no lugar.

O coelho não carregava a folha `walk`: a seleção de animação voltava à folha de descanso. Incluída a caminhada e ajustada sua cadência. Folhas geradas por animal são liberadas ao trocar de ambiente/versão ou retirar o animal da cena, incluindo ações personalizadas.

Preservadas as escalas da 0.56.1 (filhote 80%, jovem 92%, coelho 0,44), desenhos por raça/idade, nomes, vínculos, crescimento e regras de cuidados. Nenhuma migração, atualização direta de animais ou alteração econômica.

## Verificação

- Reproduzida a versão anterior em navegador isolado usando os módulos de origin/main antes da mudança: coelho se deslocando com textura parada; pernas dos novos animais com amplitude pequena. Comparados quadros reais, imagens e gravações antes/depois.
- Edge/Phaser local 1280×844 e emulação móvel 390×844: porco, cavalo, touro, burro, husky, gato e coelho, quatro direções, paradas e baia mista com cinco animais. Inspecionadas sequências de imagens renderizadas, além da alternância de índices das texturas. Nenhum erro JavaScript.
- Teste integrado com 18 animais (seis espécies em três idades), acompanhamento, montaria/desmontagem e limpeza em computador/emulação móvel passou.
- Sono de gatinho e cachorrinho juntos, recuperação ao recarregar e retorno aos modos anteriores passaram.
- 431 testes automatizados e build passaram. Regressões automatizadas cobrem alcance visível do casco, preservação do tronco/cauda, oito fases, cadência equivalente a 30/60/120 Hz e direção vertical em baia cheia.

Capturas e vídeos na pasta outputs da sessão: WALK_BEFORE_1280.webm, WALK_AFTER_1280.webm, WALK_AFTER_390.webm e WALK_GAME_FRAMES.png. São ensaios locais com animais de teste, sem modificar contas reais.

Emulação não substitui conferência no Samsung A34 físico. Sem promessa de 60 FPS em qualquer dispositivo.

Sandbox autenticado conferido: dpl_EMbbd4JfUbpa8EKmZk6EJCndQcDG, código 2333028. Versão 0.56.2 abriu e reabriu em 1280×844 e 390×844 sem erros JavaScript/5xx. Comparação antes/depois preservou moedas, inventários, bens, IDs, nomes e datas de crescimento. Nenhuma migração ou escrita direta no banco.
