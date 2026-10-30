## Publicação confirmada — 30/10/2026

A versão 0.25.0 foi publicada em https://fazendinha-wj.vercel.app. PR #2 integrado à main no commit a76b4ea163f93c86b57c85c0aa392215fcc48a38, com a mesma árvore validada em 7a1a088. Deploy funcional de produção dpl_9XnY3dMdxxsvKnQBGFzqGH3M539W: READY. Acabamento complementar: versão 0.25.0 visível no menu e indicador de avisos posicionado abaixo dos recursos, sem cobrir o botão de menu.

- Migrações 010/011 aplicadas primeiro ao branch isolado dev-store-wardrobe-024 e depois à produção. Comparação transacional confirmou preservação integral das fazendas, pedidos, pagamentos e função legacy: 38 fazendas/16 pedidos no isolado antes dos novos fixtures e 34 fazendas/2 pedidos em produção.
- Sandbox publicado no deploy dpl_FG4MPa7yuKfD6674G7s5kNC1ucLq. Três identidades QA novas verificaram convite/aceite, avisos, presença de visitante, terceiro impedido, ajuda próxima, compra de gatos, transferência limitada, reforma, mensagens sem duplicação, histórico, bloqueio e persistência após novo login. Moedas de fixture foram concedidas somente a essas novas identidades no banco de testes.
- Mercado Pago aceitou criação de pedido sandbox f5 via cartão por R$10: deaa6f28-c58a-4109-acaa-deb5cfd7c147. Reenvio manteve o mesmo pedido, pendente, vinculado à API e com zero fertilizantes entregues. Nenhuma aprovação foi fabricada no endpoint e nenhuma cobrança/reversão real foi criada.
- Navegador real no sandbox: duas sessões QA autenticadas, visita iniciada pela interface, navegador do dono recebendo e renderizando o visitante; zero erros de JavaScript. Sem acesso a contas pessoais.
- Função real de entrega no Postgres remoto isolado validada com fixture dentro de savepoint: pendência, aprovação de fixture, replay, evento antigo e reembolso após consumo. Retirada única, dívida de unidades e moedas/bens preservados. O fixture foi inteiramente desfeito por rollback.
- CRON_SECRET foi cadastrado como segredo em Production do projeto principal e incorporado ao novo deploy. Nenhuma credencial existente foi substituída ou exibida. A rotina diária continua em 06h UTC / 03h de São Paulo; sua próxima execução automática não foi observada nesta janela. Não houve execução manual autenticada em produção.
- Produção: página HTTP 200; novos JS/CSS e gato preto disponíveis; autenticação configurada; saúde Orders ready=true e salesEnabled=true; APIs privadas recusam consultas sem sessão com 401. Consulta de logs do novo deploy sem error/fatal na janela verificada.
- 189 testes e build aprovados. O pacote novo ainda não teve aprovação/reembolso concluídos no provedor; aprovação do ledger foi testada com fixture. Pix não está disponível na conta sandbox; o Pix real de moedas tinha sido validado anteriormente. Cartão e reembolso reais não foram testados.

Os registros de implementação local abaixo são históricos. A publicação foi autorizada posteriormente pelo proprietário, sem testes destrutivos no banco de produção.

---

# Vale renovado — 0.25.0

Implementação local em 30/10/2026, construída sobre `2f01a02` (Orders de produção) e o registro documental `7640ac0`. **Ainda não publicada e sem migrações aplicadas aos bancos remotos.** Não confundir as prévias com produção.

## Visual e jogo

- Interface com papel claro, verde, cartões, abas, foco visível e adaptação ao celular. Ícone da mão redesenhado em SVG original.
- Cenário com flores, vasos, acabamento da horta, pedras e vegetação na margem, reflexos do rio e borboletas. Detalhes estáticos são desenhados uma vez; animação ambiente limitada e respeitando movimento reduzido/modo leve.
- Andar dos animais com menor deformação das pernas, passos diagonais e percurso mais lento, com pausas reais. Gatos têm oito quadros originais e pelagens preta, branca, laranja, cinza e tricolor; custam 160 moedas do jogo e usam os cuidados e a capacidade existentes.
- Os 24 canteiros principais ficam livres sem cobrança e sem requisito de nível. Sementes possuídas podem ser plantadas nesses espaços independentemente do nível; compra de novas espécies e terrenos extras mantém as respectivas regras. Nenhuma plantação é reiniciada.
- Colheita passa de 10 para 20 XP; o divisor dos limiares de nível passa de 40 para 20. XP existente não é reduzido. Expansões antigas não são cobradas novamente.

## Amigos, visitas e notificações

- A seção é **Amigos**, sem o formulário, listagem ou compra da feira. As ofertas antigas continuam preservadas. Na mochila, **Recuperar produtos reservados da antiga feira** devolve os próprios lotes e cancela as reservas em uma transação idempotente. Novos anúncios são recusados; a venda normal no Vartin continua disponível.
- Eventos persistentes de convite, aceite, encerramento de pedido/amizade, mensagens, ajuda e roubo. Avisos aparecem com o jogo aberto, são consultados a cada quatro segundos e ficam no histórico **Avisos**. Não é push do sistema operacional com o jogo fechado. Eventos novos recebidos enquanto desconectado aparecem ao retornar; eventos anteriores à migração não são inventados.
- Presença compartilhada por heartbeats de 1,5 segundo, com interpolação visual e expiração após 12 segundos sem contato. Mostra nome, avatar e roupa. Não usa WebSocket. Há validação de amizade, bloqueio, limites do mapa e deslocamento; posições de presença não substituem o save da própria fazenda.
- Ajuda e roubo de colheita exigem presença recente próxima do canteiro. Mantidas uma ajuda e uma ação de roubo por amigo/dia, proteção do cachorro e preservação de pelo menos dois produtos da colheita.
- Roubo de animais tem **opção separada, inicialmente desativada**: ambos precisam permitir a brincadeira e também o roubo de animais. A opção antiga de colheitas não expõe automaticamente os animais existentes. Exige aproximação da instalação, capacidade no destino e amizade aceita. Último animal, cães e mães em incubação ficam protegidos. Animal transferido conserva identidade e cuidados; a fazenda ganha 24 horas de proteção. Usa o mesmo limite diário do roubo de produtos.

