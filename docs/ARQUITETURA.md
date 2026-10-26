# Arquitetura e decisões

## Implementação atual

Cliente TypeScript com Phaser 3.90. Canvas/WebGL para o mundo e HTML/CSS para menus, foco, textos e interface responsiva. O Vite gera a distribuição estática. A renderização combina sprites originais pré-carregados de `public/assets/v2/` com terreno e efeitos gerados em canvas. A geração de imagens aconteceu na preparação; abrir o mapa não depende de um serviço de geração. As fontes e prompts de arte estão versionados.

As regras agrícolas são independentes da engine em `src/farm.ts`, permitindo testes sem navegador e futura adaptação à API. O cliente salva um documento versionado no localStorage. O tempo de crescimento começa na rega, com um timestamp absoluto. Ao abrir, o estágio é recalculado. Não existe processo em segundo plano.

Compras, colheitas e vendas acontecem sincronicamente no estado local. Isso impede repetições acidentais no protótipo, mas não protege contra alteração pelo usuário. O save não é uma credencial, é dado local de demonstração. Nenhum código de recuperação ou identificador da conta de referência foi incluído.

O movimento possui corpo de colisão nos pés e profundidade dependente da posição vertical. Clique em canteiro faz o personagem caminhar até ele antes de agir. O deslocamento por clique é direto; não há A* ainda. O jogador pode controlar o caminho por teclado/joystick.

## Próxima arquitetura online

- Autenticação própria com sessão segura; o método ainda precisa ser escolhido.
- API responsável por plantar, regar, colher, comprar, vender e salvar construções.
- Banco relacional com contas, fazendas, canteiros, inventário e eventos de economia.
- Timestamp e preços determinados pelo servidor, sem aceitar saldo ou recompensa enviados pelo cliente.
- Operações atômicas, controle de versão e chaves de idempotência contra repetição/reconexão.
- Salvamento do movimento separado de operações econômicas, com frequência limitada.
- Cálculo de progresso por intervalos, sem um timer permanente para cada planta.

Tabelas candidatas: `players`, `farms`, `plots`, `inventory`, `buildings`, `quests`, `market_listings`, `transactions`. Conteúdo das culturas e receitas deve ser versionado. A modelagem definitiva só deve ser aplicada quando o backend for escolhido.

Começar com visitas assíncronas. Presença e personagens simultâneos demandam sessões, validação de movimento e sincronização em tempo real; não são pré-requisito para ter amigos e feira.

## Direção visual

Arte de teste tem resolução e escala consistentes, mas ainda não representa o acabamento final. Evoluir para um kit autoral de tiles, sprites e animações. A qualidade será julgada em uma área vertical completa: personagem, solo, construções, vegetação, iluminação e feedback das ferramentas. Não prometer qualidade superior a um jogo comercial antes dessa prova.

## Publicação

Sem backend, pode ser hospedado como site estático. O repositório está preparado para Vercel/Vite. Não se deve adicionar segredos em arquivos públicos ou versionar `.env`. Não há servidor pago provisionado nesta entrega.
