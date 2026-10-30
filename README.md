Atualização 0.14.0: materiais e decoração dos interiores, passada de oito quadros para os animais, cuidados individuais compactos, vendedor Vartin e pesca na ponte. Compre a vara por 120 moedas na aba Pesca da venda, equipe-a e recolha a linha quando a boia sinalizar a fisgada. Lambari, Piaba, Mandi, Pacu e Tilápia ficam no inventário e podem ser vendidos. Progresso anterior preservado.

Correção 0.13.2: no celeiro, interagir com uma baia abre somente os cuidados do animal mais próximo; clicar no animal abre seu próprio painel. A lista completa fica no menu Meus animais.

Correção 0.13.1: exploração sem dicas escritas sobre o cenário, na fazenda, na casa e no celeiro. Ferramentas e ações de proximidade usam ícones; informações detalhadas continuam nos painéis do menu.

Atualização 0.13.0: interface enxuta com relógio, moedas e ferramentas. Conta, cuidados, missão, desempenho e demais opções ficam no menu ☰. Sementes aparecem ao plantar; avisos do mapa são contextuais.

Correção 0.12.6: passos horizontais do cachorro com passada e levantamento de patas mais visíveis, mantendo o tronco estável e os quadros isolados.

Correção 0.12.5: o cachorro usa 24 texturas individuais opacas, alinhadas ao chão. O acompanhante mantém a silhueta em pé durante pausas breves da física e só senta após 1,2 segundo parado, evitando alternância de poses durante a caminhada.

Correção 0.12.4: cache do piso preserva indicadores vivos e ovos, mantendo posições individuais e recuperando o desenho original se a captura falhar. Acabamento gráfico do celeiro retomado.

Correção 0.12.3: restauração da apresentação anterior do celeiro e recuperação de falhas durante criação/atualização de interiores, com mensagem de diagnóstico e nova tentativa sem apagar dados.

Correção 0.12.2: entrada por E não repete o comando no interior; caminhada dos cães usa silhuetas estáveis, opacas e quadros com margem transparente.

Atualização 0.12.1: celeiro com madeira e ferragens detalhadas, corredor de pedra, palha orgânica, depósitos variados e casinha dos cães. Contas, regras e produção preservadas.

Atualização 0.12.0: cuidados progressivos dos animais e plantas, doença e tratamentos, instalações externas com transferências, ovos visíveis e criação de pintinhos. Regras e limites em [docs/CRIACAO_0_12.md](docs/CRIACAO_0_12.md).

Atualização 0.11.0: iluminação mais clara, respiração com quadros próprios de pixel art, contador real de FPS e efeitos adaptativos. Escopo e limites em [docs/DESEMPENHO_0_11.md](docs/DESEMPENHO_0_11.md).

Correção 0.10.1: respiração contínua em pé, sentada e deitada, com progresso preservado.

# Fazendinha WJ

Versão 0.10.0 — Personagem senta, liga a TV e dorme na cama. Relógio com períodos do dia, estações e iluminação, salvo por fazenda. Detalhes em [TEMPO_E_CASA.md](docs/TEMPO_E_CASA.md).

Versão 0.9.2 — Casa reorganizada com cama e armário nos cantos e sofá de frente para a TV; novos materiais no celeiro. Veja [INTERIORES_0_9_2.md](docs/INTERIORES_0_9_2.md).

Versão 0.9.1 — Respiração contínua da personagem quando parada, na fazenda e nos interiores. Melhora quarto e celeiro, aumenta a legibilidade das galinhas e corrige bordas translúcidas dos cães. Na venda, **Terrenos e obras** permite escolher três áreas do mapa, comprar até 36 espaços adicionais e construir abrigo de ferramentas ou coreto com posição salva. O terreno fixo antigo mantém seu local e suas plantações. Veja [TERRENOS_0_9.md](docs/TERRENOS_0_9.md).

A versão 0.8 adicionou casa proporcional com móveis originais, cuidados animados no celeiro, respiração e ações sem avisos repetitivos. Detalhes em [INTERIORES_0_8.md](docs/INTERIORES_0_8.md).

Versão 0.7.0 — Cachorros com passos direcionais, celeiro com materiais detalhados, entradas por proximidade e ambiente com vento e pássaros. Detalhes em [AMBIENTE_0_7.md](docs/AMBIENTE_0_7.md).

Chegada ao vale e celeiro reorganizado: Nome, seleção visual de personagem e conta antes da primeira fazenda; perfis existentes preservados. Detalhes em [CHEGADA_E_CELEIRO.md](docs/CHEGADA_E_CELEIRO.md). Protótipo original de um jogo de fazenda para navegador, pensado para celular e PC. O nome do cenário, **Vale do Sossego**, é provisório.

A correção 0.3.1 usa sprites completos para carregar enxada, sementes e regador, com o item desenhado junto às mãos durante a caminhada.

A versão 0.3 adiciona galinhas detalhadas e animadas, ferramentas na mão, poses de cavar e regar, água com gotas e respingos e compras consecutivas sem fechar a venda. Veja `docs/ANIMACOES.md`.

Veja [Vida no Vale](docs/VIDA_NO_VALE.md) para Google/Gmail, editor de avatar, pragas, novas culturas, animais produtivos, roubo consensual, decoração e interiores caminháveis.

## Jogar e desenvolver

Requer Node.js 22.12+ (ou 20.19+).

```bash
npm ci
npm run dev
```

