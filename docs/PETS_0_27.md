# Animais e ambientes — 0.27.0

## Implementação
- Gatos e cachorros têm escolha individual salva em `Animal.petMode`: celeiro, casa, fazenda ou acompanhar. Sem campo novo, o cachorro conserva o acompanhamento externo anterior e o gato fica no celeiro. Não há alteração de IDs, moedas, compras, produção, ração, saúde ou horários anteriores. A capacidade econômica do celeiro continua a mesma. Configuração adicionada ao JSON existente, sem migração de banco.
- Um único controlador visual por ambiente ativo filtra os IDs salvos. Animais de casa não aparecem no exterior, os da fazenda não aparecem na casa e acompanhantes entram/saem com a personagem. Ambientes pausados não são renderizados; ao destruir interiores os atores são descartados. Seguidores também acompanham nas visitas, conservando a propriedade original.
- Rotas consideram paredes, móveis, cercados, margem da água e limites de cada ambiente. Planos de navegação são espaçados entre animais; passos usam distância percorrida, não relógio independente. Animais não recebem corpos que bloqueiem a personagem nas portas. Surgimento usa posições livres e separadas; seguidores cedem espaço quando a personagem se aproxima.
- Carinho: aproximação do animal, personagem virada para ele, braço limitado e mão junto à cabeça, pausa na locomoção, movimento de cabeça/cauda e reação curta. Cachorro possui pose sentada com olhos fechados. Ao terminar, volta ao modo salvo.
- Brincadeira: bolinha com perseguição e pose de convite para o cachorro; varinha com fio e pena para o gato, que acompanha o alvo. Brinquedos e braço são desenhados no mundo. Demais animais mantêm seus recintos, com carinho e interação lúdica de folha/ciscar, sem conceder ração, produção ou dinheiro.
- Sons sintetizados discretos de reação, iniciados após gesto do usuário quando o navegador permite áudio. Movimento reduzido diminui oscilações. Som não é requisito para completar ações.
- Nova arte original: cinco pelagens de gato nas quatro direções; cachorro nas quatro direções, de pé, sentado contente e em convite para brincar. Oito quadros de patas por direção, sombras no chão e profundidade por posição. Os arquivos antigos foram preservados. Prompts e preparo em `art-source/v27/GENERATION.md` (image_gen integrada).
- Cliente de jogo 11; clientes antigos são impedidos de alterar fazendas com escolha de pet até atualizar. Não alteramos autenticação ou pagamentos.

## Verificações
- 202 testes automatizados e build TypeScript/Vite/PWA.
- Regressões de configuração individual, restauração, preservação dos campos econômicos/cuidados/IDs, proprietário inválido, espécie inválida, modo inválido e compatibilidade de clientes.
- Navegação pura desvia de mobiliário e permanece dentro dos limites livres.
- Navegador desktop: gato e cachorro receberam carinho e brincaram em fazenda, casa e celeiro. Conferência visual de cabeça/mão, bolinha, varinha e novos sprites.
- Menu real: escolha de ambiente, visibilidade individual, fechar/reabrir e recuperação local. Grupo de doze acompanhantes nos três ambientes, IDs únicos e portas utilizáveis.
- Primeiro animal comprado com celeiro aberto: carinho sem recarregar. A inclusão de um pet não reinicia mais o celeiro no meio da interação.
- Validação remota e publicação são registradas no relatório de entrega após o candidato isolado.

## Limites
Desktop e celular emulado não substituem teste em aparelho físico/Safari; áudio não foi validado por escuta em telefone. Cenários de teste cobrem móveis, paredes, limites e grupos, sem promessa de navegação perfeita em toda decoração futura. Posições de caminhada são visuais e locais por ambiente; escolha e cuidados são salvos no servidor. Não há novo sistema monetário de felicidade: usamos os horários de carinho/brincadeira já existentes. Nenhuma cobrança ou reembolso real faz parte desta validação.
