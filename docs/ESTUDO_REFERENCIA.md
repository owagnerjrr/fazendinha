# Estudo de referência e proposta — jogo de fazenda WJ

Data: 26/10/2026. Referência observada: https://www.jessecoelho.com.br/fazenda.html

## 1. Objetivo

Criar um jogo próprio para celular e PC, combinando a fazenda social e os ciclos de produção em tempo real desejados pelo Wagner com um personagem controlável em um mundo 2D visto de cima. Referências de experiência: Colheita Feliz e Stardew Valley. Código, mapas, personagens, interfaces, música e identidade serão próprios ou obtidos com licenças adequadas.

Este documento registra uma inspeção de interface, regras publicadas dentro do jogo e metadados do documento HTML. Não é uma auditoria do código ou do servidor. Recursos bloqueados por nível foram conhecidos pelas instruções e pelos catálogos, sem validar sua execução. Não foram realizadas compras, vendas, colheitas ou publicações. Entrar nas telas pode gerar registros de acesso normais do serviço.

## 2. O que foi inspecionado

Tela principal, aparência da fazenda, instruções completas, loja de sementes, catálogo de oficinas, modo de construção, celeiro, missões, feira e painel do clima. Conta observada no nível 4, portanto os sistemas avançados não foram jogados. Não houve teste de desempenho, dispositivos móveis reais ou sincronização entre aparelhos. Nenhuma credencial integra este documento.

## 3. Visual e interação observados

- Pixel art 2D, com visão de cima e fachadas visíveis; não é uma câmera isométrica estrita.
- Árvores cercam a área central; casa, celeiro, canteiros, cercados, oficinas e barracas são objetos distribuídos no terreno.
- Paleta verde, terra e madeira, contornos escuros, fonte pixelada e painéis claros. Balões sobre objetos indicam produção disponível.
- O jogo explica que é possível arrastar para navegar pelo terreno e tocar nos canteiros para executar ações contextuais.
- A interface tem uma faixa superior com muitos menus e uma barra inferior de ações. No enquadramento de desktop observado, alguns controles avançam para fora da largura visível. A adaptação no celular ainda precisa ser testada diretamente.
- Há avatar no perfil e personagens no cenário; as instruções descrevem ajudantes andando até suas tarefas. Não encontrei, nas telas examinadas, controles de locomoção manual do personagem do jogador.
- O jogo descreve alterações visuais por estação, noite com luzes e vaga-lumes e efeitos do tempo. Não observei todos os ciclos pessoalmente.

## 4. Ciclo agrícola e economia

O ciclo principal é arar → plantar → cuidar → colher → armazenar/vender → investir na expansão. A ação do canteiro depende do estado atual; também existem comandos coletivos. Ervas, pragas e seca reduzem a quantidade colhida. As instruções dizem que plantas crescem com a página fechada e podem murchar se permanecerem maduras por muito tempo.

Exemplos do catálogo, antes de bônus, perdas ou efeitos do clima:

| Cultura | Tempo | Custo da semente | Colheita base | Venda total | Lucro base | XP anunciado |
| --- | --- | ---: | --- | ---: | ---: | ---: |
| Alface | 5 min | 10 | 5 × 4 | 20 | 10 | 2 |
| Cenoura | 15 min | 20 | 6 × 6 | 36 | 16 | 4 |
| Beterraba | 1 h | 35 | 7 × 9 | 63 | 28 | 8 |
| Milho | 2 h | 50 | 8 × 12 | 96 | 46 | 12 |
| Tomate | 4 h | 70 | 9 × 15 | 135 | 65 | 18 |
| Morango sazonal | 3 h | 40 | 8 × 14 | 112 | 72 | 14 |

Há sementes posteriores como girassol, trigo, cana, café, algodão, uva, pimenta e baunilha, além de culturas de estação e desbloqueios até níveis elevados. A alface oferece muitos ciclos curtos, enquanto culturas demoradas permitem sessões menos frequentes. O lucro por ciclo isolado não define qual cultura é melhor: importam tempo, disponibilidade do jogador, XP, receitas e riscos.

