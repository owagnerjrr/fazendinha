# Vida no Campo — versão 0.3

## Correção 0.3.1 — equipamento integrado à caminhada

As imagens relatadas pelo usuário mostraram a falha da composição por ícones separados: enxada invertida e sementes/regador sem contato com as mãos. A camada separada de equipamentos foi removida do personagem. Agora cada cultura de equipamento tem uma folha com 16 quadros completos, em quatro direções, com corpo, braços, mãos e item desenhados juntos.

A lâmina da enxada acompanha o sentido lateral da caminhada. O saco de sementes é apoiado na cintura e segurado pelas mãos; o regador é carregado pela alça com apoio do outro braço. De costas, o corpo pode esconder parte do item, conforme a perspectiva. Nenhum desses objetos usa espelhamento ou pivô de ícone de inventário durante a caminhada.

Os sprites carregados também são usados quando a personagem para. Ao cavar ou regar, continuam sendo usadas as poses de ação e os efeitos da versão 0.3. A escala é calibrada pelo chapéu; o alinhamento horizontal da caminhada usa o centro da cabeça, evitando oscilação causada pelo pé que fica à frente.

Fontes: `art-source/carry/`. Recursos de execução: `public/assets/v3/carry-hoe.png`, `carry-seed.png` e `carry-water.png`. Preparação: `python3 scripts/prepare-carry-art.py` (Pillow). Prompts completos em `art-source/carry/GENERATION.md`.

## Galinhas

O novo atlas tem 16 quadros originais, com penas, crista e sombreamento na linguagem do fazendeiro. Há caminhada para os dois lados e sequências de bicada. As quatro galinhas alternam caminhada, pausa e bicadas dentro do cercado; a profundidade e as sombras acompanham a posição. Uma separação suave evita empilhar as quatro imagens. Elas continuam sendo animais decorativos: esta etapa não adiciona produção de ovos ou compras de animais.

## Ferramentas e ações

- Enxada e regador aparecem nas mãos ao selecionar. Parado, o fazendeiro usa a pose de segurar o equipamento; andando, os objetos acompanham a mão e o balanço do corpo.
- Duas folhas de ação, com 16 quadros cada, mostram os braços e o corpo trabalhando em quatro direções.
- A enxada é levantada, golpeia a terra e retorna à posição de descanso; o solo muda no impacto e levanta pequenos torrões com trajetória de queda.
- O regador é estendido e inclinado. O jato nasce no bico do sprite, tem gotas em três filetes, trajetórias curtas, respingos e uma película de umidade que se dissipa no canteiro.
- A água é estilizada em pixel art. Não é uma simulação física de fluidos.
- Preparar e molhar a terra acontecem em marcos da animação, não no clique inicial. A ação em andamento registra ferramenta e cultura para que trocar a seleção não altere a operação já iniciada.
- O personagem fica parado durante o gesto. Um novo destino pode ficar na fila e as ferramentas continuam selecionáveis. Repetir a ação antes do fim não duplica seus efeitos.
- Ao sair da página ou abrir uma janela, uma ação já iniciada é concluída uma única vez antes do salvamento. Os relógios das plantas continuam no mesmo formato da versão anterior.

O sprite visível do personagem foi separado do corpo físico para que quadros maiores de ferramenta não modifiquem a colisão ou o ponto dos pés.

O botão Usar e a tecla E priorizam canteiros próximos que precisam da ferramenta selecionada. Assim, um canteiro vazio ao lado não impede regar uma planta próxima depois de recarregar a página. O canteiro clicado continua tendo prioridade enquanto a ferramenta é útil nele.

## Venda

A compra atualiza saldo, estoque, disponibilidade dos botões e mensagem de confirmação dentro da mesma janela. O foco não é recriado a cada compra. O usuário pode comprar pacotes de culturas diferentes na mesma visita. A venda só fecha com o botão **Sair da venda** ou com o botão explícito de fechar; clicar fora e pressionar Escape não fecha essa janela.

O catálogo segue contendo as três culturas existentes. Não foram adicionados produtos sem regras de uso correspondentes.

## Preparar os recursos

```bash
python3 -m pip install Pillow
python3 scripts/prepare-animation-art.py
```

O jogo usa os arquivos preparados e não precisa de Python durante o build ou a execução. Os prompts e a identificação da ferramenta estão em `art-source/v3/GENERATION.md`.
