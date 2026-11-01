## 0.40.1 — cuidados no padrão dos outros animais

Painel compacto compartilhado, retrato real do animal criado, Mais opções e ausência de nome permanente sobre o sprite. 317 testes/build passaram. Comparação autenticada PC/celular confirmou métricas iguais às do painel original, imagem real, nome oculto no cenário, aviso de fome e persistência das interações.

## 0.40 — criações na venda e interação normal

Catálogo publicado integrado às categorias da venda, Novidades e roupas. Controles E/Usar e toque reconhecem animais criados. 317 testes e build passaram; sandbox autenticado PC/celular validou E/mão, toque, cuidados, compra única, roupas inéditas e persistência. Proteção impede o gesto de abertura de clicar nos botões da nova janela.

## 0.39 — criações integradas aos cuidados e guarda-roupa

Animais publicados usam comandos e estoques comuns, aparecem em Meus animais e nos alertas de cuidados. Passeios coletivos incluem espécies compatíveis. Roupas criadas integram o guarda-roupa e trocam corretamente com as originais. 312 testes e build passaram. Sandbox autenticado em PC/celular validou presentes, nome/cuidados, estoques, animações reais, roupas, persistência e acompanhamento casa/celeiro/fazenda. Permanecem os limites de mecânicas inéditas, produção/reprodução dinâmica e cuidados de espécies criadas nas visitas.

## Runtime administrativo — em validação no sandbox

Implementados catálogo consumido pelo jogo, animais novos separados dos registros antigos, prévia isolada, editor de terrenos, cenários com cultivo/colisão/portas/pesca, compras por transação existente, cosméticos/modelos no renderizador original, biblioteca PNG/WAV versionada, concessões idempotentes e configurações por público. 288 testes passaram. Validação autenticada e visual publicada em andamento; não declarar os exemplos completos concluídos antes dela. Nenhuma mudança aplicada ao banco de produção nesta etapa.
## Central administrativa — base em desenvolvimento

Branch codex/admin-creation-studio: autenticação exclusiva no servidor, definições versionadas, grupos/públicos estáveis, consulta de contas/pedidos e coleta de atividade. 278 testes passaram e build passou. Migração aditiva 014 testada no banco isolado. Executor de conteúdo, editor visual, arquivos, concessões, edição estrutural do progresso e configuração efetiva do jogo ainda pendentes; não considerar o pedido completo. Consulte docs/ADMIN_GUIA.md. Sandbox autenticado confirmou autorização 401/403, recibos idempotentes, rascunhos persistentes, público self/grupos, suspensão, restauração sem alterar bens e consulta de pedidos/atividade. Interface 1280/390px: salvar/reabrir/buscar e acesso negado para conta comum, sem erro JS nem transbordamento. Ajustes numéricos e recuperação condicionada validados no sandbox. A central completa continua pendente; exemplos de espécies/cenários/roupas jogáveis ainda não implementados.
## 0.31.0 — passeios felizes, cuidados nas visitas e seleção na baia

Iniciar passeio completa a felicidade e ela permanece cheia enquanto o passeio estiver ativo. Baia com vários animais abre uma lista numerada com nomes, espécies e condição; funciona no portão e ao escolher animais, inclusive gatos/cães, na fazenda própria e no celeiro visitado.

Visitantes autorizados podem alimentar, dar água, limpar, medicar, brincar, acariciar, oferecer peixe ao gato e iniciar/encerrar passeio. Recursos saem do visitante, informado no painel. Passeio mantém proprietário, baia, instalação e configuração original; concessão temporária de 45s renovada a cada 8s de visita ativa. Sair tenta devolver imediatamente; queda de conexão/aba suspensa deixa expirar e retorna ao local original. Outro visitante não pode tomar o passeio; dono pode revogar cuidados ou retomar o controle.

242 testes e build aprovados. Navegador 1280/390px: seleção dos 5 animais por teclado/toque, felicidade cheia, cuidados completos no celeiro com estoque do visitante, acompanhamento real/brincadeira na fazenda e devolução sem mudar proprietário/baia. Regressão da assinatura estável do celeiro impede reiniciar a cena por renovação do passeio. Roteiro scripts/qa-friend-care031.mjs; validação autenticada e interface publicada no sandbox aprovadas, preservando propriedade, baia, recursos e permissão. Nenhuma migração de tabela nem teste destrutivo em produção.

