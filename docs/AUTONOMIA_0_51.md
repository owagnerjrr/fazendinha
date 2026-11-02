# Autonomia e companhia no sono — 0.51.0

Os animais podem explorar a fazenda, o celeiro principal, a casa e os Campos do Sul. A rota alterna ambientes conectados (celeiro → fazenda → casa → fazenda → sul → fazenda), com períodos de dois minutos e destinos individuais. Cada identificador tem um único ambiente; recarregar não cria animais. A simulação de localização usa o identificador e o relógio real, sem gravar coordenadas a cada quadro. As aproximações às saídas são animadas; a troca de cena é simulada, não um servidor de física contínua.

Gato, cachorro e animais de produção usam navegação com obstáculos, separação, velocidades por espécie, passos sincronizados ao movimento e pausas. Animais próximos podem perseguir um brinquedo compartilhado, sem gerar produtos ou recompensas. Criações administrativas também exploram e brincam com outras criações, respeitando os ambientes cadastrados; não foi implementada brincadeira entre um animal criado no painel e uma espécie nativa.

Em **Meus animais**, use **Liberar autonomia de todos** ou o botão individual. A opção individual também existe nas espécies criadas no painel. Escolher explicitamente onde um gato, cachorro ou espécie criada deve ficar desativa sua autonomia; o valor anterior não é apagado. Passeios, chamados e cuidados têm prioridade. Ao encerrar, a exploração é retomada. Animais de produção conservam sua instalação e baia de origem para capacidade e entrega de ovos/leite. A autonomia não vende, transfere nem alimenta automaticamente.

Na cama, **Quem vai dormir com você?** permite selecionar animais próprios ou dormir sozinho. A seleção fica salva e pré-marcada. Os escolhidos descansam no chão da casa durante a transição de sono e depois retomam sua configuração. Espécies administrativas sem permissão para casa não aparecem na lista. A API rejeita identificadores de outras contas, duplicatas e companhias incompatíveis. O calendário, o avanço de tempo e as regras de necessidades existentes permanecem iguais.

Dados: somente campos opcionais `Animal.autonomy`, `StudioPet.autonomy`, `home.sleepCompanions` e `home.sleep.companions` no JSON já existente. Não há migração SQL ou substituição de fazendas. Protocolo 21 impede gravações por clientes antigos; os pacotes pagos continuam com os mesmos contratos, preços e permissões.

Validação local: 381 testes de regras/regressão e build; navegador Edge headless em 1440 e 390 px, com quatro espécies nativas, presença nos quatro ambientes, deslocamento real, seleção e salvamento de companhia e despertar. Revisadas capturas da casa e do seletor móvel. Esses testes usam fixtures locais, não contas reais. Não representam medição de 60 FPS em aparelhos físicos nem teste prolongado de 40 animais. Validação online e publicação são registradas em VALIDACAO.md após execução.

Homologação online: projeto de testes no commit 470a0b1, API autenticada e navegador 1440/390px aprovaram persistência, botão coletivo, recarga, companhia/despertar, autorização e idempotência. A conta QA isolada recebeu dois animais de fixture; permaneceu com 50 moedas. Não foram criadas cobranças nem alteradas contas reais. A publicação principal é conferida depois da integração do PR.

## Ajuste 0.51.1
A exploração exige `autonomy: true` explícito. Animais sem essa seleção conservam seu local e baia; os que apenas passaram a explorar com o padrão anterior retornam automaticamente. Escolhas explícitas já salvas não são apagadas. Passeios, chamados e companhia no sono continuam disponíveis. Não há migração ou escrita em massa de dados.
