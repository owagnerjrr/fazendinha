# Saída visível do coelho autônomo — 0.56.4

O controlador de espécies criadas filtrava o animal pela sala calculada pelo relógio. Na mudança de período da autonomia, destruía imediatamente o sprite mesmo longe da saída. Reproduzido com relógio controlado: coelho removido da tela após 200 ms, preservado no estado/inventário de animais.

Agora o horário define o destino, mas um animal já visível permanece na cena até alcançar a passagem correspondente. A rota de saída tem prioridade sobre passeios e brincadeiras autônomas. Casa/celeiro usam aproximação frontal das entradas atuais, com folga para a grade de navegação. Se a passagem estiver bloqueada, o animal continua visível em vez de ser ocultado no meio do cenário.

Painel aberto e aproximação/carinho mantêm o animal presente. Movimentação e planejamento ficam pausados quando a interface bloqueia os comandos. Ao retomar, a saída segue normalmente. A autonomia continua habilitada; não foram modificadas escolhas salvas, propriedade, nomes, vínculos ou necessidades.

A mudança é compartilhada pelo controlador do coelho e das demais espécies criadas pelo painel; não altera o sistema de criação nem reescreve dados. O controle lógico da rota e suas salas existentes foi preservado.

Validação local em Edge desktop 1280×844 e emulação móvel 390×844: virada de horário com painel de cuidado aberto, manutenção da presença/posição durante a pausa, fechamento e caminhada real completa até a saída, entrada na casa e reencontro com o mesmo coelho. Um único registro permaneceu antes/depois e nenhum erro JavaScript foi registrado. Testes de regressão cobrem presença longe da saída, permanência durante cuidado/pausa e coordenadas atuais das portas.

Emulação não substitui aparelho físico. Sem migração ou alterações econômicas.

434 testes automatizados e build passaram. Conferida também a aproximação para cuidado atravessando a mudança de horário, sem perder o alvo.
