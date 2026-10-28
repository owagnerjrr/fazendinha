# Interiores e cuidados — 0.8.0

## Alterações no jogo

A referência de Zelda foi usada somente para proporção e organização. Nenhum recurso do jogo de referência foi copiado. Os móveis são texturas originais de 30–94 pixels, criadas uma vez e reutilizadas, em vez dos grandes sprites anteriores. A cama mede 56 × 84 unidades frente ao avatar de 48 × 64. Casa com piso de tábuas, paredes, janelas, tapete, cama, TV, guarda-roupa, sofá, mesa e cadeira. Colisores correspondem à base dos móveis e a profundidade permite passar atrás deles. TV continua sendo o boletim estático já existente; cama não concede energia imediata.

Celeiro mantém escala e produção dos animais. Palha foi redistribuída em pequenos grupos, materiais existentes foram reutilizados e depósitos variam na quantidade de feno e sacos. Cães têm cama própria. As placas das baias aparecem por proximidade. Não há alteração de saldo, inventário, produção ou autenticação por motivo visual.

O painel de animais oferece carinho para as seis espécies existentes e brincadeira para cachorro. A escolha conduz o personagem pelo corredor ao portão de manejo; a portinhola abre, o animal se aproxima, a personagem faz o gesto e o animal reage. O jogador permanece no corredor; não foi implementada circulação livre dentro das baias. Após confirmação do comando local/online, o carinho registra bem-estar por 24 horas. Brincadeira atualiza o mesmo cuidado e registra `playedAt`. Ambas compartilham um intervalo de um minuto, sem moedas, XP ou produtos. Gatos ainda não integram o catálogo; não há botão fictício de brincadeira para espécies não implementadas.

Respiração usa quatro quadros com um pixel de deslocamento do tronco e preserva integralmente os pixels dos pés. As variantes são geradas a partir do avatar personalizado nas quatro direções, inclusive ferramentas carregadas. Caminhada, uso de ferramentas e gesto de carinho interrompem a respiração. A preferência de movimento reduzido desativa a respiração e a oscilação da brincadeira.

Ações comuns de enxada, plantio, rega e colheita mantêm animações/efeitos e não apresentam notificações de sucesso. Erros, confirmações de compras, falhas de salvamento e eventos de crescimento continuam disponíveis. Os avisos de entrada dos interiores foram removidos.

## Continuidade

A versão 0.7 publicada foi conferida e integrada ao ramo que continha galo, pintinho e terreno adicional. As regras econômicas e dados dessas funcionalidades foram preservados. Não há migração SQL nem recriação de contas. Saves locais mantêm os 24 canteiros originais na chave antiga e a área adicional em chave própria. Um cliente online antigo é recusado quando a fazenda já possui novas espécies ou terreno, impedindo que sobrescreva dados que não compreende.

## Validação

73 testes automatizados, incluindo acesso aos móveis e saída por rotas, preservação de pés na respiração, respeito a movimento reduzido, intervalo compartilhado de cuidados, produção/proteção inalteradas, persistência de carinho/brincadeira e regressões de economia, perfis, aves e terreno. Build TypeScript/Vite aprovado; permanece o aviso de tamanho do pacote Phaser.

A página de QA usa o mesmo `InteriorScene`, `AvatarArt` e regras do produto com animais fictícios. Não acessa contas nem os saves do jogo. Sua configuração de build é exclusiva do ramo QA e não deve ser incorporada à produção. Conferência visual e de navegação em andamento; resultados finais em VALIDACAO.md.
