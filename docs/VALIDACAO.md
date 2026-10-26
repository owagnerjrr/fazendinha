# Validação da versão 0.1

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
