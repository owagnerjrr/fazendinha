# 0.28.1 — ferramentas diretamente na visita

O canteiro do amigo não abre mais um painel de escolha. Clique/toque nele para a personagem se aproximar e usar a ferramenta selecionada; E e o botão de ação móvel também atuam no canteiro próximo.

- Enxada prepara a terra, sementes plantam com uma semente do visitante, regador cuida da água.
- Mão retira pragas quando existirem; nas colheitas maduras pega um produto conforme as regras de roubo já existentes (ativação dos dois amigos, proteção e limites mantidos).
- Mesmos sprites de ferramentas e animações da própria fazenda; jato de água, terra e efeito de colheita no cenário.
- Ação capturada ao iniciar, bloqueio até confirmação e atualização, commit único pelo ActionClock. Não é possível sair da visita no meio de um pedido pendente.
- Sem alterações no servidor, em preços, permissões ou dados salvos. Sem migração.

Validação: 209 testes passaram e build TypeScript/Vite/PWA aprovado. `scripts/qa-visit-direct.mjs` exercitou a cena real de visita com clique em 1280px e toque em 390px: cinco ações diretas, animação de água, nenhum modal e exatamente um comando por ação. Fixture local sem contas reais; simula a resposta do servidor. Testes unitários cobrem ferramenta, estoque de sementes, proteção, permissões e prioridade de pragas. As regras remotas de ajuda/roubo permanecem as mesmas.
