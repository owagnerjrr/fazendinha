> Atualização 0.4: a conta online, as regras e o escopo social estão descritos em [ONLINE.md](ONLINE.md). As descrições abaixo da versão local 0.3 são históricas.

# Validação da versão 0.1

## Poses e vento — continuação de 27/10/2026

Adicionados quadros de cachorro sentado/atento e deitado após repouso, gerados a partir da arte do projeto. A física agora registra colisões dos cães com personagem, cães e as galinhas decorativas do mapa. Folhas discretas aparecem em rajadas; arbustos e plantas usam o mesmo balanço das árvores, desabilitado com movimento reduzido. A disposição dos fardos varia nas baias. O build e os testes automatizados passam, mas os novos efeitos e colisões ainda não tiveram validação visual ou em aparelho físico; visual e navegação no celeiro continuam em aperfeiçoamento. Os demais animais, reprodução, compra de terras e expansão do mundo continuam pendentes.

## Animação e ambiente — etapa de 27/10/2026

Foi acrescentada uma folha de 16 quadros do cachorro com patas em quatro direções; o quadro de caminhada acompanha o deslocamento e ao parar permanece uma pose imóvel. A arte foi gerada com a ferramenta de imagens integrada a partir do cachorro existente. O celeiro recebeu detalhes de madeira, piso e sombras, e o mapa externo recebeu árvores balançando e pássaros desenhados com asas animadas. Há redução dos pássaros e ausência do balanço das árvores quando o sistema indica movimento reduzido. O botão contextual de entrada usa a mesma verificação de proximidade do atalho E; o clique continua caminhando à construção. Os testes e o build foram executados, mas a validação visual e testes em celular físico ainda não foram concluídos. O cachorro não possui ainda animações próprias de descanso ou observação, nem colisões dedicadas com outros animais; os pássaros são desenhados em vez de sprites detalhados; arbustos e plantações ainda não balançam. Partículas de rajadas e melhoria gráfica completa do celeiro permanecem pendentes.

## Companheiros na fazenda — etapa parcial

Cada cachorro da lista de animais passa a ser representado na área externa, acompanhando o jogador e tentando contornar obstáculos; o nome aparece quando foi definido. A proteção contra roubos continua dependendo das regras da conta e de alimentação/água, não da posição do desenho. O acompanhamento é uma representação visual: patrulha autônoma, casinha, animações próprias e comportamento de descanso continuam pendentes. A proteção de saves não depende da posição visual do cachorro. O conjunto de testes de regras passou; o comportamento externo ainda requer verificação visual e em celular físico.

## Identidade e cuidados dos animais — etapa parcial

Os animais atuais podem ser renomeados e receber água e carinho. Os animais novos precisam estar alimentados e hidratados para produzir ou proteger; cada cuidado de água dura 24 horas. O carinho altera o indicador de bem-estar, mas ainda não altera a produção. Para animais anteriores a esta etapa, a hidratação usa o horário da alimentação até que o jogador registre água separadamente, preservando a regra anterior. São mantidas as espécies originais e a produção existente. Crescimento, reprodução, novos animais, deslocamento externo e abrigos escolhidos pelo jogador continuam pendentes. Foram executados testes das regras e da persistência serializada; ainda não há teste em celular físico nem validação visual ou online desta etapa.

## Etapa de ferramentas — 27/10/2026

`npm test`: 55 testes passaram; `npm run build`: compilação aprovada. A enxada pode ser repetida em terra preparada sem plantação; numa plantação ela continua bloqueada para não apagá-la. Regar um canteiro vazio ou novamente um canteiro molhado não altera o estado, o cronômetro ou a colheita. A ferramenta regador também anima e produz efeito visual no chão próximo: toque ao alcance ou use E/Usar voltado para um ponto sem canteiros próximos. Esse efeito fora dos canteiros é visual e não cria terrenos cultiváveis. Na conta online ações em canteiros continuam consumindo energia. Testes em aparelho físico e verificação visual desses controles permanecem pendentes.

## Correção 0.3.1 — encaixe dos equipamentos

Reprodução baseada nas três capturas fornecidas pelo usuário. A camada de ícones flutuantes foi retirada. Foram preparados 48 novos quadros completos de caminhada com equipamento, distribuídos em três folhas de quatro direções por quatro fases.

Na interface foram selecionados enxada, sementes e regador, com deslocamento em A/D/W/S para conferir esquerda, direita, cima e baixo. As capturas laterais mostraram a lâmina acompanhando o movimento e as mãos em contato com saco e regador. Foram preservados o saldo e as quantidades do save de teste.

O teste visual foi feito no navegador de desktop. A renderização utiliza os mesmos sprites em mobile, mas não houve ensaio em celular físico nesta correção.

---

## Atualização 0.3 — Vida no Campo

