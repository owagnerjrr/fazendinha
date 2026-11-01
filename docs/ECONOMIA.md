# Economia — reequilíbrio 0.42

Base: preços do código e catálogo publicado consultado em 31/10/2026. O objetivo é apoiar uma etapa de progresso sem comprar várias fazendas completas. Níveis, vagas e desbloqueios continuam valendo. Nenhum saldo ou bem existente é convertido.

## Cálculo dos pacotes

Antes, 10.000 moedas por R$10 compravam 111 galinhas, 28 vacas ou 13 terrenos, desconsiderando limites de vagas e nível.

Cesta inicial: galinha 90 + gato 160 + vara 120 + 5 sementes de cenoura 40 + 5 rações 10 + 3 remédios 30 = **450 moedas**. O novo pacote menor tem 500, deixando 50 para outros cuidados.

Cesta de expansão: terreno 750 + galinheiro 220 + vaca 350 + cabra 230 + cachorro 180 + 10 rações 20 + 5 sementes de tomate 90 + 3 remédios 30 + 5 palhas 10 = **1.880 moedas**. Com Guardião do Vale (600), total **2.480**, compatível com o pacote maior de 2.500, sem financiar várias expansões completas.

| Pagamento | Antes | Novo |
|---|---:|---:|
| R$10 | 10.000 | 500 |
| R$20 | 20.000 | 1.000 |
| R$30 | 30.000 | 1.500 |
| R$40 | 40.000 | 2.000 |
| R$50 | 50.000 | 2.500 |

Taxa uniforme de **50 moedas por real**, sem bônus crescente nos pacotes maiores. Redução de 95% nas moedas das novas ofertas. Pix e cartão mantêm os mesmos valores em reais e checkout hospedado.

## Inventário dos custos

| Categoria | Preços atuais em moedas |
|---|---|
| Sementes/unidade | Cenoura 8; alface 12; tomate 18; morango 15; milho 20; tulipa 14; girassol 24. Pacotes de 5: 40, 60, 90, 75, 100, 70, 120 |
| Animais | Pintinho 45; galinha 90; galo 130; gato 160; cachorro 180; cabra 230; vaca 350 |
| Animal personalizado publicado | Meu coelho: 100. Novas criações conservam o preço definido no painel |
| Alimentos e cuidados | 5 rações: 10; 3 remédios: 30; 3 defensivos: 18; 5 palhas: 10 |
| Pesca | Vara permanente: 120 |
| Terrenos | 750 cada, nos locais e limites já existentes |
| Construções | Coreto 180; galinheiro 220; abrigo 250; piquete 300 |
| Jardim | Jardineira 45; girassol decorativo 65; cacau decorativo 120 |
| Móveis | Banco 45; flores 50; quadro 60; tapete 75; árvore ornamental 90; estante 180 |
| Remodelação | Natural grátis; verde 150; rosada 150; azul 180. Temas já adquiridos: grátis |
| Expansões legadas do motor | Etapas 100 / 250 / 500; preservadas por compatibilidade, distintas dos terrenos atuais |
| Ferramentas e ações | Mão, enxada e regador sem taxa por ação; plantar consome a semente. Água, carinho, brincadeira e passeio sem custo em moedas |
| Cosméticos/modelos personalizados | Preço definido na publicação; nenhum estava publicado como comprável na consulta de produção |
| Fertilizantes pagos | 5 por R$10, preservado; não foi convertido em pacote de moedas |

Não foram inflacionados os preços de animais, sementes, móveis ou terrenos para retirar indiretamente o poder de compra de saldos antigos.

## Roupas

| Roupa | Antes | Novo |
|---|---:|---:|
| Jardineiro Rubi | 2.000 | 400 |
| Guardião do Vale | 2.500 | 600 |
| Explorador Solar | 4.000 | 850 |

O figurino custa agora aproximadamente de uma vaca a um terreno e segue opcional, sem vantagem de produção. Roupas já compradas permanecem adquiridas e equipar continua grátis. Não há cobrança, reembolso ou ajuste de saldo retroativo.

## Receitas e limites do cálculo

Venda de colheitas por unidade: cenoura 12, alface 18, tomate 26, morango 23, milho 32, tulipa 22 e girassol 40. Produção normal: 3 unidades. Uma rodada de 24 cenouras, sem perdas, rende líquido 24 × (3 × 12 − 8) = **672 moedas em 15 minutos**, antes de diferenças de manejo/progresso. Os pacotes são apoio opcional; não substituem a atividade no jogo.

Produtos animais: ovo 12, leite 35 e leite de cabra 26. Peixes: piaba 6, lambari 8, tilápia 20, mandi 24 e pacu 45. Sementes podem ser revendidas por metade do preço unitário, arredondada para baixo. Preços de ofertas antigas da feira continuam registrados; a feira não foi reintroduzida.

Ganhos de colheita, produção, pesca, missão e convite não foram reduzidos. Convite confirmado continua gerando **1.000 moedas**, conforme suas regras existentes, equivalente em quantidade a dois pacotes menores. Esse incentivo pode ser reavaliado separadamente; não foi alterado silenciosamente nem retirado de quem já recebeu. A análise calibra o poder de compra; não garante equilíbrio definitivo de toda a economia sem observação do uso real.

## Pagamentos e preservação

A migração 018 cria versão 2 para as cinco ofertas. Grava histórico e auditoria, é idempotente e recusa alterações administrativas inesperadas, revertendo integralmente em caso de conflito. Não atualiza fazendas, pedidos, pagamentos ou versões históricas; f5 permanece intacto.

Pedidos anteriores, inclusive pendentes aprovados depois do corte, mantêm quantidade, preço e nome prometidos. O fallback dos pedidos sem versão continua fixo nos contratos originais; pedidos versionados malformados são recusados, sem recorrer aos preços novos. Clientes com a oferta antiga recebem conflito para reabrir a loja antes de criar novo pedido. Entrega e reembolso seguem o contrato salvo, com proteção contra repetição. Nenhum teste cria cobrança ou reembolso real.
