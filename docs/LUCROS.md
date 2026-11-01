# Lucros — versão 0.43

Ajuste de cultivo e produção animal. Não converte saldos, não remove estoque nem altera compras. Preços de sementes, ração, tratamentos, terrenos, roupas e pacotes permanecem na versão 0.42. Os preços unitários de revenda também permanecem iguais, protegendo produtos já guardados.

## Plantios novos

| Cultura | Tempo real | Quantidade normal | Líquido por planta | Líquido/hora por espaço |
|---|---:|---:|---:|---:|
| Cenoura | 15 min | 1 | 4 | 16 |
| Alface | 20 min | 1 | 6 | 18 |
| Tomate | 90 min | 2 | 34 | 22,67 |
| Morango | 75 min | 2 | 31 | 24,80 |
| Milho | 90 min | 2 | 44 | 29,33 |
| Tulipa | 30 min | 1 | 8 | 16 |
| Girassol | 110 min | 2 | 56 | 30,55 |

Líquido = quantidade × venda unitária − semente. Valores ideais, antes de cuidados, clima e visitas. 24 cenouras passam de 672 para **96 moedas líquidas por rodada**. Culturas demoradas compensam mais a espera. Não há arredondamento de frações em pagamentos: apenas o comparativo horário usa decimais.

Cada novo plantio salva duração e quantidade. Plantios anteriores sem harvestYield continuam rendendo 3, respeitando growthDurationMs já salvo. Plantios por visitantes usam os mesmos valores no servidor. Replantar usa as regras novas. Colheitas com pragas e roubo mantêm suas regras existentes, incluindo a proteção mínima do dono.

## Animais

| Animal | Antes | Novos ciclos | Venda unitária | Receita máxima/hora |
|---|---:|---:|---:|---:|
| Galinha | 90 s | 15 min | 12 | 48 |
| Cabra | 150 s | 30 min | 26 | 52 |
| Vaca | 180 s | 45 min | 35 | 46,67 |

Receita bruta ideal com coleta pontual; ração, cuidados, doença e limites de produto pendente reduzem o resultado. Continua existindo somente um produto pendente por animal, sem acumular horas de produção offline. Animais antigos terminam o primeiro ciclo pelas regras anteriores; ao coletar, salvar productionVersion=1 ativa o intervalo novo. Compras novas e maturação já usam a versão nova. Produtos pendentes permanecem disponíveis, sem duplicação. Fome/sede/saúde não foram aceleradas. Gatos e cachorros continuam sem produção monetária.

## Escopo e limites

Não alteramos conteúdos personalizados, preços definidos pelo administrador, pesca, missões nem bônus de convite de 1.000 moedas. O convite continua alto frente aos pacotes e precisa de revisão própria com preservação dos contratos/recompensas pendentes. Não é uma alegação de equilíbrio definitivo de toda a economia. Pacotes e pedidos pagos não são modificados. Nenhuma migração ou escrita direta no banco é necessária.

## Validação

328 testes automatizados passaram; build de produção passou. Navegador com interface real e fazenda isolada em memória: 1280/390px, indicadores dos sete cultivos e três produtores, venda de parte e de todo um item, preservação do valor do estoque, plantio/colheita sem repetição e restauração local após reabrir. Não usamos contas reais para antecipar relógios, produzir ou vender. Os ciclos longos foram verificados por relógio controlado, não por espera de 110 minutos reais. Nenhuma cobrança ou migração de banco.