## Casa

- Editor da planta com movimentação dos móveis originais, três estilos compráveis e o estilo original gratuito. Compra do estilo é permanente; reaplicá-lo não cobra outra vez.
- Seis itens em moedas: árvore ornamental 90, estante 180, tapete 75, quadro 60, banquinho 45, flores 50. Compras ficam guardadas até posicionar; limite de 30 peças adicionais.
- Piso e paredes mudam com o estilo. Móveis, colisões e pontos de interação acompanham a posição salva. O servidor confere limites e passagem da porta até os móveis. Reforma aparece ao entrar novamente na casa; não há remoção de peças compradas.

## Fertilizantes e pagamentos

- Pacote `f5`: **cinco fertilizantes por R$10**, com Pix ou cartão no checkout hospedado Orders existente. Os cinco pacotes de moedas conservam seus preços e quantidades.
- Uma unidade reduz pela metade o tempo restante de uma plantação regada; uma aplicação por plantio. Aplicação é validada perto do canteiro na própria fazenda e não concede moedas.
- Preço definido no servidor, validação do recurso oficial, HMAC e idempotência existentes preservados. Entrega e reversão usam `credited_fertilizers` e `fertilizer_movements`; a função anterior de moedas é preservada e chamada para pedidos de moedas.
- Pendente não entrega. Aprovação entrega uma vez. Reembolso/contestação remove o direito proporcional. Se unidades já foram gastas, fica `fertilizerDebt`, abatida nas próximas entregas; não se tira moeda, animal, roupa ou plantação para compensar.
- Histórico distingue moedas de fertilizantes. Retorno do checkout não é prova de pagamento.
- **Nenhuma cobrança ou reembolso real foi criado. O pacote novo não foi homologado no provedor.** Interface foi testada com pedidos fictícios; persistência com PostgreSQL local. A conta sandbox conhecida não oferece Pix. A homologação anterior das moedas não equivale à homologação do novo produto.

## Verificação realizada

- `npm test`: **189 testes, zero falhas e zero ignorados**.
- TypeScript e build Vite/PWA aprovados. Permanecem os avisos conhecidos de tamanho do bundle e anotações de dependências.
- `scripts/qa-upgrade-database.mjs`: migrações 010/011 sobre schema anterior com dados sintéticos; comparação integral das fazendas antes/depois; pendência, aprovação, replay, evento antigo, reembolso integral após consumo, dívida e manutenção das moedas; notificações de amizade/mensagem sem duplicar mensagem repetida. PostgreSQL local via PGlite, sem conexão remota.
- `scripts/qa-social-live.ts`: funções reais do servidor com PostgreSQL local; convite/aceite; presença de duas identidades; terceiros e teleporte negados; ajuda com consumo de semente; opção de roubo separada; transferência única, limite diário, último animal protegido; retorno idempotente de reservas; isolamento/consulta dos avisos; bloqueio revogando presença.
- `scripts/qa-valley-browser.mjs`: navegador Edge headless em 1280×900 e 390×844; casa, gatos, editor, fertilizantes/Pix/cartão, pedido fictício, amigos sem feira e avatar remoto simulado. Sem erros de JavaScript. Abertura da página principal também conferida sem erros.
- Não houve teste em telefone físico, conta pessoal, duas sessões reais na Vercel, entrega real de push, pagamento real do pacote ou conexão concorrente de banco para o novo ledger. Os ensaios de renderização simulam a rede; os testes de servidor verificam separadamente as regras e o SQL.

## Publicação e continuidade

1. Conferir remoto/PR #2 e regras de branch antes de integrar. A base publicada continua sendo Orders; não publicar a `main` antiga por cima dela.
2. Repetir os testes no ambiente isolado: instalar PGlite/Playwright em pasta de ferramentas de QA, apontar `PGLITE_MODULE`/`PLAYWRIGHT_MODULE` para os módulos e executar os três scripts. O script de navegador aceita `CHROME_PATH`, `QA_BASE` e `QA_OUTPUT_DIR`. Rodar Vite para a prévia visual.
3. Aplicar `010_social_live.sql` e `011_fertilizer_store.sql` primeiro em banco isolado e depois, na publicação autorizada, em produção. Não executar novamente migrações antigas sobre produção. O código novo depende das tabelas/coluna/função adicionadas. As migrações não reescrevem saves nem pedidos antigos.
4. Publicar o commit revisado; conferir autenticação, duas sessões, bloqueio, notificações e entrega do produto em sandbox, com credenciais isoladas. Não trocar credenciais de produção por teste.
5. A pendência anterior de `CRON_SECRET` no projeto principal permanece: esta atualização não cadastra segredos nem corrige automaticamente o agendamento. Com a migração 011, a reconciliação existente também encaminha Orders de fertilizantes ao ledger apropriado.
6. Cliente de protocolo 10; clientes antigos com fazenda contendo gatos, reforma ou estoque/ajuste de fertilizantes recebem pedido de atualização, preservando seus dados.

Nenhuma conta, saldo, roupa, animal, plantação, progresso, credencial, deploy ou banco remoto foi alterado nesta implementação local.
