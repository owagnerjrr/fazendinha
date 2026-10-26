> Atualização 0.4: a conta online, as regras e o escopo social estão descritos em [ONLINE.md](ONLINE.md). As descrições abaixo da versão local 0.3 são históricas.

# Validação da versão 0.1

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