Abra a URL informada pelo Vite. Para produção: `npm run build`; os arquivos gerados ficam em `dist/`. No Vercel, importe este repositório, use o preset Vite, comando `npm run build` e diretório `dist`. A versão local funciona sem credenciais. A conta online usa os endpoints Node em `api/` e as variáveis descritas em `.env.example`; nunca exponha `DATABASE_URL` ao cliente. O Vite local serve somente o frontend. Para desenvolver os endpoints, use o ambiente Vercel com um banco de desenvolvimento separado. Consulte [ONLINE.md](docs/ONLINE.md).

```bash
npm test
npm run build
```

## O que já funciona

- Mapa com casa, venda, celeiro, rio, ponte, árvores e galinhas animadas.
- Personagem com animações em quatro direções, câmera acompanhando e colisão com construções, árvores e cercas.
- Movimento com WASD/setas, joystick virtual ou clique no mapa.
- Preparar terra, plantar, regar, esperar, colher e vender.
- Cenoura (45s), alface (90s) e tomate (150s), com tempos de demonstração.
- Compra de sementes na venda, escolha de cultura, inventário e missão inicial.
- Teste local preservado, separado da fazenda da conta.
- Conta por e-mail, salvamento online e mesma fazenda entre celular e PC.
- Servidor determina preços, tempo, energia, XP, expansão e resultados das ações.
- Amizades com aceite, visita em painel aos canteiros, ajuda diária para regar e feira de culturas, ovos e leites com produtos reservados.
- Instalação PWA pelo navegador e cache da interface e da arte.

## Controles

| Ação | PC | Celular |
| --- | --- | --- |
| Andar | WASD/setas ou clique no mapa | Joystick ou toque no mapa |
| Trocar ferramenta | 1–4 ou barra inferior | Barra inferior |
| Agir | E, perto do alvo, ou clique no canteiro | Usar, perto do alvo, ou toque no canteiro |
| Trocar cultura | Botão da semente atual | Botão da semente atual |
| Entrar nas construções | Aproximar e clicar em Entrar ou apertar E; clicar na construção para ir até a porta | Aproximar e tocar em Entrar; tocar na construção para ir até a porta |
| Comprar sementes | Clique na venda e caminhe até ela | Toque na venda e caminhe até ela |
| Vender produtos | Botão Celeiro | Botão Celeiro |

O clique calcula uma rota A* ao redor dos obstáculos sólidos. Canteiros não bloqueiam o movimento. As ferramentas exigem proximidade do personagem.

## Limites desta versão

A conta online precisa de rede para confirmar ações. Sem login, o teste continua salvo somente neste aparelho. A fazenda online começa nova, com 12 canteiros e expansão até 24; o save local anterior permanece guardado.

Esta beta ainda não inclui jogadores andando juntos, visitas dentro do mapa do amigo, clima dinâmico, construção livre, receitas ou publicação nas lojas. As visitas atuais mostram os canteiros no painel. A estação é ambientação fixa. A proteção cobre a economia e as transações, sem simular toda a física no servidor. Testes em celulares físicos e endurecimento do cadastro para lançamento público permanecem no [roadmap](docs/ROADMAP.md).

A versão 0.2 integra sprites originais gerados para o projeto, personagem com 16 quadros, 12 fases de culturas, novos cenários, sombras e interface de RPG. Os atlas, prompts e o preparo dos sprites estão versionados em `art-source/`, `scripts/prepare-art.py` e `docs/ARTE.md`. O solo e os efeitos complementares são desenhados em canvas. Não utilizamos recursos extraídos dos jogos de referência. O acabamento continua em evolução.

## Organização

- `src/farm.ts`: ciclo agrícola e save de demonstração local.
- `src/online-rules.ts`: economia, energia, XP e expansão da conta.
- `src/cloud.ts` e `src/online-ui.ts`: sincronização, conta e comunidade.
- `api/` e `server/`: autenticação, transações e autorização.
- `migrations/001-online.sql`: esquema do banco.
- `src/pathfinding.ts`: navegação ao redor dos obstáculos.
- `scripts/build-sw.mjs`: cache versionado da PWA.
- `src/art.ts`: texturas auxiliares e quadros do personagem.
- `src/terrain.ts`: chão e efeitos de atmosfera.
- `public/assets/v2/`: sprites e ícones preparados.
- `art-source/`: atlas e prompts da geração.
- `docs/ARTE.md`: direção de arte e limites da versão 0.2.
- `src/main.ts`: cena Phaser, movimento, colisões e interface.
- `src/action-timing.ts`: sincronização e confirmação única das ações.
- `src/work-effects.ts`: água, respingos, umidade e torrões.
- `src/chickens.ts`: animação e movimento das galinhas.
- `public/assets/v3/`: animações de trabalho e animais.
- `src/style.css`: interface e controles responsivos.
- `tests/farm.test.ts`: testes das regras econômicas e persistência.
- `docs/ESTUDO_REFERENCIA.md`: levantamento do jogo analisado e proposta inicial.
- `docs/ROADMAP.md`: etapas e pendências.
- `docs/ARQUITETURA.md`: decisões da implementação atual.
- `docs/VALIDACAO.md`: verificações desta entrega e limitações de teste.

## Tecnologia e autoria

Phaser 3.90, TypeScript e Vite. Phaser é distribuído sob licença MIT; as licenças das dependências continuam aplicáveis. As fontes DM Sans e Fraunces são carregadas do Google Fonts com alternativas locais; sem rede, a interface usa fontes do sistema. Futuramente, hospedar as fontes junto ao jogo.

Código e desenhos originais desenvolvidos para WJ Tecnologia. A licença de distribuição do projeto ainda será definida pelo proprietário. A inspiração é de gênero e mecânicas; não há afiliação com os jogos citados.