Também verificado: produto pronto no curral externo abre cuidados para o visitante, sem permitir coleta; passeio expirado omitido da resposta pública após correção no sandbox (antes vinha marcado, depois voltou à baia). O dono controla a opção Permitir cuidados e passeios por amigos.

## 0.30.0 — oito baias e cuidados equilibrados

Cada baia suporta cinco animais de qualquer espécie; total de 40 vagas no celeiro. Compra e transferência permitem escolher a baia, com contagem individual e validação no servidor. Ovos em incubação reservam vaga na baia da mãe. Redistribuição aditiva dos animais antigos sem baia; IDs, saldos, nomes, produção, cuidados e configurações de acompanhamento são preservados. Protocolo 14 impede que clientes antigos sobrescrevam a nova distribuição.

Todos os animais recebem texto FOME, SEDE, DOENTE, LIMPEZA ou DESCANSO quando aplicável. Doença tem prioridade; necessidades simultâneas alternam o aviso. Cuidados completos duram aproximadamente 90min para comida, 75min para água, 120min para limpeza, 90min de energia de passeio/felicidade, com variações por espécie. Avisos abaixo de 30%. Novos animais começam com 70% de reserva; os estados já salvos não são preenchidos nem apagados. Offline limitado a 2min por retorno. Não há punição extra por sono.

235 testes e build aprovados. Navegador 1280/390px: escolha na compra e transferência de cachorro, 40 animais misturados desenhados nas baias, recusa de sexto sem débito, avisos, carinho no cachorro e peixe ao gato com portões abertos e retorno, recuperação após recarregar. Script: scripts/qa-barn-pens030.mjs. Validação autenticada isolada aprovada: migração preservada, escolha/transferência, disputa da última vaga sem débito duplicado e 40 animais persistidos.

## 0.29.4 — compra de cachorro e confirmação

Vídeo recebido mostra celeiro cheio e saldo inalterado de 3.617 moedas; a capacidade continua 12 incluindo incubação. Vagas e impedimento agora ficam junto à compra. Confirmação Compra feita! por toast e no cartão somente após retorno bem-sucedido. Layout dos animais legível no celular. Nova compra de cachorro respeita destino Celeiro, sem alterar cães existentes (configuração anterior preservada).

Corrigido clique descartado após recuperar posição pendente; recibo recuperado da mesma compra confirma a entrega existente sem repetir débito. Outra ação pendente exige conferência explícita. 229 testes e build aprovados. Navegador em 1280/390px: lotação sem débito, vaga disponível, clique duplo com entrega única, mensagem, cachorro renderizado no celeiro e compra mantida ao recarregar. Regressões em tests/dog-purchase.test.ts e scripts/qa-dog-purchase-0294.mjs.

## 0.29.3 — entrada por comando, sem círculos

Aproximar-se das portas mostra Entrar; é necessário apertar o botão ou E para abrir casa, celeiro e venda. Chegar por caminhada ou por destino clicado não abre automaticamente. Mantida a ausência de círculos. Celeiro visitado usa o mesmo botão/ação próxima. 225 testes e build aprovados. Teclado (1280px) e joystick/botão (390px) testados nas três portas, aguardando antes de entrar e após sair/fechar a venda. Regressão em scripts/qa-manual-entry-0293.mjs substitui o roteiro anterior de entrada automática. Sem alteração de banco/economia.

## 0.29.2 — entrada automática

Sem círculos de entrada ou destino. Casa, celeiro e venda abrem ao caminhar bem próximo e alinhado à porta. Trava até afastar-se evita reabrir ao sair ou fechar a venda. 225 testes e build aprovados; navegação real por teclado (1280px) e joystick (390px), passagem lateral e saída sem reentrada testadas. Scripts/qa-auto-entry-0292.mjs reproduz o fluxo em fixtures locais. Nenhuma mudança de banco ou economia.

## 0.29.1 — entradas, inventário e relógio

Correção dos pontos de chegada às portas, retorno dos ícones no inventário e alinhamento do relógio. [Detalhes e testes](CORRECOES_0_29_1.md).

## 0.29.0 — Vale vivo

Clima, cuidados, áudio, convites e visitas ao curral integrados. [Escopo, regras e evidências](VALE_VIVO_0_29.md). 223 testes, build e fluxos autenticados no sandbox aprovados. Publicação pelo PR #12.

## 0.28.2 — chegada confiável nas visitas

Correção da sincronização de presença ao entrar e cuidar dos canteiros. [Causas e testes](VISITAS_0_28_2.md).

## 0.28.1 — visitas com ferramentas

