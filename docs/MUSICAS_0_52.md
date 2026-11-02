# Trilhas por ambiente — 0.52.0

Distribuição confirmada pelo dono:

| Ambiente | Arquivo recebido | Recurso integrado |
|---|---|---|
| Venda do Vartin | Venda do Vartin.mp3 | /assets/music-v1/vartin.mp3 |
| Celeiro, currais interiores próprios e de amigos | Musica Celeiro.mp3 | /assets/music-v1/barn.mp3 |
| Casa | Musica da casa.mp3 | /assets/music-v1/house.mp3 |
| Fazenda e Campos do Sul | Musica da Fazenda e Sul.mp3 | /assets/music-v1/outdoors.mp3 |

Malo Mart.m4a foi excluído por orientação explícita do dono. As músicas recebidas substituem a composição sintetizada nos ambientes principais. Não são apresentadas como composições originais do projeto. Áudio próprio de cenários administrativos continua tendo prioridade quando cadastrado e carregado.

## Tratamento das faixas

FFmpeg, medição EBU R128, compressão RMS suave 1,6:1 (limiar -18,06 dB, ataque 25 ms, retorno 300 ms, joelho suave), seguida de normalização individual em duas passagens para -22 LUFS, teto -2 dBTP. Foram aplicados ganhos diferentes conforme a medição de cada faixa. MP3 estéreo, 44,1 kHz, VBR qualidade 3; metadados removidos, extremidades suavizadas em 8 ms. Os arquivos recebidos permanecem intactos fora do repositório.

| Faixa | LUFS recebido | LUFS final | Pico final dBTP | Faixa dinâmica antes → depois (LU) | Trecho mais intenso (s) |
|---|---:|---:|---:|---:|---:|
| Celeiro | -13,92 | -21,99 | -8,79 | 3,9 → 2,9 | 59,6 |
| Casa | -14,27 | -22,00 | -9,57 | 7,1 → 4,9 | 85,6 |
| Fazenda/Sul | -14,72 | -21,99 | -8,58 | 5,4 → 3,9 | 171,5 |
| Vartin | -14,02 | -21,99 | -6,84 | 1,9 → 1,4 | 53,2 |

Diferença final integrada de 0,01 LU. A compressão reduz aumentos de intensidade sem achatar completamente os arranjos. Relatório de medição após codificação em MUSIC_LEVELS.json. Não foi feito ensaio subjetivo com fones/alto-falantes físicos.

## Reprodução e memória

Um único controlador global de música, um AudioContext e dois elementos HTMLAudio reutilizados por streaming; não há cache de quatro faixas PCM descompactadas. Trocas de ambiente usam crossfade de potência constante de 0,85 s. A emenda do loop usa 1,2 s de crossfade; o player anterior é pausado e liberado após a transição. Os dois players só ficam tocando juntos durante essas emendas. A faixa externa mantém o mesmo player e posição na transição fazenda/sul, ao andar e ao abrir menus comuns. Abas da venda também não reiniciam a faixa.

Volume e silêncio preservam a chave existente wj-music-v1; efeitos mantêm seu controle separado. As preferências são locais ao aparelho, não uma sincronização de conta. O áudio só é iniciado após toque ou tecla, e pausa quando a aba fica oculta. Cenas administrativas continuam podendo fornecer trilha cadastrada.

As músicas não entram no download antecipado do service worker. Requisições de áudio/Range passam ao navegador/CDN para streaming e cache HTTP, sem transformar respostas parciais em arquivos completos. Áudio offline depende do cache do navegador e não é garantido.

## Validação

389 testes e build. Navegador Edge headless em 1440 e 390 px: início por gesto, seleção real dos quatro ambientes, fazenda/sul sem reiniciar, caminhada/abas sem reiniciar, trechos mais intensos de cada faixa com sinal medido no AnalyserNode, emenda dos quatro loops, um player após a transição, limite de dois durante trocas, trocas rápidas, silenciar sem suspender efeitos e recuperação de preferências após recarga. Limites: não houve teste em Safari/iPhone ou aparelho físico; a avaliação de nível é objetiva, não uma audição humana.

Homologação online: projeto fazendinha-wj-mp-test no commit 82b6b56, navegador autenticado em 1440/390px. Os quatro ambientes tocaram pelos controles existentes; tabs/sul não reiniciaram a trilha; volume/mute, players limitados e streaming HTTP 206 conferidos. Economia e bens da conta QA preservados. Sem cobranças e sem erros JavaScript/5xx. A verificação pública de produção ocorre após a integração.
