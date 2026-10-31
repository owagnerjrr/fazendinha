# Correções 0.29.1

- Pontos de chegada e marcadores aproximados dos degraus/portas da casa (408,466), venda (1030,406) e celeiro (1050,814), mantendo uma margem navegável fora das colisões. Acesso ao celeiro nas visitas usa o mesmo ponto. Venda usa a definição compartilhada também na validação de proximidade.
- Inventário volta a mostrar arte de alimentos e flores, sementes com indicação própria e ícones dos produtos/peixes, sem alterar estoques.
- Relógio com linhas explícitas para hora/período, clima e data, altura suficiente e ajuste para celulares estreitos.
- Lockfile recomposto a partir da versão anterior ao bump 0.29, preservando versões reais das dependências: o bump anterior havia substituído também metadados de versões numéricas coincidentes. A versão do jogo agora muda apenas nos dois campos raiz.

Verificado no navegador em 1280, 390 e 320px: personagem percorreu a rota e abriu casa/celeiro/venda; imagens do inventário carregadas; limites de todas as linhas do relógio dentro da caixa. Script reproduzível: scripts/qa-entrances-0291.mjs com as mesmas variáveis dos scripts de QA do Vale vivo. 223 testes e build aprovados. Sem alteração de banco, contas, moedas ou compras.
