# Fazendinha WJ

Protótipo original de um jogo de fazenda para navegador, pensado para celular e PC. O nome do cenário, **Vale do Sossego**, é provisório.

## Jogar e desenvolver

Requer Node.js 22.12+ (ou 20.19+).

```bash
npm ci
npm run dev
```

Abra a URL informada pelo Vite. Para produção: `npm run build`; os arquivos gerados ficam em `dist/`. No Vercel, importe este repositório, use o preset Vite, comando `npm run build` e diretório `dist`. Nenhuma variável de ambiente é necessária nesta fase. Publicar o repositório não cria automaticamente um site hospedado.

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
- Progresso local com validação de formato; plantas regadas crescem por horário mesmo com a página fechada.

## Controles

| Ação | PC | Celular |
| --- | --- | --- |
| Andar | WASD/setas ou clique no mapa | Joystick ou toque no mapa |
| Trocar ferramenta | 1–4 ou barra inferior | Barra inferior |
| Agir | E, perto do alvo, ou clique no canteiro | Usar, perto do alvo, ou toque no canteiro |
| Trocar cultura | Botão da semente atual | Botão da semente atual |
| Comprar sementes | Clique na venda e caminhe até ela | Toque na venda e caminhe até ela |
| Vender produtos | Botão Celeiro | Botão Celeiro |

O clique movimenta em linha reta; ainda não calcula um caminho ao redor de obstáculos. Use os controles para contornar. Canteiros não bloqueiam o movimento.

## Limites desta versão

**Ainda não há conta, servidor, sincronização entre aparelhos, multiplayer, feira, clima dinâmico, construção livre ou instalação PWA.** A estação mostrada é ambientação fixa. O progresso pertence ao navegador e pode ser perdido ao limpar seus dados. Não é uma economia segura para competição: regras e relógio ainda rodam no cliente. A arquitetura online está planejada em `docs/ARQUITETURA.md`.

Os gráficos são desenhos originais gerados por código em `src/art.ts`, provisórios para validar escala, perspectiva e interação. Não utilizamos recursos do jogo de referência ou de Stardew Valley. A qualidade final da direção de arte ainda será desenvolvida.

## Organização

- `src/farm.ts`: regras, inventário, progressão, compra/venda e validação do save.
- `src/art.ts`: texturas procedurais originais.
- `src/main.ts`: cena Phaser, movimento, colisões e interface.
- `src/style.css`: interface e controles responsivos.
- `tests/farm.test.ts`: testes das regras econômicas e persistência.
- `docs/ESTUDO_REFERENCIA.md`: levantamento do jogo analisado e proposta inicial.
- `docs/ROADMAP.md`: etapas e pendências.
- `docs/ARQUITETURA.md`: decisões de implementação e plano do servidor.
- `docs/VALIDACAO.md`: verificações desta entrega e limitações de teste.

## Tecnologia e autoria

Phaser 3.90, TypeScript e Vite. Phaser é distribuído sob licença MIT; as licenças das dependências continuam aplicáveis. As fontes DM Sans e Fraunces são carregadas do Google Fonts com alternativas locais; sem rede, a interface usa fontes do sistema. Futuramente, hospedar as fontes junto ao jogo.

Código e desenhos originais desenvolvidos para WJ Tecnologia. A licença de distribuição do projeto ainda será definida pelo proprietário. A inspiração é de gênero e mecânicas; não há afiliação com os jogos citados.
