# Arte dos novos animais — 0.54.1

Porco, cavalo, touro e burro receberam pixel art original mais detalhada, usando somente os sprites próprios da vaca e da cabra do projeto como referência visual. Contornos marrons, luz quente, textura de pelagem, olhos, focinhos, cascos, orelhas, crina e cauda foram aproximados da arte existente.

- Fonte original em `art-source/v55/animal-source.png`; atlas preparado em `public/assets/v55/herd-atlas.png` (320×320, 16 poses de 80×80, aproximadamente 111 KiB).
- Silhuetas isoladas, resíduos de fundo removidos, ponto de apoio comum e esquerda espelhada da direita para manter proporções idênticas.
- O atlas é pré-carregado uma vez. Quadros de caminhada são calculados e armazenados na inicialização, sem processamento de pixels por quadro de jogo.
- `polished-animal-gait.ts` articula a parte inferior das patas em oito fases, preservando rosto/tronco e centro da cauda nas vistas traseiras. Repouso mantém o desenho original. Cavalos e burros usam fases de quatro apoios.
- Os mesmos desenhos estão no mundo, celeiro, montaria e retratos da venda/cuidados. As escalas de filhote/jovem existentes são mantidas.
- Não houve alteração de preços, cuidados, ciclo de vida, colisões, nomes, identidades ou progressos. Desenho procedural anterior permanece somente como fallback caso o atlas não carregue.

## Validação

419 testes automatizados e build passaram. Dois novos testes verificam patas móveis, estabilidade do tronco/rosto, preservação da cauda traseira e transparência. Execução local real em Edge/Phaser em 1280×844 e emulação móvel 390×844 observou 11–21 combinações de direção/quadro por espécie durante o deslocamento. Montar, caminhar, desmontar pelo botão e limpar continuam funcionando. Arte inspecionada na venda e no jogo, com capturas e gravações na pasta de outputs da sessão.

Ensaio em celular físico continua pendente. A emulação não comprova FPS do Samsung A34.