Segundo a ajuda, o mesmo canteiro concede XP de colheita no máximo uma vez a cada oito minutos; automação concede metade do XP da colheita. Cuidar concede XP e arar só concede XP até o nível 5. Vendas de produtos processados, animais, lago e pomar concedem XP por valor; plantas vendidas não repetem o XP da colheita.

Existem moedas e diamantes. As instruções descrevem diamantes para acelerar produção, bônus, cosméticos e outros recursos. Não foi verificado o processamento de compras nem se há cobrança real em cada opção.

## 5. Progressão, construção e produção

A passagem de nível pode exigir XP e a construção de uma instalação específica. Na conta observada, falta a Pipocaria para passar do nível 4. Isso orienta o jogador, mas também limita a liberdade: no nosso jogo, sugiro testar desbloqueios por XP com objetivos opcionais, reservando exigências obrigatórias para tutoriais ou marcos claros.

O modo construir possui Plantação, Pomar, Bichos, Oficinas, Máquinas, Energia, Cercas e caminhos, Natureza, Objetos, Casas e Praia. Há ferramentas para mover e guardar. O catálogo indica alcance de equipamentos e posicionamento em grade; a ajuda descreve mudança de posição ao segurar um item por três segundos.

Exemplos de transformação observados no catálogo:

- 2 alfaces + 1 cenoura → salada.
- 3 milhos → pipoca.
- 4 tomates → molho de tomate.
- 2 leites → queijo.
- 3 trigos + 1 ovo → pão.
- Café torrado + açúcar + leite → cappuccino.
- Chocolate + açúcar + baunilhas → bombom.

O catálogo vai até oficinas de níveis altos, incluindo vinícola, alfaiataria e paçocaria. A ajuda descreve estoque para até dez receitas e produção sequencial automática.

Animais precisam de cercados e ração; geram itens como ovos, leite e lã. O celeiro permite reservar insumos para evitar vendê-los acidentalmente. Árvores do pomar produzem frutas, com limites ampliados pela compra de terrenos.

## 6. Sistemas avançados descritos pela ajuda

| Sistema | Regra publicada no jogo | Situação da inspeção |
| --- | --- | --- |
| Ajudantes | Executam tarefas; possuem níveis e especialidades | Regras lidas; contratação não testada |
| Energia | Geradores, baterias e consumidores a partir do nível 16 | Regras lidas |
| Logística | Baús, canos e oficinas conectadas transferem insumos e produtos | Regras lidas |
| Expansão | Compra de terrenos, lago e litoral | Catálogos/regras; expansão não comprada |
| Pesca | Lago com produção periódica e alto-mar com ação de fisgar | Regras lidas; minijogo não executado |
| Visitantes | Pedidos periódicos com pagamento diferenciado | Regras lidas |
| Beleza | Objetos podem gerar bônus de venda | Regras lidas |

Ajudantes trabalham sem gastar energia, segundo as instruções. O avanço deles aumenta a capacidade por hora. A ajuda também menciona limites de atuação offline, inclusive oito horas em alguns contextos; isso não significa que todos os sistemas tenham exatamente o mesmo limite.

## 7. Social e retorno diário

- Feira: compra e venda entre jogadores, anúncios com validade de dois dias e intervalo de preço baseado na venda normal. São dois anúncios por barraca. A tela diferencia produtos comprados na feira para evitar certas recompensas duplicadas.
- Vizinhos: ajuda em problemas e retirada de parte da colheita madura; há equipamentos de proteção. Esse comportamento é descrito na ajuda, sem testar visitas que afetem outras contas.
- Chat: segundo a ajuda, mensagens temporárias, escrita a partir do nível 5, pedidos de itens e opções de silenciamento.
- Calendário: sequência de 28 recompensas, sem perder a sequência inteira por faltar um dia; trilha adicional com diamantes.
- Missões: tarefas de plantar, vender e colher, renovadas à meia-noite de Brasília. A tela da conta mostrou exemplos concluídos, sem resgatá-los nesta inspeção.
- Eventos: classificações semanais com categorias e recompensas. A ajuda menciona limites para reduzir manipulação de vendas e XP comprado.
- Convites: moedas para quem convida e para quem cria a fazenda pelo convite.