- 17 testes aprovados: regras existentes, sincronização do impacto/rega, confirmação única, conclusão ao sair da página, trajetória da água e escolha contextual do canteiro após recarregar.
- 48 quadros de animação preparados e validados, com transparência e quadros não vazios; pontos de saída da água dentro dos limites das imagens.
- Pela interface foram verificadas ferramentas equipadas na mão, poses de levantar a enxada, regador inclinado com água visível, terra molhada e galinhas caminhando/bicando.
- Fluxo da venda: saldo inicial 321; comprar cenoura levou a 281, alface a 221 e tomate a 131. A mesma janela permaneceu aberta nas três compras, preservou o foco e exibiu os estoques atualizados. Escape e clique no fundo não fecharam a venda. O botão **Sair da venda** fechou; após recarregar, o saldo 131 e as sementes compradas permaneceram.
- Galinhas mantidas na parte visível do cercado para evitar que todas desapareçam atrás da copa do salgueiro.
- A compatibilidade em celular físico e o consumo de bateria continuam sem medição. Viewport estreita é uma verificação de layout, não uma certificação de desempenho móvel.

---

## Atualização 0.2 — Bosque Vivo

Reformulação gráfica em 26/10/2026. A checagem TypeScript, o build Vite e os 10 testes de regras passaram. Também foram validados 29 PNGs preparados: transparência, conteúdo não vazio e os 16 quadros do personagem.

Na interface desktop foram observados os novos cenários, personagem, ícones, canteiros, rio, vegetação e efeitos. Plantar e regar foram executados com os novos sprites; o jogo consumiu uma semente e iniciou o prazo de 45 segundos. O save da versão anterior foi carregado com o saldo e a missão existentes. O formato continua na versão 1, sem migração ou reset.

A interface também foi inspecionada em viewport de 390 × 844: molduras, personagem, joystick, botão Usar e barra de ferramentas permaneceram visíveis. Isso continua sendo uma verificação de viewport, não um teste em celular físico. Não foram medidos FPS nem consumo de bateria.

Os recursos são carregados como sprites separados e os efeitos são complementares ao mundo interativo, não uma imagem estática de fundo. Prompts, atlas e script de preparação estão versionados. O estudo de referência e a direção visual estão em `docs/ARTE.md`.

---

Data: 26/10/2026.

## Verificações automatizadas

- `npm test`: 10 testes aprovados.
- `npm run build`: checagem TypeScript e compilação Vite aprovadas.
- Casos cobertos: ciclo agrícola completo, limite exato de maturação das três culturas, cultivo sem rega, colheita repetida, venda repetida, recompensa única, falta de sementes, compras sem saldo e quantidades inválidas, persistência e recuperação de dados malformados.
- O bundle da engine é grande para a fase inicial. O Vite emite aviso de tamanho; a engine foi separada em chunk próprio. Otimização adicional e medição em rede móvel permanecem no roadmap.

## Navegador desktop

Fluxo executado pela interface:

1. Selecionar enxada e clicar em canteiro: personagem caminhou e preparou a terra.
2. Selecionar Plantar e agir: sementes de cenoura passaram de 8 para 7.
3. Regar: jogo informou crescimento de 45 segundos.
4. Após amadurecer, colher: 3 cenouras no celeiro e +75 moedas da missão; saldo passou de 250 para 325.
5. Vender pelo celeiro: +36 moedas, saldo 361 e inventário zerado.
6. Recarregar: saldo, missão concluída e quantidade de sementes preservados.
7. Clicar na venda: personagem caminhou até a loja e abriu a janela.
8. Comprar cinco sementes de cenoura: saldo de 361 para 321 e sementes de 7 para 12.

Nenhum erro do código do jogo foi observado nos logs consultados. Havia mensagens da extensão do navegador, externas ao aplicativo.

## Viewport estreita

A página de apoio `tests/mobile-preview.html` renderizou o jogo em iframe de 390 × 844 pixels. Foram inspecionados mapa, barra de ferramentas, saldo, missão, joystick, botão Usar e janela de escolha de culturas. A seleção de tomate foi executada pela interface e a movimentação do joystick foi exercitada com arraste.

Isso valida layout em viewport estreita e parte dos eventos, mas **não substitui testes em um celular físico**. Não foram medidos FPS, consumo de bateria, compatibilidade iOS, multi-touch real ou orientação em aparelho. Não há garantia de desempenho móvel nesta entrega.

## Publicação e estado

Esta etapa salva o código e a documentação no repositório GitHub. Não provisiona banco nem cria conta online. O guia de execução e a configuração para publicar como Vite no Vercel estão no projeto. O save usado na validação pertence ao navegador de teste e não integra os arquivos versionados; novas instalações começam com os valores iniciais.

## Beta online 0.4 — 26/10/2026

24 testes automatizados e build TypeScript/Vite aprovados. Validação HTTP com duas contas sintéticas no serviço publicado confirmou: cadastro, isolamento de fazendas, persistência entre sessões, compra idempotente, rejeição de UUID alterado e revisão antiga, amizade/aceite/visita, recusa de colheita antecipada, crescimento pelo tempo real do servidor, colheita e missão uma única vez, ajuda para regar, reserva de mercadorias, duas compras concorrentes da mesma oferta com um único sucesso, devolução única ao cancelar e venda no celeiro. Scripts `smoke-online.mjs` e `smoke-gameplay.mjs` registram essas verificações, sem credenciais no repositório.

