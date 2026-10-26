# Vida no Vale — beta 0.5

## Conta Google/Gmail

A tela Conta oferece “Continuar com Google / Gmail”; uma conta já aberta oferece “Vincular minha conta Google”. Usamos o SDK gerenciado do Neon, com callback e troca de sessão próprios do provedor. A autorização pede identidade para acesso ao jogo; não há integração com a caixa de e-mail. A beta usa o Google compartilhado do Neon, por isso seu nome aparece na autorização. Para lançamento com a identidade WJ, configurar um Client ID/Secret Google próprios no Neon. Nenhuma credencial Google foi incluída no repositório. A autorização final depende do próprio jogador; não acessar a conta pessoal dele durante QA.

## Avatar inclusivo

Cinco estilos, seis tons de pele, cinco cores de cabelo e seis cores de roupa. Os estilos crespo curto e afro com dois coques permitem representar personagens negros masculinos e femininos; o jogador combina as opções livremente. A aparência é aplicada às caminhadas, às ferramentas equipadas, às animações de trabalho, aos interiores e ao retrato do HUD. Não altera atributos nem preços. O editor tem prévia antes de salvar; a conta guarda a seleção no servidor.

As cabeças são sprites originais gerados, com quatro direções. O corpo e as mãos recebem paletas em canvas; os equipamentos continuam integrados às poses existentes. Esse processo não modifica o corpo de colisão.

## Cultivo e cuidados

As três culturas anteriores continuam funcionando. Acrescentadas: morango (120s, semente 15, venda 23 por unidade), milho (180s, 20/32), tulipa (100s, 14/22) e girassol (200s, 24/40). Rendimento inicial de 3 por plantio. Preços e tempos são de teste.

Alguns canteiros recebem pragas durante o crescimento, de forma determinística a partir do plantio. A mão primeiro remove as pragas, sem colher ou conceder produtos; uma segunda ação pode colher quando a plantação estiver madura. A limpeza é sinalizada no mapa e também pode ser feita como ajuda a um amigo. A produção continua por horário do servidor com o jogo fechado.

## Animais

Uma galinha inicial é adicionada sem alterar o saldo existente. A venda oferece galinhas, vacas, cabras/bodes e cachorro. Limite de 12 animais, com baias representadas no interior do celeiro. Cinco rações custam 10 moedas; cada porção alimenta um animal por 24 horas. Sem alimento, não é possível coletar produção. Não há perda permanente ou morte por ausência.

| Animal | Preço | Função quando alimentado |
|---|---:|---|
| Galinha | 90 | Um ovo a cada 90s; venda 12 |
| Vaca | 350 | Um leite a cada 180s; venda 35 |
| Cabra / bode | 230 | Um leite de cabra a cada 150s; venda 26 |
| Cachorro | 180 | Protege contra roubo por 24h |

Cada coleta recebe um único produto, sem acúmulo infinito offline. Ovos e leites entram no inventário e são vendidos junto da colheita. A feira, nesta versão, negocia culturas; não negocia animais ou produtos animais.

## Amizade e roubo

Visitas assíncronas em painel permitem plantar com uma semente do visitante, regar ou remover pragas. Uma ajuda por amigo por dia UTC concede 5 XP. A plantação pertence ao dono da fazenda, e a semente é descontada do visitante.

A brincadeira de roubo começa desativada. Os dois amigos precisam ativá-la em Minha fazenda. Só é possível pegar 1 unidade de uma cultura madura, saudável e ainda não beliscada, uma vez por amigo por dia UTC. O dono mantém pelo menos 2 unidades e recebe uma hora de proteção global. Cachorro alimentado bloqueia o roubo. Um histórico limitado a 20 visitas registra ajuda e roubo. Contagens, proteção e transferência são transacionais no servidor; não há roubo de moedas, rações, animais ou equipamentos.

## Casa, celeiro e decoração

Entradas pela porta no mapa ou por Minha fazenda. Interiores caminháveis usam teclado, clique, joystick e botão Usar. Casa com cama, TV, sofá, janelas e guarda-roupa; o guarda-roupa abre o editor. A cama explica a recuperação natural da energia; não concede energia instantânea. A TV é um boletim ilustrativo do vale. Celeiro com corredor, baias dos animais comprados e suporte para selecionar as ferramentas. Existe botão de saída e tecla Esc quando um painel não está aberto.

A venda contém abas Sementes, Animais e ração e Decoração. Compras consecutivas mantêm a janela aberta. Peças originais: árvore do Cacau Encantado, jardineira florida e canteiro de girassóis. O jogador escolhe entre oito espaços do jardim. Nenhuma parceria comercial ou uso de marcas é declarado. Decorações são cosméticas e não bloqueiam a navegação.

## Compatibilidade e limites

A migração aditiva preserva moedas, plantas, missão, inventário e posição das contas anteriores. Novas culturas começam com zero sementes em saves antigos; os novos jogadores começam com oito de cada no teste. A versão do documento local continua 1 para manter compatibilidade. A revisão online continua sendo incrementada a cada comando.

O interior atual não é salvo como posição online: ao reabrir, o jogador volta à última posição externa confirmada. Visitar o mapa do amigo em tempo real, co-op e produção animal negociável na feira continuam pendentes. Testes em celulares físicos e credenciais Google próprias para lançamento público continuam necessários.
