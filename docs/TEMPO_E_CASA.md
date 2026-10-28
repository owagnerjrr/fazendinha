# Vida em casa e calendário — 0.10.0

O abajur e sua mesa ficam no canto inferior esquerdo junto às paredes. O sofá foi redesenhado com almofadas orientadas para a TV e encosto em uma camada separada, que permite ver a personagem sentada por dentro dele. As interações usam a rota real até o ponto acessível do móvel, com clique/toque ou proximidade e E/Usar.

Sentar muda a pose e mantém a personagem olhando para a TV. Levantar, andar ou usar o botão devolve a personagem ao corredor livre. A TV tem ligar/desligar persistente e um cenário animado na tela; também pode ser acionada enquanto a personagem está sentada. A cama mostra a personagem deitada sob a coberta, com sinal de sono. O repouso dura pelo menos seis segundos reais e avança o calendário até a próxima manhã às 06:00. Acordar não retrocede o relógio se muito tempo já tiver passado com o jogo fechado.

Cada segundo real equivale a um minuto no jogo: o dia completo dura 24 minutos reais. Madrugada vai de 00:00 a 05:59, manhã de 06:00 a 11:59, tarde de 12:00 a 17:59 e noite de 18:00 a 23:59. Cada estação dura 28 dias: primavera, verão, outono e inverno, com ano de 112 dias. O relógio superior mostra hora, período, dia da estação e ano. A iluminação muda gradualmente com a hora, com interiores mais claros.

O calendário continua pelo tempo decorrido com o jogo fechado e é salvo por fazenda, junto ao estado da TV e do descanso. Fazendas online antigas recebem apenas o campo de calendário ausente, sem substituir o estado ou a revisão. As ações de casa passam pelas transações e recibos já existentes. O cliente usa a referência de tempo retornada pelo servidor. Clientes antigos são impedidos de alterar uma fazenda após usar os novos recursos domésticos.

O salto do calendário ao dormir é separado dos horários reais das plantas e animais e da recuperação de energia. Dormir não cria colheitas, moedas ou energia instantânea; a recuperação existente continua pelo tempo real. As estações são calendário e ambientação: neve, clima sazonal e exigências de cultivo por estação não estão incluídos nesta entrega.

Os testes automatizados cobrem limites dos períodos, virada de estações/ano, salvamento, tempo mínimo de sono, impossibilidade de repetir o despertar e preservação dos cronômetros de cultivo e dos recursos. A página QA usa as cenas reais com dados fictícios; botões de avançar hora e estação são exclusivos dessa página e não integram o jogo publicado. O teste online é executado com uma conta sintética pelo script `scripts/smoke-home.mjs`.
