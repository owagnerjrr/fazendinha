# Animação animal e companhia na cama — 0.53.0

## Mudanças
- Motor contínuo de deslocamento com aceleração, chegada com tolerância, direção com histerese e passos calculados pela distância percorrida. Sem redução das velocidades das espécies.
- Rotas simplificadas por visibilidade e mesma folga na busca e na colisão. Removido o desvio lateral imposto a cada quadro e o recálculo de destinos estacionários.
- Motor compartilhado com animais do painel. Quadros nativos mantêm dimensões e apoio; andar/repouso não reinicia a cada atualização.
- Cama para até dois gatos/cachorros próprios, escolhidos pelo nome, ou nenhum. Horário de despertar mantido.
- Chegada pela porta ou pela posição atual, caminhada até a lateral, preparação, salto escalonado, acomodação distinta de gato/cachorro e poses de sono com respiração. Sem ocultar a sequência com tela preta.
- Despertar, levantar, salto de descida e retorno ao modo anterior. Relógio avança depois da acomodação; energia aplicada uma única vez. Estado/timestamps permitem reconstruir a sequência após reabrir.
- Autorização de propriedade, limite e horários validados no servidor. Protocolo 22 impede clientes antigos de sobrescrever o novo estado. Remodelagem bloqueada durante o sono.

## Evidências locais
- 395 testes automatizados, incluindo chegada estável a 30/60/120 FPS, colisão sem correção lateral, percurso com obstáculo, propriedade, repetição de comandos, recuperação e avanço único do relógio/energia.
- Comparação gravada no mesmo percurso de aproximadamente 11 segundos com cinco acompanhantes: o primeiro gato passou de 85 para 8 mudanças de orientação e de 34 para zero pequenos passos reversos. Os cinco tiveram zero passos reversos no ensaio posterior. Isso não constitui garantia para todo mapa/dispositivo.
- Navegador Edge desktop e emulação de toque 390×844: gato, cachorro, ambos e sem companhia; animais inicialmente na fazenda/celeiro; chegada, subida, sono, despertar, descida e preservação de nomes/modos. Recarregamento durante a acomodação retomou os dois animais sem duplicação.
- Vídeos reais do runtime local com dados isolados, sem manipular contas de produção. Stills de revisão de fases também usam relógio controlado e não substituem os vídeos em tempo real.

## Limites
- Cama aceita espécies nativas gato/cachorro; criações administrativas continuam com suas interações e navegação, sem pose de cama arbitrária.
- A evolução das plantações e necessidades continua em tempo real, conforme a regra já apresentada no seletor. Dormir avança o calendário visual, sem inventar produção ou danos por horas fictícias.
- A chegada de um animal de outro ambiente começa na porta da casa; o cenário ausente não é simulado fisicamente.
- Emulação móvel não substitui ensaio em aparelhos físicos Android/iPhone. Lotação máxima e sessões de várias horas não foram validadas nesta rodada.
- Nenhuma migração de banco, cobrança, concessão ou alteração em saldos/animais reais.

Validação online e publicação: registrar o resultado após conferir o deployment.
