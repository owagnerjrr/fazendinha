# Arte original da versão 0.5

Modo: ferramenta de geração de imagens integrada, com transparência. Duas gerações, sem arte extraída de jogos de referência. Mestres normalizados para paleta de 256 cores; o preparo reproduz os PNGs consumidos pelo jogo.

## Atlas de vida no vale

Prompt de produção: original pixel-art RPG farm sprite atlas for Phaser game; 4 by 4 grid of 16 equally sized square cells, transparent background, no text/grid/labels. Every object isolated, consistent three-quarter top-down 16-bit style, warm gold outlines and muted green/brown palette. Row 1: wooden bed with teal quilt; small TV cabinet; green sofa; farmhouse window. Row 2: wardrobe; rack with hoe/watering can/seed sack; friendly black-and-white dairy cow; cream-and-brown goat. Row 3: caramel farm dog; laying hen; strawberry plant; pink tulip plant. Row 4: sunflower; corn plant; original cocoa-and-pink-blossom ornamental tree without brand/logos; wooden flower planter. Subjects fully inside cells, aligned to bottom feet/root, no ground slabs or watermark.

## Cabeças de avatar

Prompt de produção: production pixel-art CHARACTER HEAD sprite atlas, transparent, 4 columns x 4 rows. Each row is a hairstyle, columns FRONT, LEFT PROFILE, RIGHT PROFILE, BACK. Row 1: Black boy/young man with short tightly curled dark hair and straw hat. Row 2: Black girl/young woman with two short afro puffs below the same hat. Row 3: brown-skinned person with short straight hair. Row 4: brown-skinned girl with two braids. Natural warm brown skin, no caricature or exaggerated racial features. Same green band, consistent scale, generous padding, heads only, original cozy detailed 16-bit style, no text or watermark.

`prepare-life-art.py` recorta os objetos pela maior silhueta conectada para excluir resíduos de células vizinhas, preserva transparência e usa vizinho mais próximo. A geometria dos interiores e a aplicação das paletas são código nativo do jogo.