A conferência visual em viewport 390×844 confirmou que o formulário de conta possui rolagem e que as ferramentas e o joystick permanecem disponíveis. Isso não substitui teste em um celular físico. A compatibilidade de sessão da versão instalada do Neon SDK recebe teste específico em `session-token.test.ts`.

A interface publicada também confirmou login da conta de QA, restauração da sessão ao recarregar, saldo/inventário vindos do servidor, abertura de amigos/feira, anúncio de um produto, cancelamento com devolução ao celeiro e visita aos canteiros do amigo. O navegador disparou o evento de instalação da PWA; a instalação em aparelho físico não foi executada. Movimento por clique até um canteiro e preparo da terra também foram confirmados na interface.

Captura da conta de QA na interface móvel (390×844):

![Interface móvel da beta online](screenshots/online-beta.png)

## Vida no Vale 0.5 — 26/10/2026

34 testes passaram, incluindo compatibilidade com o save anterior, preços das sete culturas, avatar, alimentação, maturação e coleta única dos animais, proteção de 24 horas do cachorro, decoração e remoção de pragas antes de colher. O build valida também os módulos usados pela API.

A conferência no navegador confirmou prévia e gravação do avatar negro de cabelo crespo, retrato atualizado, entrada e saída da casa, móveis visíveis, entrada no celeiro, navegação até o animal e abertura do painel por proximidade. Alimentação, compra de cabra e compra de ração mantiveram a venda aberta. Menus e editor também foram inspecionados em iframe de 390×844; não é teste em celular físico.

O serviço publicado foi testado com duas contas sintéticas: avatar online, compra de sementes de tulipa, decoração persistente/mudança de espaço, ajuda para plantar consumindo semente do visitante, limite de ajuda diária, roubo bloqueado sem aceite mútuo, transferência de uma unidade com replay idempotente, proteção temporária do dono, manutenção de duas unidades para o dono, limpeza de pragas sem gerar produtos, cachorro alimentado impedindo roubo, compra/alimentação de vaca e recusa de coleta antecipada, ovo coletado uma única vez, colheita de tulipa e anúncio de flor na feira. O limitador de velocidade também rejeitou um salto de posição no teste, sem alterar o estado; o teste foi ajustado para respeitar o tempo de deslocamento.

Google: o início da autenticação e a vinculação de uma sessão de QA retornaram respostas 200 e redirecionamentos para accounts.google.com, usando o provedor Neon compartilhado. A autorização completa de uma conta pessoal Google não foi executada; isso depende do jogador. Credenciais Google próprias continuam pendentes para lançamento com a marca WJ. Script de integração: `scripts/smoke-life.mjs`.

Editor da versão 0.5 em viewport de 390×844:

![Avatar inclusivo na tela móvel](screenshots/avatar-v5.png)


## Feira 0.5.1 — publicada

47 testes e build aprovados. Validação de interface executada com fazendas fictícias na prévia local, cobrindo anúncio/cancelamento de ovos, filtros e compra de leite. Layout e compra também conferidos em iframe de 390 × 844, sem aparelho físico. Após autorização do usuário, a migração foi aplicada e a versão 0.5.1 foi publicada. Escopo, evidências e passo de publicação em [FEIRA_0_5_1.md](FEIRA_0_5_1.md).


## Teste online após a publicação

`scripts/smoke-market.mjs` concluído com sucesso no endereço público, com duas contas sintéticas e produção real de um ovo. Confirmados: reserva ao anunciar, repetição idempotente do recibo, exclusão de produtos desconhecidos na resposta para clientes antigos, duas compras concorrentes com um único sucesso, transferência única de ovo e moedas, cancelamento com devolução única, replay do cancelamento sem duplicação e venda no celeiro do produto comprado. O script não gravou credenciais em disco.

O endereço principal respondeu HTTP 200 com a versão 0.5.1. A Vercel confirmou o deployment de produção como READY. Para atualizar uma instalação que ainda mantém a versão anterior no cache, fechar todas as abas do jogo e abrir novamente.


## Chegada e celeiro 0.6 — 27/10/2026

54 testes e build aprovados. Conferidos no navegador: validação do nome, galeria com seis personagens, seleção de Caio e Lia, personalização, avanço à conta, restauração de nome/avatar ao recarregar e layout 390×844. O celeiro foi conferido com as quatro espécies no mesmo InteriorScene do produto usando dados fictícios; interação por proximidade abriu o painel, e o zoom móvel alternou entre visão geral e acompanhamento do personagem. Distribuição das espécies, limites das animações, colisões e acesso a todos os portões recebem testes automatizados.

O serviço publicado foi testado com contas sintéticas: inicialização única de nome/avatar, recibo idempotente, compra de sementes e recarga sem perda de saldo/estoque, recusa de substituição do perfil existente, alimentação e produção real da galinha, coleta única com replay e recusa da coleta antecipada. O início OAuth Google respondeu 200 e redirecionou para accounts.google.com. O consentimento Google pessoal e a entrada final pelo navegador autenticado não foram executados. Não houve teste em aparelho físico. Detalhes e capturas em [CHEGADA_E_CELEIRO.md](CHEGADA_E_CELEIRO.md).
