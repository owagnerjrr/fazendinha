# Filhotes, jovens e adultos — 0.55.0

Para **porcos, cavalos, touros, burros, cães (todas as raças) e gatos (todas as pelagens)**, novas compras entregam apenas filhotes. A venda não oferece adulto dessas seis espécies; o servidor recusa tentativa explícita de comprar adulto. O preço usa o valor de filhote já existente (60% do preço-base da espécie/raça); nenhuma compra antiga ou pacote de dinheiro real foi alterado.

## Tempo real e preservação

- Nascimento/compra até antes de 7 dias reais: Filhote.
- Ao completar exatamente 7 dias reais: Jovem.
- Ao completar exatamente 14 dias reais: Adulto.
- Novos nascimentos dessas espécies seguem a mesma regra. Crescimento continua durante a ausência, mas dormir/avançar o calendário visual não acelera a idade real.
- Cada novo registro guarda `growthVersion: 2`, `bornAt`, `youngAt` e `adultAt`, definidos pelo horário do servidor. Metadados não são aceitos do pedido do comprador.
- Animais existentes não são reiniciados ou envelhecidos retroativamente. Adultos continuam adultos; filhotes/jovens anteriores mantêm os prazos absolutos já salvos. Só a aparência correspondente à sua fase é atualizada.
- Cuidados, nomes, pelagens, raças, vínculos, propriedade e vagas permanecem nos mesmos registros. Cavalo só pode ser montado adulto; guardas de reprodução/produção/saúde continuam funcionando. Sem mortes offline.
- Vaca, cabra, aves e espécies do editor administrativo mantêm os sistemas e prazos anteriores; esta mudança cobre as seis espécies listadas acima.

## Arte integrada

Fontes originais em `art-source/v56`; dois atlas transparentes de 320×480 em `public/assets/v56`, com seis espécies e quatro direções por idade. Filhote e jovem têm desenhos distintos: cabeça, proporções, pernas, pelagem, crina e chifres em desenvolvimento. Adultos usam a arte existente.

Raças caninas e cinco pelagens felinas são preservadas por paletas, sem mudar os valores salvos. Há 26 retratos de fases/variantes, usados na venda e nos cuidados. Os mesmos sprites aparecem na fazenda, celeiro, sul e visitas pelos renderizadores compartilhados. A sequência de cama usa a aparência e escala da idade também na aproximação e nas poses de sono.

Atlas carregados uma vez e ciclos de patas gerados por demanda, em cache compartilhado por idade/espécie/pelagem/direção. Nenhum processamento de pixels por quadro durante a caminhada. Protocolo 24 impede versões anteriores de comprar com a interface antiga.

## Verificação

- 423 testes e build passaram. Incluem os limites de 7 e 14 dias, recusa de adulto sem débito, preservação de idades existentes, salvamento/reabertura e impossibilidade de acelerar a idade pelo sono/calendário.
- Execução local real desktop (1280×844) e emulação móvel (390×844): três fases de cada espécie, chaves de arte corretas, caminhada, venda somente de filhotes, montaria adulta, descida e limpeza.
- Gato e cachorro filhotes juntos na cama, salto/sono/despertar/retorno e reabertura durante a cena verificados em emulação móvel, com nomes, IDs e configurações preservados.
- Os testes de fases usam horários controlados em fixtures isoladas; não se aguardaram 14 dias reais durante a auditoria. Ensaio em aparelho físico continua pendente.