Ações diretamente no cenário, sem painel de canteiro. [Implementação e testes](VISITAS_0_28_1.md).

## 0.28.0 — passos, música e relógio

Implementação e evidências em [UPGRADE_0_28.md](UPGRADE_0_28.md). Vendas por item, trilha original, iluminação contínua e sono com horário. Dados existentes preservados; sem alteração em pagamentos.

## 0.25.1 — cuidado e visitas

Sem energia obrigatória; gatos raster detalhados; primeiro carinho corrigido e animação refeita; quadrado da horta removido; ações explícitas e ajuda em vários canteiros de amigos. 193 testes e build aprovados. [Escopo e validação](CARE_0_25_1.md).

---

## 0.25.0 publicada — 30/10/2026

Versão em produção, PR #2 integrado à main, migrações 010/011 aplicadas com preservação verificada e CRON_SECRET configurado. 189 testes, build e validação remota com contas QA no sandbox aprovados. Limites financeiros e evidências em [VALE_RENOVADO_0_25.md](VALE_RENOVADO_0_25.md).

---

## 0.25.0 — Vale renovado (implementado localmente, ainda não publicado)

Visual renovado; avisos de amigos/mensagens; presença compartilhada; ajuda e roubo com regras; gatos em cinco cores; reforma da casa; progressão mais rápida e 24 canteiros livres; pacote de cinco fertilizantes/R$10 com Pix e cartão. **189 testes aprovados**, SQL local e navegador desktop/móvel conferidos. Publicação depende das migrações 010/011 e validação isolada. Detalhes, regras e limites em [VALE_RENOVADO_0_25.md](VALE_RENOVADO_0_25.md).

---

## Estado atual — 30/10/2026

Vendas reais Orders habilitadas; Pix real validado anteriormente. Cartão/recusa/reembolso e repetição validados em sandbox. CRON_SECRET ausente em produção; reconciliação automática pendente. PR #2 ainda é rascunho, não integrado à main. **184 testes passaram nesta conferência.** Evidências, limites e continuidade em [Conferência de 30/10/2026](CONFERENCIA_2026_10_30.md).

Os registros abaixo descrevem etapas históricas; afirmações antigas sobre vendas desativadas, falta de credenciais ou homologação pendente foram superadas pelo registro atual.

---

0.22.0 — Conta conectada antes de selecionar personagem. Retorno Google leva à escolha quando solicitado; confirmação aplica avatar também em conta existente e só libera entrada após conferir o avatar retornado pelo servidor.

0.21.1 — Compressão do atlas preserva a máscara de pele opaca; preenchimento de pescoço/colo ampliado para unir cabeça e corpo. Modelos e cores existentes mantidos.

0.21.0 — Sete bases de rosto/cabelo com novo acabamento baseado na personagem original; cinco modelos refeitos e dois novos (rabo de cavalo/boné). Nove opções, quatro direções e personalização preservada; original e capuz mantidos.

0.20.0 — Modelos masculinos diferenciados por cabelo curto sem chapéu, olhos compactos/sobrancelhas e camisa de corte reto. Modelos femininos mantêm coques/tranças/capuz e traços originais. Seleção por imagem sem legendas.

0.19.4 — Cadastro sem conta é temporário em memória: recarregar começa novamente pela abertura, sem retomar nome/personagem. Rascunhos anônimos antigos deixam de ser usados; progresso das contas segue no servidor.

0.19.3 — Abertura sempre aparece sem sessão ativa, mesmo com rascunho ou save local antigo. Continuar meu cadastro retoma nome/personagem; contas conectadas continuam entrando direto.

0.19.2 — Rosto escuro com sombras recoloridas junto à pele. Seleção visual sem legendas/campo Estilo, quatro tons de pele e cabelo sem acobreado; índices antigos preservados ao abrir a edição.

0.19.1 — Substituída a montagem por cabeças separadas pela preservação do sprite completo. Recoloração de pele mais restrita, sem atingir botas; estilos com escala consistente, limpeza de fragmentos, clipping por quadro e capuz noturno redesenhado em torno do rosto original.

0.19.0 — Corrigida a união de cabeça/pescoço/corpo dos avatares personalizados. Modelos sem nomes prontos; novo capuz noturno preto/rosa original e roupa preta no cadastro e guarda-roupa.

0.18.2 — Removida a opção “Continuar fazenda deste aparelho” da abertura. Dados existentes preservados.

