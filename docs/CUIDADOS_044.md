# Correções de cuidados, clima, visitas e desempenho — 0.44

## Defensivo orgânico

Reproduzido: com umidade e estresse climático em 100%, aplicar uma dose deixava a planta saudável; colher um segundo depois executava settleClimate e restaurava a doença pelo estresse antigo. Agora o tratamento zera o estresse acumulado, preserva umidade/proteções/crescimento e só consome uma dose. O borrifador avalia os efeitos climáticos pendentes em uma cópia, usando as mesmas regras do servidor. Repetir em planta saudável não consome. Sem drenagem, nova chuva prolongada ainda pode causar doença; a mensagem recomenda Drenar, gratuitamente. Não removemos o clima nem concedemos imunidade permanente.

## Cuidados menos frequentes

Tempos reais de 100% a 0%, na base, em atividade: alimentação e água 180 minutos, limpeza 300, felicidade 240, energia em acompanhamento 180. Variações por espécie: pintinho 1,2×, vaca 1,1×, gato 0,85× para necessidades básicas. Comida/água podem ser repostas a 40%: cerca de 108 minutos desde cheias (antes: comida 54, água 45). Avisos de fome/sede a 30%: cerca de 126 minutos. Felicidade não exige cuidados a cada poucos minutos; passeio continua completando-a. Negligência abaixo de 5% precisa acumular 120 minutos para doença, em vez de 60.

Espécies criadas herdam os mesmos intervalos, incluindo publicações antigas careMinutes=90, mantidas como base relativa. Novos cadastros usam a mesma base; o painel explica a equivalência. Preservados valores atuais, nomes, vínculo, estados de saúde, itens, produção pendente e intervalos produtivos da versão 0.43. Não há reposição artificial nem conversão em fome/doença ao atualizar. Ausência continua limitada a dois minutos por retorno, conforme regra anterior. Configurações administrativas relativas continuam valendo. Consulta agregada somente leitura em produção confirmou escala 1 nos animais originais e criados; nenhum registro foi alterado diretamente.

## Brincadeira de roubo

Escolha confirmada pelo proprietário nesta conversa: participar permite o roubo entre amigos mesmo com cachorro. O servidor e a visita usam uma única regra de proteção. Ambos continuam precisando consentir, ter amizade aceita e presença próxima; só produto maduro e permitido, um por amigo/dia, com proteção global de uma hora após roubo. Não ampliamos permissão para roubar animais. A pausa mostra motivo e minutos restantes; não culpa o cachorro. Desativar a brincadeira continua impedindo o roubo. Configurações existentes permanecem salvas.

## Desempenho

Luzes suaves rasterizadas em uma textura compartilhada, em vez de repetir a triangulação de cinco elipses por lâmpada por quadro. Chuva respeita efeitos leves e movimento reduzido: no desktop, gotas por atualização caem de 70 para 22 no modo leve; no celular, 30 para 12. Respingos usam traços simples; modo leve atualiza a cada 66 ms em vez de 40. Intensidade climática e efeitos nas plantações não dependem da quantidade visual de gotas. Removida atualização duplicada do texto climático a cada quadro: o temporizador de 500 ms já atende todos os ambientes.

A* usa heap e memoriza colisões apenas durante cada busca; obstáculos dinâmicos continuam atualizados nas buscas seguintes. Comparativo local de 60 rotas com obstáculos: cerca de 295 ms antes e 37 ms depois, mesmo total de pontos; medição indicativa, não SLA. Navegador real com renderer, chuva e 20 animais, cena isolada: em aproximadamente 10 segundos, uma tarefa longa de 68 ms antes e nenhuma acima de 50 ms depois, sem erros JS. Cadência RAF p95 ficou 8,5 ms em ambos, portanto não alegamos aumento de FPS; o resultado varia por aparelho. O ensaio substitui somente a barreira de login no navegador da prévia local, não altera o código nem autenticação publicada.

## Validação

338 testes e build. Regressões para tratar/colher/reabrir sem dose duplicada, clima novo ainda prejudicial se ignorado, borrifador sem mutação na prévia, necessidades nativas/criadas ao longo de uma hora, cachorro/consentimento/pausa, cache de luzes, orçamento de chuva, rotas e colisões dinâmicas. Ciclos longos usam relógio controlado, sem adiantar contas reais. Validação autenticada no sandbox publicado confirmou em 1280/390px: tratar planta com estresse 100%, colher pela mão e reabrir mantendo 3 produtos e apenas uma dose consumida. Testes HTTP com duas contas QA confirmaram cachorro saudável + consentimento, bloqueio se qualquer participante desativa, entrega de 1 produto uma única vez com replay do recibo, pausa de uma hora e mensagem com minutos restantes, sem mudar moedas. Não houve cobranças reais. Publicação de produção em andamento. Sem migração de banco, pagamentos reais ou alterações diretas nos bens de produção.
