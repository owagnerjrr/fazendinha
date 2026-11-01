# Interações nos Campos do Sul — 0.50.0

Bancos da nascente e do jardim permitem sentar/levantar com pose sentada do personagem equipado. A mesa permite piquenique com pose e gesto repetido de levar lanche à boca. Nas duas margens, brincar com os patos mostra gesto do personagem e barquinho; os três patos do lago escolhido se aproximam suavemente e reagem, retomando o nado após encerrar. O jardim permite admirar flores com gesto/buquê visual.

Use mão: toque/clique no objeto para caminhar até o ponto de acesso, ou aproxime-se e use E/botão contextual. O botão encerra a atividade; movimento e Esc também encerram. Ferramentas, janelas, cuidado com animal e mudança de cenário cancelam a atividade. Porta de retorno mantém prioridade. Não há círculo de entrada ou menus sobrepostos.

As três placas de nome/disponibilidade de terrenos foram retiradas. O menu Construir mantém as regras e informações de aquisição. Terrenos, construções, plantas e regras de compra não mudam.

Interações de lazer são locais à cena, gratuitas e sem recompensas: não consomem alimentos reais, não modificam felicidade/energia e não concedem recursos. Alimentos e flores desenhados são parte da animação, não itens de inventário. Não cria nem transfere patos para contas. Não persiste estado sentado ou compartilha a pose de lazer pela presença multiplayer; ao reabrir, jogador permanece em sua posição de acesso segura e levanta normalmente. Não há migração no banco.

374 testes e build aprovados. Navegador local em 1440/390px conferiu os seis alvos, botão contextual, teclado E, toque/clique para caminhar ao banco, Esc/movimento para cancelar, pose sentada real, gráfico de lanche, patos próximos ao barquinho e ausência das placas. Snapshot de moedas, inventário, propriedade e animais preservado. Testes geométricos confirmam os pontos de acesso, alcance e brinquedo dentro da água. Homologação online em andamento.

A revisão visual reposicionou a aproximação do lago inferior para a margem norte, sem copa encobrindo o personagem. Patos agora mantêm espaçamento e posições limitadas ao interior da água durante a brincadeira. A rotina de retomada do nado é suave. O acesso ao banco da nascente também foi ajustado para a malha de navegação e a luminária.

Homologação online concluída no sandbox autenticado em 1440/390px: bancos, piquenique e patos iniciam/encerram pelo botão contextual, sem erros JavaScript/5xx. Revisão final da margem repetida nas duas larguras: personagem visível e patos distribuídos ao redor do barco. Snapshot antes/depois de moedas, inventário, roupas, animais, terrenos, estruturas e cultivos permaneceu igual. Nenhuma cobrança ou migração. Visita simultânea entre duas contas e aparelhos físicos não foram testados nesta entrega.

## 0.50.1 — encenação com os patos

Alteração restrita à brincadeira com patos. O braço ativo é substituído por quatro quadros ligados ao ombro, preservando cabeça, roupa e o outro braço; evita desenhar um membro extra por cima do repouso. A mão prepara o barquinho, solta-o numa trajetória em arco e relaxa após a chegada à água. Há respingo breve, e os patos só começam a seguir depois da aterrissagem. A posição do brinquedo na preparação usa a mesma âncora da palma desenhada.

375 testes e build passaram; sequência de preparação/soltura/aterrissagem validada. Navegador local 1440/390px repetiu as interações, conferiu patos dentro da água e junto ao brinquedo, controles, cancelamento, ausência das placas e bens preservados. Bancos, piquenique, flores, preços e progressos mantêm suas regras. Sem migração. Homologação online em andamento.
