# Animais e ciclo de vida — 0.54.0

Implementação aditiva no JSON de cada fazenda; não exige migração SQL nem substituição de progresso. Identidades, nomes, vínculos, saldos, compras e instalações anteriores permanecem salvos. Animais antigos recebem metadados de adulto sem reiniciar cuidados ou produção pendente. Registros de falecidos ficam nas Memórias, sem ocupar vaga de criação.

## Compra e crescimento

Novas espécies na venda, com escolha de baia, sexo e fase:

| Animal | Adulto | Filhote | Crescimento real |
|---|---:|---:|---:|
| Porco | 220 | 132 | 4 h |
| Cavalo | 650 | 390 | 8 h |
| Touro | 420 | 252 | 6 h |
| Burro | 380 | 228 | 8 h |
| Cão caramelo | 180 | 108 | 2 h |
| Border collie | 260 | 156 | 2 h |
| Pastor-alemão | 280 | 168 | 2 h |
| Husky | 300 | 180 | 2 h |

Valores em moedas do jogo, sem alteração dos pacotes de dinheiro real. Vacas/cabras: 6 h; gatos: 2 h; galinhas/galos comprados filhotes: 30 min; pintinhos mantêm incubação/maturação de 5 min existentes. Criações do painel: 4 h. Três escalas visuais: filhote 55%, jovem 78%, adulto 100%. O crescimento usa horário do servidor e pode terminar durante a ausência; não altera o avanço offline das necessidades. Produtos exigem idade adulta.

## Nascimento e cuidados

A fêmea adulta e um macho saudável da mesma espécie/instalação permitem iniciar gestação (vaca + touro para bovinos). A mãe precisa de pelo menos 30% de comida, água e limpeza, sem doença. Uma vaga fica reservada na baia; lotação permanece 5 por baia/8 baias. Gestação de 1 h, ou 2 h para equinos. O nascimento é confirmado no painel individual quando a mãe estiver cuidada; não há perda automática de filhote durante ausência. A mãe descansa 24 h antes de nova gestação. Galinhas continuam usando ovos/incubação. Criações administrativas têm sexo registrável, casal da mesma definição, crescimento e nascimento próprios, com reserva dentro do limite de 40 criações.

Alimentação, água, limpeza, remédios, carinho, brincadeiras e passeios usam o sistema existente. Porco, cavalo, touro e burro não criam novos produtos de venda nesta versão. Desenhos e ciclos de patas são originais em canvas, com atlas por direção; as novas pelagens também são utilizadas no celeiro e durante o sono dos cães.

## Montaria

Cavalo próprio adulto, saudável (saúde ≥60%, necessidades/energia ≥20%) pode ser montado no painel. Personagem aparece sobre o cavalo e se desloca mais rápido (220 unidades/s; limite de validação servidor 250, contra 190 a pé). Montaria consome energia pelo sistema existente. Desmontar restaura acompanhamento/autonomia/passeio anteriores. Entrada em casa/celeiro/venda desmonta; ferramentas exigem desmontar. Cenários personalizados exigem desmontar explicitamente. ID do cavalo é preservado, sem instância adicional no inventário.

## Fezes, xixi e doença grave

Temporizadores contam atividade, sem gerar sujeira por horas offline. Intervalos aproximados: fezes 60–69 min (porcos 45–54), xixi 40–49 min (gatos 50–59). Máximo de quatro resíduos por animal, com limpeza gratuita pelo chão ou painel. Limpar não entrega moedas/produtos e não consome ração. A limpeza do animal com palha também remove seus resíduos.

Falecimento requer doença grave combinada com alimentação, água ou limpeza abaixo de 5%, por **6 horas de jogo ativo**. Há aviso de risco, redução de saúde e tratamento. Sessão nova/retorno de aba reinicia o intervalo de atividade; intervalo de requisições acima de 45 s não conta. Cada intervalo é limitado a 30 s e calculado no servidor. Remédio zera o contador crítico. Não há mortes offline. Não há envelhecimento que mate animais saudáveis.

## Validação

- 417 testes automatizados passaram (404 anteriores + 13 específicos): preços e raças, fases, preservação de legado/produção, nascimento e reserva de vaga, repetição de confirmação, montaria e restauração, doença/morte ativa, ausência curta/longa, sujeira/limpeza sem recompensas, criações administrativas e separação de cinco animais grandes por baia.
- TypeScript e build de produção verificados.
- Execução local real em Edge/Phaser em 1280×844 e emulação móvel 390×844: espécies disponíveis, caminhada, montaria/desmontagem e limpeza. Capturas e vídeos na pasta de outputs da sessão.
- Ainda em conferência: autenticação, compra e persistência no sandbox; versão publicada. Sem uso de pagamentos reais.
- Emulação não substitui ensaio no Samsung A34 físico. Não se promete FPS fixo por aparelho. Reconciliação de resíduos limitada a cinco vezes/s para evitar alocação de listas a cada quadro.
