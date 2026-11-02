# Vasos e pedras sólidos — 0.53.3

## Causa e correção
Jardineiras compradas, pedras do cenário e seis vasos decorativos eram desenhados sem corpos físicos. Reproduzido no runtime: ao caminhar para cima pela jardineira em (925,590), o personagem atravessava de y=635 para y=512/523 nos ensaios desktop/móvel.

Agora há colisão somente na base de vasos, jardineiras, pedras e troncos das decorações. Flores e copas continuam permitindo sobreposição visual natural. Os mesmos corpos entram na navegação do personagem e dos animais. Pedras e vegetação da fazenda usam o mesmo gerador determinístico nas visitas, preservando as posições originais.

As decorações compradas mantêm id, tipo e slot. Sua imagem e colisão são atualizadas juntas, inclusive nas visitas. Ao mudar de posição, o obstáculo antigo é removido. Uma chegada salva dentro de um objeto recém-solidificado é ajustada para um ponto livre próximo; a detecção considera o offset real dos pés, sem deslocar quem já estava em lugar válido. Nada é cobrado ou recriado.

## Validação
- 404 testes e build aprovados.
- Runtime desktop 1280px e emulação móvel 390px, fazenda própria e visita com dados isolados: jardineira, pedra e vaso bloqueiam caminhada e a navegação contorna suas bases. Jardineira deteve o personagem em y≈599; pedra em y≈711; vaso em y≈479.
- Atualização de decoração durante a visita removeu o obstáculo antigo e criou o novo nos dois tamanhos.
- Regressões: base física proporcional à arte, rotas, posições de slots preservadas, recuperação próxima sem cruzar outro obstáculo e ausência de deslocamento indevido após reset de posição.
- Autenticação e versão publicada: conferir após deploy.

Sem mudanças em contas, moedas, inventários, propriedades, plantações, animais ou economia. Sem migração de banco. Mantida a cadência nativa 0.53.2.
