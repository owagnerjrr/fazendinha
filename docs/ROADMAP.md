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