0.18.1 — Campos de nome, e-mail, chat e demais formulários isolam o teclado dos atalhos globais do jogo; digitação nativa preservada.

0.18.0 — Introdução responsiva Fazenda Feliz, entrada Google/Gmail/e-mail, retomada de perfil e reconhecimento da sessão antes de abrir o jogo. Continuação local preservada e segunda entrada direta.

0.17.2 — Verificação online concluída com três contas QA, correção de identidade UUID/text na autorização e IDs de mensagem compatíveis com a prévia HTTP. Chat persistente e isolado, gestão de pedidos/bloqueios e visita no mapa.

0.17.0 — Google/Gmail com sessão e escolhas preservadas, painel da conta mostra e-mail/provedor, amizades com gestão de pedidos/bloqueios, visitas no mapa em cena isolada e chat privado persistido com paginação, reenvio idempotente e atualização de 3s. Banco aditivo validado em branch antes da produção; sem alterar progresso existente.

0.16.0 — Revisão de ferramentas, vara/linha, direção e alcance da pesca, Vartin, margem do rio, retirada do poço, vento discreto e passadas. Luz da casa, sono sob a coberta com olhos fechados, TV sentada/desligamento ao levantar. Capina após colher, cultivos novos de 15–90 min reais, cuidados animais de 48h e canteiros avulsos persistidos nas clareiras, com solo vazio envelhecendo em três dias do jogo. Protocolo 8 impede clientes antigos de perder os novos dados.

0.15.0 — Ponte e margens com colisões e limite compartilhado com servidor; recuperação de posições antigas sobre a água. Pesca com lançamento, recolhimento, salto e apresentação do peixe na mão, nomes e cinco cores/formas próprias. Venda e anúncio de produtos junto ao Vartin; aba Vender com quantidades de colheitas, sementes, produtos animais e peixes. Barra com mão fixa, um equipamento substituível e mochila.

0.14.2 — Recepção direta do toque nas duas mãos, sem depender de clique sintetizado; clique posterior não duplica interação. Interrompe movimento pendente ao agir e aproxima até entradas próximas quando fora do alcance imediato.

0.14.1 — Celeiro abre com câmera próxima no celular, igual à casa. Controle de mão unificado, sem botões contextuais extras no toque; interação próxima com entradas, animais, equipamentos, construções e móveis. Progresso e economia preservados.

0.14.0 — Pesca funcional com compra permanente de vara, cinco espécies, fisgada temporizada, inventário e venda; regras compartilhadas com validação de servidor, revisão e recibos existentes. Vartin atrás da venda; ponte sem árvores bloqueando a passagem. Corredor de ardósia, detalhes de interiores e caminhada de oito quadros para bovinos, caprinos e aves. Cuidados individuais com gerenciamento recolhível.

0.13.2 — Cuidados individuais no celeiro: seleção por proximidade na baia, alcance menor e preservação da coleta por clique nos produtos.

0.13.1 — Removidas legendas de ações, baias, terrenos, saída e nomes flutuantes. Barra com ícones e controles acessíveis; exploração e interações sem instruções automáticas.

0.13.0 — Simplificação da interface principal: menu lateral com opções existentes, barra de ferramentas compacta e avisos por proximidade. Contas, progresso, regras e ações de jogo preservados.

0.12.6 — Corrigida a passada horizontal do cachorro: patas dianteiras/traseiras alternadas, amplitude visível na escala do jogo e cadência externa por distância.

0.12.5 — Texturas individuais do cachorro e transição entre caminhada/repouso estabilizada. Sem alterações de contas ou regras da criação. Validação e limites em VALIDACAO.md.

0.12.4: isolada falha de ciclo de vida no cache do piso; indicadores dos animais preservados. Acabamento do celeiro 0.12.1 retomado com cache corrigido e verificável também no renderizador Canvas.

0.12.3: desenho do celeiro restaurado à base 0.12.0 após relato de travamento; cuidados e caminhada corrigida mantidos. Falhas de interiores agora recuperam a fazenda e exibem detalhe para diagnóstico.

Correção 0.12.2: consumo único do evento de interação entre cenas e atlas estável dos cães no interior/exterior.

Entrega 0.12.1: revisão visual do celeiro, depósitos com composições próprias, cama de palha, casinha e tigelas dos cães, portões com folha texturizada e iluminação estática em cache.

