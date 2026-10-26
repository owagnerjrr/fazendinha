# Direção de arte — Bosque Vivo, versão 0.2

Referência indicada pelo proprietário: [Rogue Heroes: Ruins of Tasos, Team17](https://www.team17.com/games/rogue-heroes-ruins-of-tasos). Foram observadas a página oficial e imagens de divulgação. A referência orienta densidade, perspectiva, cores e leitura dos cenários. Os recursos visuais desta versão foram gerados especificamente para a Fazendinha WJ; não foram extraídos do jogo de referência.

## Mudanças implementadas

- Sprites transparentes detalhados para casa, celeiro, venda, moinho, poço, quatro tipos de árvore, pedras, arbusto e cerca.
- Fazendeiro com 16 quadros, organizados em quatro direções e quatro fases de caminhada, com os pés alinhados na preparação dos arquivos.
- Doze sprites para fases de crescimento das três culturas.
- Ícones próprios de enxada, regador, sementes e mochila; mão em SVG com desenho em pixels.
- Solo em cores mais vivas, variação da grama por aglomerados, borda do canteiro, terra preparada e úmida, caminho com cascalho, pedras, margens e profundidade visual do rio.
- Sombras de contato, sombras suaves de nuvens em movimento, pólen, vinheta discreta e transparência das copas quando encobrem o personagem.
- Interface de RPG com molduras em madeira, verde escuro, dourado e pergaminho, além de tela de carregamento.

As sombras e a vinheta são efeitos visuais; não constituem um sistema físico de iluminação ou novo ciclo de dia e noite. O moinho é um objeto decorativo e suas pás não têm rotação independente nesta entrega. As culturas continuam usando as mesmas regras e o mesmo formato de save da versão anterior.

## Fontes de arte e preparação

`art-source/environment.png`, `art-source/farmer.png` e `art-source/crops.png` são cópias dos atlas gerados, com paleta reduzida a 256 cores para versionamento. Os sprites usados pelo jogo estão em `public/assets/v2/`. A preparação técnica recorta os objetos, preserva transparência, usa nearest-neighbor e fixa uma escala comum para os quadros do personagem.

```bash
python3 -m pip install Pillow
python3 scripts/prepare-art.py
```

A execução normal e o build não dependem de Python nem de geração de imagens. Os PNGs preparados já estão versionados.

Os briefs completos da geração e a ferramenta usada estão em `art-source/GENERATION.md`. Os arquivos `src/terrain.ts` e `src/art.ts` completam os recursos por desenho em canvas; `src/theme.css` define as molduras da interface.

## Limites de qualidade e compatibilidade

A versão busca aproximar a linguagem visual da referência, sem afirmar equivalência ao acabamento completo de um jogo comercial. Movimento por clique continua direto, sem cálculo de caminho. Ainda faltam animações dedicadas por ferramenta, áudio e testes de desempenho em aparelhos físicos. As fontes da interface ainda usam Google Fonts com fallback local.
