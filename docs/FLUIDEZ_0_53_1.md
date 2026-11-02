# Fluidez no celular — 0.53.1

A gravação enviada mostra caminhada contínua na fazenda. Ela tem taxa variável de captura (aproximadamente 42 quadros/s); isso, sozinho, não mede o FPS do jogo no aparelho.

## Causa reproduzida e correção
O avatar e suas ferramentas eram desenhados no update da cena, antes de Arcade Physics publicar a posição física no postupdate. A câmera seguia a posição nova. No ensaio móvel com CPU emulada 4× mais lenta, todos os 271 quadros de movimento analisados tiveram posição desenhada atrasada, com diferença máxima de 16 pixels. A correção adia somente a apresentação até depois da física. No ensaio posterior e no controle por toque, a diferença foi zero.

O arredondamento inteiro da câmera e dos objetos também foi removido. As texturas continuam com pixel art e filtragem nearest, sem suavizar a arte. O acompanhamento usa o tempo transcorrido, mantendo a mesma resposta em 30/60/120 FPS.

Aplicado à fazenda, sul, visitas, casa e celeiro. Ferramentas, sombra e poses acompanham a apresentação final. Física de passo fixo, velocidade, colisões, preços, salvamentos e dados permanecem nas regras anteriores. Não há migração de banco.

## Verificação
- 398 testes e build aprovados. Regressões verificam ordem física/desenho, último comando por quadro, limpeza ao fechar a cena e acompanhamento independente da taxa de quadros.
- Edge em 390×844 com toque real via CDP e CPU 4×: 278 quadros de movimento sem atraso avatar/física; sem erro JavaScript. Vídeo local isolado MOBILE_WALK_FIXED.mp4.
- Perfil comparável sem gravação: p95 de quadro 18,7 ms antes e 18,1 ms depois. Essa pequena diferença não comprova ganho geral de FPS; a correção comprovada é a sincronização visual. Desenhar canteiros não foi o gargalo nesse ensaio.
- Prévia de sono conferida após reorganizar a apresentação: cama, roupa e acompanhantes mantidos.
- Sandbox autenticado e conferência pública: registrar após publicação.

Limites: não houve execução diretamente no celular físico do jogador. Não é promessa de 60 FPS em qualquer aparelho; gravação de tela e outros processos também podem reduzir a fluidez.