Entrega 0.12.0: fome, sede, limpeza e doença; pausas na produção e tratamento; umidade e doença das plantas; galinheiros/piquetes com colocação e capacidade; ovos visíveis, choco, filhotes e crescimento; passos suaves. Próximas expansões possíveis: genética, novas espécies, estações influenciando manejo e instalações maiores.

Entrega 0.11.0: noite legível, respiração em quadros de pixel art, camadas estáticas dos interiores em cache, menos trabalho por quadro, modo leve adaptativo e contador real. Pendente: validar 60 FPS sustentados em aparelhos físicos de referência.

Atualização 0.10.1: respiração preservada também nas poses de sentar e dormir; amplitude mais perceptível em repouso.

# Caminho do projeto

## Vida em casa e calendário 0.10

- [x] Sentar e levantar do sofá, ligar/desligar TV e dormir sob a coberta.
- [x] Relógio, quatro períodos, estações de 28 dias e ano; iluminação por horário.
- [x] Calendário, TV e repouso persistentes; despertar validado sem alterar cronômetros de cultivo.
- [ ] Clima, neve e plantas específicas por estação; por enquanto as estações são calendário e ambientação.

## Acabamento 0.9.2

- [x] Cama e guarda-roupa nos cantos, sala alinhada com sofá voltado para a TV e mesa de centro.
- [x] Revestimentos e tapetes detalhados na casa; piso de pedra, lanternas, fardos redondos e objetos com volume no celeiro.
- [x] Colisões e pontos de interação atualizados, sem alterações de save ou produção.

## Ajuste 0.9.1

- [x] Respiração contínua ao parar, com ciclo de três segundos; mantém os pés e a colisão no lugar, inclusive com ferramentas. Para durante movimento e ações e respeita movimento reduzido.

## Entregue na beta 0.9

- [x] Quarto com móveis detalhados originais, tapetes, cabeceira, abajur e decoração de parede; celeiro com armazenamento variado.
- [x] Galinhas mais legíveis e cão com atlas opaco e corpo físico independente do quadro visual.
- [x] Compra na venda com escolha entre três áreas livres, preservando o terreno anterior.
- [x] Abrigo de ferramentas e coreto em uma posição escolhida numa grade, com validação de ocupação e salvamento online.
- [ ] Posicionamento livre fora dessas áreas, mudança/demolição de construções, mais tipos de edifícios e interiores próprios.

Detalhes em [TERRENOS_0_9.md](TERRENOS_0_9.md).

## Entregue na beta 0.8

- [x] Casa com móveis originais proporcionais, mesa e cadeira, piso de madeira e circulação validada.
- [x] Celeiro com palha em grupos, decoração variada e placas por proximidade.
- [x] Carinho nas espécies existentes e brincadeira com cachorro, junto ao portão de manejo, com intervalo de um minuto e persistência.
- [x] Respiração de um pixel no tronco da personagem, mantendo pés e colisão fixos, com movimento reduzido.
- [x] Remoção de avisos de sucesso das ferramentas.
- [x] Integração do ramo de galo, pintinho, incubação e terreno adicional, preservando a versão 0.7 publicada.

Detalhes e limitações em [INTERIORES_0_8.md](INTERIORES_0_8.md).

## Entregue na beta 0.7

- [x] Caminhada em quatro direções e repouso dos cães, com passos ligados ao deslocamento externo.
- [x] Materiais originais detalhados no celeiro, preservando escala, baias e cuidados.
- [x] Entrada contextual por proximidade, botão Entrar, E ou clique na construção.
- [x] Vento variável, folhas e pássaros animados; limites móveis e preferência de movimento reduzido.

Escopo e limites em [AMBIENTE_0_7.md](AMBIENTE_0_7.md).

## Evolução solicitada em 27/10/2026

- [x] Repetir enxada em canteiro preparado e regar canteiro vazio ou já molhado sem apagar cultivo ou reiniciar o prazo.
- [x] Efeito de regador em chão próximo fora dos canteiros; não transforma superfícies em novos canteiros.
- [ ] Ajustar e validar proporções de todos os animais e equipamentos em todos os cenários e em celulares físicos.
- [ ] Animais individuais com nomes, cuidados, novas espécies, crescimento e reprodução limitada; comportamento real em ambientes compatíveis.
- [x] Galo, pintinho e incubação limitada com água, ração e ovos; crescimento de pintinho cuidado em tempo de demonstração.
- [ ] Implementar função de proteção/alerta para o galo e as outras espécies pedidas; validar a interface e o fluxo online em dispositivos reais.
- [x] Nomes individuais, água, carinho e indicador básico de bem-estar para galinha, vaca, cabra e cachorro existentes; produção e proteção de animais novos exigem água e alimento.
- [x] Representar cães possuídos acompanhando o jogador no mapa externo; o servidor mantém a regra existente de proteção.
- [ ] Criar casinha e patrulha autônoma dos cães; validar trajetos em celulares físicos.
- [x] Compra de três áreas com novos canteiros e construções persistentes.
- [ ] Novos mapas conectados e posicionamento livre de terrenos fora das três áreas atuais.
- [ ] Aprimorar ferramentas direcionais e preparar novos canteiros fora da horta; testar controles completos em PC e celular.

