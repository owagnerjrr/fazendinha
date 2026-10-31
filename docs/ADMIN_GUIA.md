# Central de criação e administração — versão 0.36

## Acesso exclusivo

Entre no jogo com a conta proprietária e abra https://fazendinha-wj.vercel.app/admin/. O login é o mesmo do jogo. O código de amigo identifica a conta para a configuração inicial, mas não autentica ninguém. O servidor exige JWT válido, conta não bloqueada e associação exclusiva em studio_admins. Não existe cadastro público de administradores; todas as APIs e recursos privados também são protegidos.

## Criar um animal novo

1. Em Criações → Nova criação, escolha Animal / espécie. Informe nome, descrição, preço e cor.
2. Escolha anatomia, velocidade, intervalo de alimento, comportamentos, ambientes e dieta. Quadrúpedes de orelhas curtas/longas e aves têm arte e passos próprios. Espécies não ficam limitadas aos nomes antigos.
3. Opcionalmente envie folhas na seção Arquivos. Em Aplicação da imagem, escolha animação padrão ou uma ação específica. Folhas têm quatro linhas: frente, esquerda, direita e costas, com dois ou quatro quadros por linha. O formulário aplica quatro; dois podem ser definidos na configuração estruturada. Ajuste escala e apoio sem exceder o quadro de 96×112. Descanso, caminhada, alimentação, carinho e brincadeira podem ter folhas distintas.
4. Use Visualizar e testar: a fazenda temporária tem economia isolada, ações reais do mesmo executor e prévia das quatro direções. Os materiais necessários ficam disponíveis somente nesse teste. Nada é gravado na conta real.
5. Salve o rascunho. Abra Público e publicação → Somente minha conta, confira as contas afetadas e publique. Use concessão gratuita para receber uma unidade ou disponibilidade para comprar com moedas.
6. No jogo abra Menu → Criações do vale. Compre, alimente, interaja e configure o local ou acompanhamento. Novos animais aparecem também na fazenda, casa, celeiro e sul conforme seus ambientes permitidos. As necessidades são salvas individualmente e o progresso offline é limitado.

Sem upload, é usada a arte paramétrica original. A descrição livre é uma descrição, não um gerador automático de arte. Fome e água são capacidades básicas; higiene e tratamento permanecem disponíveis. Produção e reprodução inéditas não são comportamentos deste executor.

## Criar roupa ou modelo

Cadastre Roupa / acessório para uma sobreposição ou Modelo de personagem para uma aparência base. É possível definir cor/atributos sem upload. Folhas próprias usam quadros 48×64, quatro colunas e quatro direções (192×256), transparência e apoio nos pés. O teste mostra o personagem em caminhada e uso de ferramentas. O sistema preserva as roupas anteriores e a aparência individual; equipar uma criação é uma escolha separada de publicá-la.

Para conceder, escolha Jogadores específicos e os códigos de amigo ou um grupo, com Concessão gratuita. A concessão de cada conteúdo ocorre uma vez por conta; republicar não gera cópias. Para um segundo presente, duplique como outro conteúdo identificado. Na consulta de uma conta, roupas nativas também podem ser concedidas sem desconto de moedas.

## Criar cenário, lago e conexão

1. Escolha Local / cenário e defina dimensões entre 8×8 e 64×64.
2. No editor pinte grama, caminhos, água, cercas/limites, vegetação, pedras, luzes e áreas de cultivo. Marque Permitir pesca antes de pintar a água desejada.
3. Posicione a chegada em chão acessível. Pinte portas informando farm (fazenda) ou o UUID de outro cenário. Publique primeiro o destino ou inclua os dois numa composição.
4. Escolha conexão pelo menu ou passagem na saída sul. A saída sul oferece também os campos originais: terrenos e instalações já comprados continuam no sistema existente.
5. Teste colisões, pesca, cultivo, portas e retorno. Salve, confira o público e publique.

O cenário é jogável com setas, controles de toque e ferramentas; suporta cultivo, pesca com vara, construções e acompanhantes. Horário, luz, chuva e música são integrados. O modo interno exclui chuva. É uma área adicional do jogador; o editor não sobrescreve o mapa nativo nem os terrenos comprados. A pesca dinâmica deposita peixes no inventário existente, com intervalo de dez segundos, sem o minijogo temporizado da pesca nativa.

## Construções, itens, culturas e lojas

Itens podem ser materiais, alimentos, remédios veterinários, doses de defensivo/fertilizante e ferramentas de carpir/regar. Doses se integram aos borrifadores existentes. Alimentos respeitam dietas configuradas. Materiais são protegidos para receitas.

Culturas têm sementes, quatro estágios opcionais em uma folha, tempo de crescimento, água, produção e venda parcial ou Vender tudo por item. As culturas do executor novo têm crescimento e rega próprios; resistência climática, pragas e doenças configuráveis ainda não são suportadas nele. As culturas nativas mantêm integralmente suas regras anteriores.

Construções dinâmicas oferecem decoração, área de cultivo e porta. Defina tamanho, imagem, receita e rotação. Na área criada, escolha Construir, toque numa posição próxima, confira a prévia e confirme ou cancele. Reposicionar uma horta desloca suas plantas junto; girá-la com plantas é bloqueado. Colisões, caminhos e chegada são preservados. Modelos funcionais de galinheiro/piquete/coreto/abrigo podem preparar estoque do sistema original para posicionamento nos campos do sul, mantendo suas funções existentes.

