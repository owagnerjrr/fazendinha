# Auditoria 0.26.0 — Fazendinha WJ

## Correções comprovadas
- **Recuperação de ações:** uma compra nova podia receber como sucesso o resultado de uma ação anterior recuperada. Teste reproduziu ausência de erro antes da correção. Agora recupera a ação antiga, informa explicitamente o jogador e não confirma a nova. Metadados de comprovante corrompidos são removidos sem alterar a fazenda; progresso autoritativo é recarregado.
- **Celular:** regra CSS escondia o botão de sair da casa/celeiro. Reproduzido também no sandbox publicado. Botão restaurado, mantendo os demais controles.
- **Visitantes:** um AvatarArt compartilhado invalidava a textura de outro visitante. Medição com três aparências e 12 atualizações: 81 eventos de criação antes, nove na preparação depois, zero durante movimento. Cada visitante conserva seu cache, liberado na saída.
- **Animais:** ciclo usava períodos incompatíveis e ultrapassava o fim da curva de suavização. Encontrado salto de 22 pixels e orientação invertida após 22 segundos. Período corrigido e teste cobre dois ciclos completos. Aproximação para carinho usa passos em vez de apenas deslocar o animal.
- **Desempenho:** medição de quadros reais, não apenas da configuração de FPS. Um limitador experimental reduziu o resultado para 46–47 FPS nesta tela de 120 Hz e foi descartado. Mantido requestAnimationFrame e o ajuste automático de efeitos; a correção de cache dos visitantes remove o processamento comprovadamente desnecessário.
- **Dependências:** Better Auth e componentes alinhados a 1.7.7, Zod a 4.6.6; removido @vercel/node de desenvolvimento, sem usos/imports no projeto, responsável por transitivas antigas. O relatório npm completo passou a zero alertas altos/críticos/moderados, com sete baixos transitivos restantes. Isso não atualiza o serviço gerenciado Neon Auth: versão interna não inspecionável aqui.

## Dados e segurança
Nenhuma migração ou escrita de teste em produção. Consulta agregada encontrou 34 fazendas, dois pedidos, dois pagamentos e nenhum saldo negativo. Saldos individuais não foram fixados ou sobrescritos. Três contas QA novas foram criadas apenas no sandbox; moeda/XP e maturação de uma cenoura foram preparados exclusivamente nesses fixtures. E-mail de um fixture foi verificado apenas no banco isolado para testar checkout, após recusa correta de e-mail não confirmado.

JWT assinado/expiração/issuer, conta ativa, preços no servidor, ledger transacional, vinculação de pedidos, HMAC e replays revisados. Testes PostgreSQL local cobrem crédito, repetição, evento antigo, reembolso, dívida, isolamento de notificações, presença, bloqueio e roubo protegido. Nenhum reset de dados, segredo impresso ou cobrança real.

## Validação
- 198 testes automatizados; build TypeScript/Vite/PWA.
- Navegador desktop 1280×900 e celular emulado 390×844: fazenda, quatro direções, ferramentas, casa, celeiro, noite, entradas/saídas e seis ciclos de reentrada. Capturas e métricas guardadas no relatório externo. Antes da correção de saída, o teste móvel parou exatamente no botão invisível; repetido depois.
- Três visitantes distintos: todas as texturas válidas, zero reconstrução por quadro e retorno da contagem de texturas ao valor inicial após destruir.
- Loja: compra/equipar/retorno gratuito ao original, saldo insuficiente, quatro direções; nove modelos × quatro roupas × seis animações × 16 quadros sem erros.
- API sandbox: cadastro, perfil, ferramentas, compra/replay, cinco espécies, ração/água/carinho repetido, roupas, casa, terreno/galinheiro, pesca e replay, amizade, ajuda em vários canteiros, chat/replay e terceiros recusados. Colheita, produto animal e venda conferidos com replays. Novo login preservou moedas, avatar, animais, roupas, plantas, produtos, inventário, casa e terras.
- Checkout oficial de cartão sandbox criado para cinco fertilizantes/R$10: pendente, sem entrega. Pix da conta de testes indisponível; apresentação Pix/cartão validada com fixtures. Nenhuma nova transação real.

## Limites e pendências
- Não houve teste em telefone físico, Safari/iOS, rede móvel adversa prolongada ou sessão de muitas horas; emulação não garante 60 FPS em todo aparelho.
- Consentimento Google e recebimento real de e-mail não executados; login por sessão/e-mail de QA e retorno autorizado do OAuth são verificações separadas.
- Aprovação/recusa/reembolso oficiais foram validados em auditorias anteriores no sandbox; não repetidos como pagamentos nesta revisão. Pix real permanece evidência anterior, não teste novo.
- CRON_SECRET de produção existe e vercel.json agenda 06 UTC. Ainda não há evidência observada da primeira execução automática após sua configuração. Não foi executada reconciliação financeira manual de produção nesta auditoria.
- Sete alertas baixos transitivos persistem, envolvendo a cadeia de UI/e-mail do SDK e deepmerge; não aplicado npm audit fix --force. Revisar upstream quando houver solução compatível.
- Visitas permitem o mapa e ações sociais existentes; interiores da casa/celeiro do amigo não são um fluxo implementado nesta revisão.

## Referências de segurança
- https://github.com/advisories/GHSA-965c-763c-88jm
- https://github.com/advisories/GHSA-r4xp-prcw-77qf
- https://github.com/advisories/GHSA-mrhx-c7xc-m3w5

A publicação e as verificações do candidato em sandbox/produção são registradas no relatório de entrega. O histórico antigo de VALIDACAO/Orders permanece como histórico, não como configuração atual.