## Entregue na beta 0.6

- [x] Nome, galeria de personagens, personalização e conta antes da primeira entrada.
- [x] Rascunho persistente e inicialização única do perfil sem sobrescrever fazendas antigas.
- [x] Celeiro por espécie, escala proporcional, cercas, corredores e reservas organizadas.
- [x] Animações internas limitadas às baias, preservando a produção real.

Escopo e limites em [CHEGADA_E_CELEIRO.md](CHEGADA_E_CELEIRO.md).

## Entregue na beta 0.5.1

- [x] Feira com ovos, leite de vaca e leite de cabra, filtros, estoque disponível e preço por unidade.
- [x] Compatibilidade da feira com as versões antigas da PWA.

Migração aplicada e versão publicada; detalhes em [FEIRA_0_5_1.md](FEIRA_0_5_1.md).

## Entregue na beta 0.5

- [x] Botões Google/Gmail e vinculação pela identidade Neon (Google próprio para lançamento permanece pendente).
- [x] Avatar inclusivo com cinco estilos, seis tons de pele, cores de cabelo e roupa.
- [x] Flores, morango, milho e remoção de pragas.
- [x] Compra, alimentação e produção de animais; cachorro protetor.
- [x] Ajuda para plantar/limpar e roubo entre amigos participantes, com limites e histórico.
- [x] Decoração cosmética original em oito espaços.
- [x] Casa e celeiro caminháveis e nova venda com abas.

Escopo detalhado e limites em [VIDA_NO_VALE.md](VIDA_NO_VALE.md).

## Entregue na beta 0.4

- [x] Conta por e-mail e fazenda online independente por jogador.
- [x] Salvar e carregar a mesma conta no PC e no celular.
- [x] Horário, moedas, compras, colheitas e vendas validados pelo servidor.
- [x] Idempotência, controle de revisão e transações de compra concorrente.
- [x] Energia, recuperação, XP, níveis e duas expansões.
- [x] A* ao redor de obstáculos, proximidade e controles de toque.
- [x] Amizade com aceite, visitas aos canteiros em painel e ajuda diária.
- [x] Feira com reserva de itens, compra e cancelamento atômicos.
- [x] PWA com manifesto, ícones e cache versionado; API fora do cache.
- [x] Preservação do teste local e do visual da versão 0.3.1.

## Antes do lançamento público

- [ ] Android intermediário e iPhone reais: retrato, paisagem, teclado virtual, instalação e reabertura.
- [ ] Medir FPS, memória, bateria, carregamento inicial e redes lentas nesses aparelhos.
- [ ] SMTP próprio e verificação de e-mail; validar entrega real de códigos de acesso/recuperação.
- [ ] Política de privacidade/LGPD, exclusão de conta/dados e regras de convivência.
- [ ] Limites por IP, moderação de nomes e ofertas e proteção contra criação de contas em massa.
- [ ] Alertas e métricas de API/banco; ensaio de restauração de backup.
- [ ] Trocar lock global por locks de linha e validar carga conforme o número de jogadores.
- [ ] Definir política de retenção de recibos sem permitir repetir ações antigas.
- [ ] Refinar e balancear a economia com os testes dos jogadores.
- [ ] Hospedar as fontes localmente e avaliar atlas para reduzir requisições.

## Próximas funcionalidades

- [ ] Entrar e caminhar no mapa da fazenda de um amigo.
- [ ] Receitas e construções livres.
- [ ] Áudio original/licenciado e animações adicionais.
- [ ] Clima e estações com efeitos, pesca e exploração.
- [ ] Presença e personagens andando juntos, com servidor de movimento e reconexão.
- [ ] Avaliar empacotamento nativo e publicação em lojas após validar a PWA.

## Histórico

