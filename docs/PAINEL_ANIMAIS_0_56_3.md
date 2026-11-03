# Painel compacto de cuidados — 0.56.3

Layout individual dos animais usa toda a largura disponível, com retrato no cabeçalho, seis indicadores em duas colunas e botões de cuidados em grade. Nome, autonomia, localização, transferência, sexo e memórias ficam recolhidos em “Nome e localização”. Cuidados continuam visíveis; controles mantêm área de toque de pelo menos 44 px.

O mesmo organizador é usado nos animais nativos e nas espécies criadas pelo painel, incluindo o coelho. Controles existentes são movidos no DOM sem substituir eventos ou alterar comandos/regras. Lista geral mantém ações coletivas; painel individual mostra somente o animal selecionado.

Verificação local no Edge em 320, 390 e 1280 px: sem rolagem horizontal, colunas alinhadas, botões com altura mínima de toque; oferecer água e renomear funcionam após a reorganização. Conferidos painel nativo e coelho. Sem mudanças no banco, economia ou progresso. Emulação móvel não substitui aparelho físico.

431 testes automatizados e build passaram.