Lojas selecionam produtos publicados, preço da oferta e limite por conta. O servidor confere versão, preço, estoque, dieta, materiais e propriedade. Os preços enviados pelo navegador não determinam o desconto. Conteúdos dependentes precisam alcançar o mesmo público; use Composição de atualização para publicá-los juntos.

## Publicação e distribuição

Disponíveis: somente administrador, códigos específicos, grupos persistentes, novos jogadores e todos, com nível mínimo e percentual estável por conta. Visualize as contas afetadas antes de publicar. Novos jogadores significa fazenda criada após a publicação. A prévia lista contas existentes; não inventa cadastros futuros.

Disponibilidade põe o conteúdo na loja/menu; desbloqueio aplica as mesmas condições de acesso sem concessão; concessão entrega uma unidade gratuitamente. Conteúdo e permissões são resolvidos no servidor. O jogo sincroniza regras/concessões na próxima consulta (aproximadamente 15 segundos); reabra o catálogo para ver novos produtos. Não é necessário deploy para conteúdos e regras suportados.

Cada publicação fixa versão e público. Bens adquiridos guardam uma cópia da definição; suspender uma publicação ou desativar conteúdo não retira compras. Versões ativas mais antigas podem continuar servindo públicos anteriores; para parar todas as novas disponibilizações use Desativar no conteúdo. Alterar o público não confisca o que já foi concedido.

## Impacto, migração e recuperação

Editar não modifica bens já adquiridos. Em Publicações → Impacto e atualização de bens existentes, confira conflitos e selecione até 50 contas elegíveis por operação. O servidor exige a revisão atual e a versão publicada para esse público. Mudanças de mapa que bloqueiem personagem, área de construção ou cultivo são recusadas. Construções instaladas não podem mudar tamanho/função/destino por esse caminho. Animais não podem perder o ambiente em que estão. Migrações compatíveis preservam quantidades, identidade e plantas; culturas mantêm a fração de crescimento e necessidades são calculadas antes de trocar a regra.

Versões e restauração cria um rascunho com a definição antiga. Publique-o novamente para o público escolhido. Configurações se aplicam sem rebobinar o relógio; o progresso posterior permanece. Restauração de ajustes de conta confere se o valor não mudou desde o ajuste original. Não existe restauração de toda a fazenda por cima de progresso recente.

## Jogadores e atividade

Busque por nome ou código, consulte nível, XP, saldo, bens e estado salvo. A linha do tempo filtra datas e mostra ações confirmadas e variações de inventário/moedas. A área permite corrigir valores existentes, aparência base, condições/nome de animais e permissões; conceder roupa nativa; bloquear/desbloquear acesso e recuperar personagem preso. Toda alteração exige motivo e é auditada com antes/depois e recibo idempotente. Terrenos, plantações e estruturas nativas são consultáveis, mas sua edição arbitrária não foi liberada: continua usando os comandos funcionais do jogo.

Coleta iniciada em collection_since da implantação administrativa, sem histórico retroativo. Heartbeat a cada 20 s; atividade exige aba visível, foco e entrada recente. Ativo: atualização há até 45 s e interação há até 60 s. Tempo é aproximado e duas abas não somam o mesmo intervalo. Eventos por 90 dias e sessões detalhadas por 30; limpeza diária oportunista. Auditoria e agregados são preservados. Não são coletados chat, teclas, email, IP ou credenciais nessa telemetria.

## Configurações e pagamentos

Configurações suportadas: duração do minuto, intensidade noturna, clima sazonal/forçado, taxa de necessidades, limite de evolução offline das necessidades, distância de acompanhamento, alcance nas áreas criadas e teto da música. Aplique primeiro somente à própria conta. Restaurar requer publicar explicitamente a configuração antiga; suspender não desfaz regra já aplicada.

Pacotes: nome, moedas, preço e disponibilidade. O identificador f5 continua entregando cinco fertilizantes. Alterações criam versões e valem para novos pedidos; pedidos existentes guardam preço/entrega originais. Pedidos permite consultar histórico e reconciliar consultando o Mercado Pago. Não cria pagamento, não simula aprovação e só entrega com validação oficial, com proteção contra duplicidade. Não é painel de reembolso de produção. Tokens, CPF e dados de cartão não são exibidos.

## Biblioteca

Imagens normalizadas em PNG RGB/RGBA até 2048×2048 e 2 MB; áudio WAV PCM 8/16 bits, mono/estéreo, 8–48 kHz, até 120 s e 3 MB. Não aceita SVG, scripts ou URLs executáveis. Versões são imutáveis e referências fixam o número da versão. Recuperar cria outra versão. Recursos referenciados em rascunhos ou publicações não podem ser desativados. Onde é usado lista rascunhos e versões. Música de cenário passa pelo controle musical existente, com repetição e transição; efeitos preservam volume separado.

## Limites atuais

Não é um editor de código nem gerador por inteligência artificial. Mecânicas novas exigem programação. O editor não altera livremente o mapa nativo, não migra obstáculos conflitantes automaticamente e não edita todo o JSON das contas. Espécies novas não têm produção/reprodução inéditas; animações importadas são folhas por ação/direção, sem editor de ossos ou quadros individuais. Novas áreas não têm presença multiplayer/visitas compartilhadas ou transferência para baias customizadas; os sistemas nativos de amigos, animais e sul continuam disponíveis. Regras não listadas acima continuam no código. Não foi comprovado desempenho em todo aparelho físico nem escuta humana da música enviada pelo administrador. Consulte VALIDACAO para evidências e pendências.