0.1 entregou o ciclo jogável e o salvamento local. 0.2 trouxe o cenário e os sprites originais. 0.3 adicionou galinhas animadas, poses de cavar/regar, partículas de água e compras consecutivas. 0.3.1 integrou equipamento e mãos em todos os quadros de caminhada. Fontes, prompts e preparo da arte permanecem versionados.

Nome, identidade definitiva e monetização continuam em aberto. Não há compromisso de prazo para as etapas futuras.

### 0.23.0
- Implementado: início enxuto e liberações por nível para novas fazendas, preservando contas anteriores.
- Implementado: convite pessoal, atribuição no cadastro, recompensa de 1.000 moedas após e-mail confirmado e proteção contra repetição.
- Limite: emails diferentes da mesma pessoa não podem ser identificados com certeza; monitoramento de abuso pode evoluir.

### 0.23.1
- Corrigido encaixe cabeça/colo/ombros dos avatares alternativos em movimento.
- Preservadas sobreposições da mão e da ferramenta; removidos fragmentos do chapéu anterior.
- Corrigida a correspondência de cor dos braços com a pele escolhida.

### 0.24.0
- Implementado: loja integrada, guarda-roupa persistente, três conjuntos autorais e correção da cabeça na caminhada para cima.
- Preparado: integração Pix/Checkout Pro, pedidos, histórico, webhooks assinados, ledger e reversões.
- Bloqueado por configuração externa: homologação real Mercado Pago e ativação de vendas. Sem credenciais/testes oficiais/taxas aceitas, comprar moedas permanece indisponível.


### 0.24.1
- Estabilização da cabeça nativa/original e do capuz nas costas, incluindo caminhada com enxada, sementes e regador.
- Prévia de roupas animada nas quatro direções, com respeito à preferência de movimento reduzido.
- Validação financeira recusa frações de centavo e origens de retorno malformadas.
- Pendência externa: configurar credenciais de teste/produção do Mercado Pago, conferir recebedor, cadastrar webhook e homologar Pix/cartão antes de habilitar vendas.


### Orders API (homologação)
- Implementada em branch isolada: criação de orders, checkout hospedado Pix/cartão, conciliação assinada e compatibilidade com pedidos legados.
- Pendente: assinatura real do webhook, testes oficiais e revisão antes de promover para produção.

- 0.25.2: corrigida linha pendente fora do rio, botão da ferramenta ativa na barra/celular e empunhadura da vara.

- 0.25.3: removida duplicação do item escolhido no espaço da mão na barra.

- 0.26.0: auditoria com correções reproduzidas e escopo/limites em CHECKUP_0_26.md.

- 0.26.1: restauração do botão da mão mesmo com interface antiga em memória; regressão de ícones desktop/móvel.

- 0.27.0: modos individuais para pets, casa/celeiro/exterior, acompanhamento, animações com brinquedos e arte direcional.

Validação autenticada no sandbox 873c41e: cachorro salvo no celeiro, replay idempotente sem nova entrega/débito, lotação recusada sem débito e estado preservado após novo login. Somente conta sintética QA0294 Compra foi preparada na branch de testes; nenhum saldo real alterado.

## 0.32 — Campos do sul e bolsa
- Bolsa por categoria e busca, estoque de defensivos existente, venda por item.
- Expansão ao sul reconhece terrenos antigos; construção com prévia, rotação e reposicionamento preserva identificadores.
- Plantio e instalações funcionais, acompanhantes e visitas com presença separada por cenário.
- Validação autenticada e publicação em andamento.

Validação 0.32: 253 testes e build passaram. Fluxos locais desktop/celular e autenticados no sandbox concluídos; publicação final e verificação pública registradas no relatório de entrega.

0.32.1: corrigida incompatibilidade entre bordas físicas e posições aceitas pelo servidor na saída sul; regressão cobre caminhada real até a passagem própria e de amigos.

0.33: consulta remota de cuidados dos animais de amigos; ajuda com deslocamento até o animal; organização automática de construções antigas no sul sem recriar bens; chamados temporários para gato e cachorro com gesto, áudio e aproximação.

0.34: Construir fora dos controles de movimento/ação; fertilizante e defensivo como borrifadores equipáveis; gesto de chamada em quadros de sprite com braço substituído, não sobreposto.





## 0.36 — criação dinâmica e administração integrada

