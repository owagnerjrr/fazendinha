# Vale vivo — 0.29.0

## Integração

Reutiliza relógio, iluminação, cuidados, animações, inventário, recibos idempotentes e autenticação existentes. Não há reset nem substituição de dados. Sem migração de tabelas: novos campos JSON são aditivos. Clientes antigos são orientados a atualizar quando uma fazenda ativa os novos cuidados (protocolo 13).

## Clima e culturas

Seis condições: aberto, sol forte, nublado, chuva leve/forte e tempestade. Evolução determinística pela origem do relógio e calendário salvo, com blocos de 4/7/5/8 horas do vale (4/7/5/8 minutos reais), probabilidades sazonais e intensidades variáveis. Recarregar não sorteia outro clima. Chuva, respingos, sombra de nuvens, raios esparsos e trovões próprios; áudio e efeitos externos param ao entrar nos interiores. A iluminação existente de cinco períodos continua cobrindo cenário e atores; janelas/luminárias e interfaces permanecem legíveis.

Chuva mantém umidade. Chuva prolongada acumula encharcamento; excesso e calor sem água acumulam estresse segundo a resistência da cultura. Sol moderado dá bônus de crescimento de 4% durante acompanhamento ativo. Avisos DRENAR/PROTEGER precedem doença; não há exclusão automática de planta. Drenagem e proteção de palha são gratuitas no painel Cuidados. Água e defensivo permitem tratar plantas doentes. Em ausência, consequências novas contam no máximo 2 minutos por retorno; crescimento e cuidados antigos preservam o tempo real. Sono altera o calendário/clima atual, mas não simula horas extras de fome ou danos: apenas o tempo real transcorrido é processado. Checkpoints impedem duplicação.

Girassol e cacau originais estavam cortados no próprio arquivo. Duas novas artes originais, com auxílio de geração de imagens, têm margem transparente e plantas completas. Girassol usa quadros maiores em quatro estágios. Cacau é decoração adulta no sistema atual; não foi criada uma cultura paralela.

## Áudio e convites

Trilha original de 96 compassos com novos harmônicos, envelopes, filtros, vibrato suave, dinâmica e pequenas variações de tempo/frases. Um único motor musical; arranjos seguem o horário do ambiente atual. Botão visível liga/desliga; volume musical e volume de efeitos separados e persistidos no aparelho. Efeitos procedurais próprios de terra, sementes, água, colheita e esforço discreto só confirmam sucesso após resposta válida. Proteção contra sobreposição por repetição.

Página `/convite/CODIGO`: nome público do jogador, arte temática própria, título/descrição/OG image no HTML e entrada que preserva `ref` durante cadastro/login. Compartilhamento nativo quando disponível e cópia do link. Após entrar, pode enviar/aceitar amizade ou visitar amizade já aceita; bloqueios e consentimento existentes continuam necessários. Links contêm somente o código público.

## Animais

Dar peixe ao gato: escolha da espécie no estoque, uma unidade por interação pela interface, aproximação, peixe visível, reação/purr e consumo no momento de confirmação. Servidor aceita quantidades inteiras 1–5 e valida estoque/propriedade/satisfação; recibos e bloqueio impedem duplicação. Disponível nos três ambientes.

Necessidades novas: comida aproximadamente 45 min, água 30 min, limpeza 70 min, felicidade 40 min; energia do passeio cerca de 60 min, recuperando no descanso. Abaixo de 15% o animal faz pausa visível; retoma ao recuperar 65%. Pintinhos gastam 20% mais, vacas 10% mais e gatos 15% menos. São ritmos ativos, com no máximo 2 minutos de ausência contabilizados por retorno. Indicadores de alimentação, água, limpeza, energia, felicidade e saúde. Negligência extrema acumulada por 60 min ativos pode causar doença; comida, água, palha e remédio recuperam. Animais antigos saudáveis iniciam com reserva de adaptação; doença previamente existente e produtos pendentes são preservados. Comedouros/bebedouros continuam funcionais.

Passeio individual/coletivo de todos os animais, incluindo gatos e cães, usa os mesmos IDs e mantém instalação salva. Acompanha por rotas, com oito quadros articulados, velocidade por espécie, distribuição e desvio de outros animais. Retorno restaura o curral; espécies incompatíveis aguardam fora dos interiores. Ao terminar o passeio, gatos/cães retomam suas configurações anteriores. Carinho, água, alimentação e brincadeira permanecem disponíveis.

Interação com pet exige proximidade de 38px e evita animal atrás do jogador. Portas próximas à frente têm prioridade; marcador discreto mostra o pet alvo. Acompanhantes evitam áreas de entrada. Clique/toque permite escolher diretamente.

Compra do cachorro: motivos de indisponibilidade (nível, saldo, lotação) são exibidos, sem clique silencioso. O servidor mantém preço, entrega e débito na mesma transação com recibo idempotente. Nenhuma correção retroativa de saldos sem comprovação de inconsistência.

Visitas ao celeiro, galinheiro e pasto usam animais reais da instalação, nomes e pelagens salvos. Cuidados requerem amizade, proximidade e autorização explícita do dono. Recursos, incluindo peixes para gatos, saem do visitante, informado antes do clique. Transação serializada impede consumo concorrente duplicado. Produtos e controles de propriedade são exclusivos do dono. A antiga ação de levar animais foi desativada, conforme o novo requisito; nenhum animal é removido retroativamente.

## Validação

223 testes automatizados e build aprovados. Navegador 1280px e toque emulado 390px: seis climas, plantas completas, áudio independente, peixe consumido uma vez, compra do cachorro (sucesso/repetição/nível/saldo), portas com acompanhantes, passeio/retorno, alimentação de gato nos interiores e cuidados no celeiro visitado. Grupo de 12 testado com noite/tempestade, persistência após recarregar e compartilhamento/cópia de convite; p95 de intervalos RAF próximo de 8,5ms no ambiente de teste (não é garantia de FPS em hardware real).

Aparelho móvel físico, audição em alto-falantes reais e prévias/cache de cada aplicativo de mensagem não foram verificados; não se afirma equivalência com esses ambientes.

Em sandbox autenticado: compra de cachorro com recibo repetido e lotação, consumo único de peixe, alimentação concorrente por dois visitantes (uma ração), autorização do dono, proibição de renomear/levar animal e persistência após login. Cadastro por e-mail iniciado pelo convite conservou a indicação e permitiu enviar amizade. Consulta agregada somente de leitura em produção: três recibos bem-sucedidos de cachorro, três contas com cachorro salvo; nenhuma reparação financeira foi necessária.

Candidata c09daa1 publicada e verificada no projeto isolado fazendinha-wj-mp-test (dpl_5cZTbninLvrJfrWWxe9Wz9VrtSmE). Testes autenticados adicionais: chuva persistida e checkpoints sem repetição, proteção gratuita, peixe de visitante sem tocar estoque do dono e recibo repetido, bloqueio após revogar permissão, 12 passeios salvos após login e retorno, sono de oito horas com horário/data do servidor e processamento apenas do tempo real. Entrada no celeiro pela interface móvel publicada foi confirmada. A aprovação/publicação de produção segue pelo PR #12 para manter main alinhada.

Reprodução local: npm test, npm run build e scripts/qa-living-{valley,interiors,group,rest}.mjs com Vite ativo. PLAYWRIGHT_MODULE, CHROME_PATH e QA_BASE permitem usar uma instalação externa de Playwright sem adicionar dependências ao jogo. Os roteamentos e fixtures dos scripts atuam somente no navegador de QA; nenhum dado real é usado.