## 8. Tempo, clima e estações

As regras publicadas definem estações de 42 horas, completando quatro estações em uma semana. Dia e noite alternam em blocos de duas horas. Sol aumenta a colheita; chuva rega; calor favorece seca; ventania favorece pragas. Tempestade e furacão podem danificar equipamentos e canteiros. O painel informa proteção contra danos até o nível 4.

Para o nosso jogo, o tempo real combina com a proposta social: o jogador planta, sai e volta para colher. A experiência de caminhar pode acontecer em paralelo. Não precisamos reproduzir um calendário de simulação que obrigue todos os jogadores a dormir ou avançar o dia juntos.

Recomendação inicial: culturas com tempos variados, janela generosa de colheita e prejuízo limitado para ausência. Visitas e brincadeiras sociais devem ter limites claros para não apagar o trabalho de quem ficou offline.

## 9. O que se sabe tecnicamente — e o que permanece desconhecido

Confirmado por inspeção do documento da página:

- Há um elemento CANVAS com id cena para o cenário.
- Menus, textos e botões aparecem como elementos HTML acessíveis, fora do desenho do cenário.
- O documento carrega arquivos separados para instalação, arte da fazenda, mar e lógica da fazenda.
- Há integração visível com Google Sign-In, além da recuperação por código.
- A configuração de viewport considera largura do dispositivo e área útil da tela.
- A página carrega um script de métricas da Cloudflare; isso não prova que o servidor do jogo rode na Cloudflare.

Não confirmado: motor de desenho interno, tipo de contexto do canvas, biblioteca gráfica, linguagem do servidor, banco de dados, modelo de autenticação, política de backups, protocolo de sincronização, autoridade das regras, proteção contra fraudes, custo de infraestrutura e licenças dos recursos. Nomes de arquivos não provam uma tecnologia de backend. A mensagem de que o jogo funciona offline não foi submetida a teste de interrupção da rede.

## 10. Proposta do nosso jogo

Identidade sugerida: uma fazenda acolhedora com referências ao interior brasileiro, café, pomar, feira, galinheiro, rio, varanda e personagens próprios. Um cenário inspirado no interior de Minas pode diferenciar o projeto e combinar com o Wagner, sem limitar futuras regiões.

O jogador controla um personagem, explora a propriedade e executa ferramentas perto dos alvos. A câmera acompanha o movimento. No PC: teclado para andar e mouse/tecla para agir. No celular: joystick virtual e botão contextual; testar também tocar para caminhar como alternativa. Objetos precisam de colisão, interação por proximidade e ordenação de desenho para o personagem passar atrás de árvores e construções.

Direção de arte proposta: pixel art autoral detalhada, com escala consistente, paleta definida, animações de caminhada e ferramentas, água animada, sombras, luz noturna e vegetação com movimento discreto. Tiles de 32 × 32 pixels são uma hipótese inicial para prototipagem, não uma garantia de qualidade. Mais resolução sozinha não produz um jogo mais bonito. Um kit de sprites e tiles consistente será mais útil do que imagens grandes sem encaixe ou animação.

Alcançar ou superar a qualidade percebida de Stardew Valley é uma meta artística de longo prazo; não é algo demonstrado por esta análise. A primeira entrega precisa provar a qualidade em uma área pequena antes de ampliar conteúdo.

## 11. Base técnica recomendada

Para começar por link no celular e no PC, recomendo avaliar Phaser com TypeScript, usando um mapa em tiles e uma interface adaptada ao toque. A documentação oficial descreve suporte a navegadores desktop e mobile com WebGL e Canvas. PWA pode oferecer instalação e cache dos recursos; o funcionamento offline completo e a sincronização exigem projeto próprio.

Godot é a alternativa a considerar se aplicativos nativos forem prioridade. Sua exportação web tem restrições documentadas, incluindo renderização Compatibility/WebGL 2.0 e limitações de exportação C#. A escolha definitiva deve passar por um protótipo medido em aparelhos reais.

