# Celeiro, cuidados, rações e sono — 0.57.0

## Mudanças integradas

- Celeiro: câmera interna com alinhamento a pixels inteiros, zoom normal móvel 1× e placas das baias com contraste e camada próprios. O apresentador após a física agora aceita alinhamento por cena; fazenda/sul mantêm a câmera fracionária que melhorou a fluidez no A34. Piso continua em cache estático, sem reconstrução a cada quadro.
- Palha limpa passa a se chamar **Limpeza** na venda, bolsa, cuidados e mensagens. A chave salva `supplies.bedding`, quantidades e custos foram mantidos; nenhuma recompra necessária.
- Fezes/xixi: o desenho estava na profundidade 2, abaixo do piso interno em cache na profundidade 9. Agora fica em 9,5, acima do piso, sem passar à frente de animais/móveis. Arte um pouco maior e urina com mais contraste. Limpeza gratuita pelo chão/painel preservada; usar o produto de limpeza também recolhe a sujeira do animal. Os intervalos ativos existentes foram mantidos (urina 40–59 min conforme espécie/ID; fezes 45–69 min). Não gera sujeira offline.
- Entrada do celeiro: a geração de pedras/arbustos deixa livre o corredor frontal; demais objetos gerados preservam sua sequência e decorações adquiridas não foram apagadas.
- Coelho: aproximação de cuidado mais curta, orientação para o personagem, braço com cotovelo e cores do personagem; brincadeira com cenoura lançada em arco e reação animada com patas e pequenos saltos. Cronologia própria por interação, sem depender da fase global da animação.
- Roubo **de plantações** e cuidados de amigos são padrão, sem opt-out. Flags antigas são normalizadas ao carregar; comandos antigos não desabilitam a dinâmica e o painel não oferece os controles. Conservados amizade aceita, proximidade, limite deslizante de 5 roubos por visitante/fazenda/hora, validações da planta e entrega de apenas 1 produto ao esvaziar o canteiro. Animais continuam pertencendo ao dono; não habilita furto/venda/remoção de animais por visitantes. Dados privados e regras de acesso continuam protegidos.
- Nova aba **Rações**, com pacotes de 5 porções por 10 moedas, quantidade de pacotes, ícones e estoque. Tipos para cachorro, gato, vaca, touro, cabra, porco, cavalo, burro, galinha, galo, pintinho, coelho e outras espécies criadas. Alimentação usa primeiro o estoque compatível; porções universais anteriores continuam disponíveis como alternativa. Bolsa e painel mostram os estoques. Visitas debitam o alimento de quem ajuda, preservando o estoque do dono. Alimentos específicos configurados na Central e a oferta de peixe aos gatos permanecem com suas regras.
- Quadros adquiridos aparecem na parede, inclusive os que tinham coordenada antiga de chão. Registros antigos preservados; novas colocações gravam a altura da parede. Outros móveis/decorações não foram deslocados.
- Sono: correção das máscaras de olhos dos diferentes cabelos/aparências. Fecham ao deitar e abrem em uma pose de despertar compatível antes de levantar. A textura normal permanece intacta; capacete da Samus é preservado.

## Dados e compatibilidade

Nenhuma migração SQL ou substituição de estados. Raças, idades, moedas, compras, vínculos, nomes e estoques existentes preservados. Rações específicas são um novo mapa `feeds`; estoque universal `feed` não é convertido nem zerado. Protocolo do cliente 26 para exigir recarga das versões antigas e reconhecer os novos estoques; listas de compatibilidade das roupas pagas também aceitam 26. Não houve alteração de preços/pacotes reais, pedidos ou entrega de pagamentos.

## Validação local

442 testes automatizados e build. Testes atualizados para a regra global solicitada, mantendo verificações contra alteração de propriedade e acesso a animais privados. Novas regressões cobrem compra/consumo específicos, rejeição de espécies/quantidades inválidas sem débito, repetição de alimentação, preservação da ração universal, visitante pagando seu próprio alimento, restauração do estoque, quadro na parede, área livre na entrada e fechamento dos olhos.

Edge/Phaser em 390×844 e 1280×844: compra de vários pacotes, bolsa, alimentação nativa e do coelho, brincadeira renderizada, sujeira acima do piso e recolhimento sem gasto, quadro adquirido com coordenada antiga e sono/despertar com olhos fechados/abertos. Verificados indicadores da câmera e ausência de erros JavaScript. A interface de criações foi vinculada ao mesmo motor de regras local em fixture isolada para esse ensaio; não equivale, sozinha, à validação da API online. Sono com gato/cachorro, reabertura durante a sequência e restauração dos modos anteriores também passou.

Capturas na pasta outputs da sessão: BARN_POLISHED_WASTE, SPECIES_FEED_SHOP/BAG, RABBIT_PLAY_POLISHED, HOUSE_WALL_ART e PLAYER_EYES_CLOSED/OPEN, em ambas as resoluções. Sujeira/animais usados nessas imagens são fixtures de teste. Aparelho físico Samsung A34 não está disponível para ensaio.

## Conferência online em sandbox

Deploy dpl_G647N4f1qosiBLokeByDqKcDbN5d, código 59666fe. Conta QA separada: compras de ração para cães, gatos e coelhos; repetição do mesmo ID de compra sem novo débito/entrega; espécie inválida rejeitada sem cobrança; alimentação nativa usando estoque específico e repetição recusada sem consumo adicional. Estoque universal, identidade, nomes, roupas, terrenos e demais inventários preservados, além dos 30 coins de teste explicitamente gastos nos três pacotes. Cliente antigo 25 recebe atualização obrigatória; loja paga continua respondendo ao cliente 26 e prontidão do Mercado Pago permanece positiva. Nenhum pedido/pagamento/reembolso foi criado.

Navegador autenticado em 1280 e 390 px abriu/reabriu sem JavaScript/5xx, mantendo dados. Brincadeira do coelho acionada na interface real online, com API aprovada e estoque/moedas/identidade inalterados. O deslocamento de QA para afastar-se da venda foi feito pelos controles normais.
