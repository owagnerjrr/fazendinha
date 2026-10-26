"""Prepare transparent generated atlases for the runtime. Requires Pillow.

This is sprite slicing/resampling, not image generation. Original transparent
masters and the generation brief are versioned in art-source/.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/v2'
OUT.mkdir(parents=True, exist_ok=True)
env = Image.open(ROOT / 'art-source/environment.png').convert('RGBA')
assert env.size == (1448, 1086), 'Environment atlas changed: review slicing coordinates.'
columns = [0, 390, 774, 1100, 1448]
rows = [0, 409, 801, 1086]
props = [
    ('house', 180, 194), ('barn', 144, 164), ('shop', 160, 150), ('mill', 130, 180),
    ('tree0', 112, 120), ('tree1', 112, 120), ('pine', 88, 132), ('tree2', 112, 128),
    ('well', 56, 76), ('rock', 38, 28), ('bush', 48, 38), ('fence', 48, 34),
]
def trim(img):
    mask = img.getchannel('A').point(lambda a: 255 if a > 40 else 0)
    return img.crop(mask.getbbox())

for idx, (name, width, height) in enumerate(props):
    row, col = divmod(idx, 4)
    im = trim(env.crop((columns[col], rows[row], columns[col+1], rows[row+1])))
    scale = min((width-2)/im.width, (height-2)/im.height)
    im = im.resize((round(im.width*scale), round(im.height*scale)), Image.Resampling.NEAREST)
    canvas = Image.new('RGBA', (width, height))
    canvas.alpha_composite(im, ((width-im.width)//2, height-im.height-1))
    canvas.save(OUT / f'{name}.png', optimize=True)

source = Image.open(ROOT / 'art-source/farmer.png').convert('RGBA')
assert source.size == (1254, 1254), 'Farmer atlas changed: review slicing coordinates.'
# The generated rows are uniformly spaced but have slightly different padding.
# Keep each complete silhouette; use one common scale for consistent anatomy.
sprites = []
for row in range(4):
    for col in range(4):
        cell = source.crop((round(col*source.width/4), round(row*source.height/4), round((col+1)*source.width/4), round((row+1)*source.height/4)))
        sprites.append(trim(cell))
scale = min(44/max(s.width for s in sprites), 59/max(s.height for s in sprites))
sheet = Image.new('RGBA', (48*4, 64*4))
for idx, sprite in enumerate(sprites):
    im = sprite.resize((round(sprite.width*scale), round(sprite.height*scale)), Image.Resampling.NEAREST)
    row, col = divmod(idx, 4)
    sheet.alpha_composite(im, (col*48+(48-im.width)//2, row*64+62-im.height))
sheet.save(OUT / 'farmer.png', optimize=True)

source = Image.open(ROOT / 'art-source/crops.png').convert('RGBA')
assert source.size == (1254, 1254), 'Crop atlas changed: review slicing coordinates.'
xs, ys = [0, 314, 631, 925, 1254], [0, 360, 620, 925, 1254]
for row, crop in enumerate(['carrot', 'lettuce', 'tomato']):
    frames = [trim(source.crop((xs[col], ys[row], xs[col+1], ys[row+1]))) for col in range(4)]
    factor = min(32/max(s.width for s in frames), 32/max(s.height for s in frames))
    for stage, sprite in enumerate(frames):
        im = sprite.resize((max(1, round(sprite.width*factor)), max(1, round(sprite.height*factor))), Image.Resampling.NEAREST)
        canvas = Image.new('RGBA', (36, 40))
        canvas.alpha_composite(im, ((36-im.width)//2, 38-im.height))
        canvas.save(OUT / f'{crop}-{stage}.png', optimize=True)
for col, tool in enumerate(['hoe', 'water', 'seed', 'bag']):
    im = trim(source.crop((xs[col], ys[3], xs[col+1], ys[4])))
    im.thumbnail((34, 34), Image.Resampling.NEAREST)
    canvas = Image.new('RGBA', (36, 36))
    canvas.alpha_composite(im, ((36-im.width)//2, (36-im.height)//2))
    canvas.save(OUT / f'icon-{tool}.png', optimize=True)
print(f'Prepared {len(props)} props, 16 character frames, 12 crop stages and 4 tool icons in {OUT}')