Arquitetura proposta para o jogo online, independente da engine:

1. Cliente desenha, anima, recebe comandos e pode prever movimento.
2. API autentica e valida ações que alteram o progresso.
3. Banco registra fazendas, plantações, inventário, receitas, construções e transações.
4. Servidor determina horários de maturação e resultados econômicos.
5. Recursos visuais e sons são distribuídos separadamente do estado do jogador.

O cliente não deve poder escolher livremente o saldo, a recompensa ou a quantidade de itens. Colheitas e compras precisam ser atômicas e resistentes a repetição, evitando duplicação ao tocar duas vezes ou reconectar. Trocas entre jogadores exigem retirar e entregar itens na mesma transação. O tempo deve vir do servidor, para que mudar o relógio do celular não amadureça tudo.

Para plantas, salvar o instante do plantio e calcular o progresso ao abrir ou interagir costuma dispensar um processo rodando a cada segundo para cada canteiro. Clima e automações exigem cálculo por intervalos e limites, em vez de simular indefinidamente cada segundo ausente.

Começar com fazendas individuais e visitas assíncronas reduz o custo e a complexidade. Personagens de amigos caminhando juntos em tempo real exigem outra camada de sincronização e podem entrar depois. Ter feira e vizinhos não exige que o mundo inteiro seja multiplayer em tempo real.

## 12. Sequência de desenvolvimento

| Etapa | Entrega verificável |
| --- | --- |
| Prova visual e de controles | Um mapa pequeno, personagem em quatro direções, câmera, colisão e controles de toque e teclado |
| Ciclo jogável | Arar, plantar, regar, esperar, colher, inventário e venda; poucas culturas bem acabadas |
| Persistência online | Conta própria, salvar/carregar e continuar no outro aparelho, horários e recompensas validados no servidor |
| Expansão da fazenda | Construção, animais, oficinas, missões e progressão |
| Camada social | Amigos, visitas, presentes e feira com transações seguras |
| Conteúdo avançado | Clima, estações, pesca, eventos e possíveis sessões cooperativas |

Primeira versão recomendada: uma fazenda, um personagem, três culturas, uma loja, um celeiro e uma missão introdutória. O objetivo é completar o ciclo de plantio em celular e PC com boa sensação de controle. Não começar com dezenas de oficinas, energia, mar e ranking ao mesmo tempo.

## 13. Critérios de aceitação

- Jogador entende como se mover e plantar sem ler um manual longo.
- Personagem não atravessa casa, cercas ou árvores sólidas.
- Toque e mouse selecionam o canteiro correto, independentemente do zoom.
- Colher duas vezes não duplica itens; compras não deixam saldo negativo.
- Fechar e voltar preserva a fazenda; uma plantação pronta tem o mesmo estado no PC e no celular.
- Rotação ou redimensionamento não esconde os botões essenciais.
- Meta inicial de fluidez: 60 fps quando viável, com alternativa estável em aparelhos mais modestos; validar em aparelhos reais, incluindo Android intermediário, antes de prometer desempenho.
- Arte mantém escala, perspectiva, contornos e animações coerentes.

## 14. Pendências e limites

Faltam testes reais em celular, avaliação de consumo de memória/bateria e decisões sobre nome, direção artística definitiva, login, hospedagem e escopo social. Não há orçamento nem prazo estimado nesta fase. A análise oferece base para criar o nosso projeto; não torna disponível o código-fonte ou os direitos dos recursos do jogo de referência.

## Fontes

- Fazendinha Secreta, interface autenticada e ajuda interna, consultadas em 26/10/2026: https://www.jessecoelho.com.br/fazenda.html
- Phaser, documentação oficial: https://docs.phaser.io/
- Phaser, introdução e relação com aplicativos nativos: https://phaser.io/tutorials/getting-started-phaser3
- Godot, exportação para web: https://docs.godotengine.org/pt-br/4.x/tutorials/export/exporting_for_web.html

As decisões de arquitetura e escopo são propostas para o nosso projeto, não afirmações sobre a implementação interna da referência.
