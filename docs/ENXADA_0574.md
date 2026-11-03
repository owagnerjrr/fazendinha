## 0.57.4 — animação e som da enxada

O vídeo revelou um fragmento isolado de 35 pixels no quadro lateral do sprite antigo. A enxada agora usa uma sequência de 12 quadros por direção, composta sobre a aparência atual do jogador: preparação, levantamento, descida, contato e recuperação, com movimento dos braços e transferência discreta de peso, mantendo os pés apoiados. O desenho antigo com o fragmento não é usado nessa sequência. A duração de 840 ms e a aplicação única aos 390 ms permanecem iguais.

O impacto recebeu uma composição sonora original curta de terra, madeira e metal, com quatro variações em cache, volume controlado pelos efeitos e sem alterar o volume da música. O som acompanha o efeito de terra de uma ação aceita; em modo online, esse retorno depende da confirmação do servidor. Não há reprodução para ações rejeitadas ou com os efeitos silenciados.

Validação: 457 testes e build. Em execução local isolada 390/1280px: doze quadros efetivamente alternados nas quatro direções; terra preparada uma vez; primeiro som aos cerca de 392 ms, uma reprodução por golpe; ação fora do alcance silenciosa; silenciamento dos efeitos preservado. Recorte do fragmento antigo: 35 pixels; nova pose de contato: zero. Prévias geradas para original, cabelo curto, capuz, coques e roupas Guerreiro Link/Samus Aran. PCM em 44,1/48 kHz validado quanto a duração, variações, ausência de NaN e pico abaixo de 0,801 antes do ganho de saída. Sem migrações, compras ou alterações em progressos reais. A audição e a latência no aparelho físico do usuário ainda dependem de conferência.