- Executor aditivo de espécies, itens, culturas, cosméticos/modelos, construções, lojas e cenários identificados por UUID.
- Prévia isolada, editor de terrenos, biblioteca PNG/WAV com versões, composições/dependências e distribuição validada no servidor.
- Configurações por público consumidas no jogo; migrações compatíveis com análise de impacto, sem substituição de fazendas.
- Administração de condições/permissões, bloqueio e recuperação; atividade e histórico com retenção.
- Pacotes versionados, contratos financeiros imutáveis e reconciliação com consulta oficial.
- Pendências delimitadas no ADMIN_GUIA: edição arbitrária dos mapas/contas nativos, visitas aos cenários dinâmicos, produção/reprodução de novas espécies, clima/doenças nas novas culturas e mecanismos inéditos.

## 0.37 — visitas aos cenários da Central

Visitas autenticadas e sujeitas à amizade, bloqueios e público de publicação; cuidados e cultivo com recursos do visitante; presença compartilhada, reabertura, saída e imagens históricas autorizadas por contexto. Permanecem pendentes baias personalizadas, produção/reprodução de espécies inéditas, clima/doenças nas culturas dinâmicas e edição livre dos mapas nativos.

## 0.38 — criação por modelos e publicação guiada

Galeria com 12 bases funcionais, busca/filtro, campos básicos primeiro, ajustes técnicos opcionais, prévia isolada e salvamento direto para escolha de público. Jogadores/grupos selecionados pelo nome, revisão dos destinatários antes de publicar e auditoria preservada. Mecânicas e limites do executor permanecem os mesmos.

## 0.40.2 — organização de amigos e venda

Cartões de amigos separam identificação e ações em linhas próprias, com botões alinhados e opções recolhidas. Animais criados usam a mesma linha e imagem da venda, sem subtítulo de origem. Sem mudança em permissões, preços ou dados. 317 testes e build passaram. Sandbox autenticado 1280/390/320px confirmou identificação acima das ações, grade de botões com larguras/alturas alinhadas, opções disponíveis e conversa abrindo. Coelho com imagem real e estilo do botão igual ao nativo, inserido antes da ração, sem subtítulo; confirmação de compra conferida e cancelada. Sem sobreposição, rolagem horizontal ou erros JS. Nenhuma alteração em contas reais.

## 0.41 — animais criados nas visitas

A visita à fazenda, celeiro principal e campos do sul inclui animais criados e recebidos, com identidade/aparência e necessidades reais. Animais também aparecem no painel Saúde e na lista Animais. A projeção de visita não compartilha saldo, inventário, catálogo de compra, cenários privados ou notas do cadastro; recursos gráficos têm autorização pela amizade e referências da projeção. Não há nova concessão nem migração. Cuidados básicos usam recursos do visitante, quando o dono permite e existe visita ativa na área correta. Visitantes não alteram nome, local ou propriedade. Passeios de espécies criadas com visitantes e entrada na casa do amigo permanecem fora desta alteração; acompanhantes do dono usam sua última área externa salva, sem seguir o visitante. 321 testes e build passaram. Sandbox autenticado PC/celular: espécie concedida só ao dono apareceu para visitante sem acesso ao catálogo, incluindo sprite PNG privado autorizado pela visita. Confirmados Saúde, fazenda, celeiro, consumo só do visitante, água, animação real de carinho, mudança de local refletida e ausência de duplicação/erros JS/transbordamento. API confirmou recusa de arquivo não referenciado, área errada, cuidado sem presença ou permissão, comandos de propriedade e repetição sem consumo duplicado. Remover amizade revogou projeção, imagem e cuidados; amizade de teste restaurada. Produção apenas consultada, sem redistribuição dos presentes.

## 0.42 — pacotes proporcionais à economia

Análise e preços completos em ECONOMIA.md. Pacotes R$10–R$50: 500/1.000/1.500/2.000/2.500 moedas; roupas 400/600/850. Migração versionada e fallback legacy fixo preservam pedidos, saldos e bens anteriores. 324 testes e build passaram. Migração no sandbox preservou os 19 contratos existentes (digest antes/depois idêntico). Navegador autenticado 1280/390px confirmou cinco quantidades/valores, resumos Pix/cartão, fertilizante inalterado, preços/cobrança das três roupas, equipamento grátis de roupa anterior e persistência. Oferta antiga foi recusada com 409; checkout hospedado de cartão em sandbox gravou 500 moedas/R$10, versão 2, repetiu o mesmo pedido e não concedeu moedas sem pagamento. PGlite confirmou crédito antigo de 10.000, novo de 500, reembolso/repetição únicos, preservação de estado e rollback total por divergência. Não houve cobrança real.
