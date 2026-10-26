"""Prepare complete equipped-walking sprites; tools are baked into the grip.

Requires Pillow. This only slices/resamples the generated original sheets.
"""
from pathlib import Path
from statistics import median
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/v3'
OUT.mkdir(parents=True, exist_ok=True)

def hat_span(im):
    xs=[]
    for y in range(round(im.height*.57)):
        for x in range(im.width):
            r,g,b,a=im.getpixel((x,y))
            if a>90 and r>145 and g>95 and r>g*1.08 and b<g*.8: xs.append(x)
    assert xs,'Missing hat anchor'
    return min(xs),max(xs)

def feet(im):
    points=[]
    for y in range(round(im.height*.67),im.height):
        for x in range(round(im.width*.27),round(im.width*.73)):
            r,g,b,a=im.getpixel((x,y))
            if a>100 and r>43 and g>22 and r>g*1.16 and g>b*1.16: points.append((x,y))
    assert points,'Missing boot anchor'
    bottom=max(y for x,y in points)
    xs=[x for x,y in points if y>bottom-10]
    return (min(xs)+max(xs))/2,bottom

for kind in ['hoe','seed','water']:
    source=Image.open(ROOT/'art-source/carry'/f'{kind}.png').convert('RGBA')
    frames=[source.crop((round(c*source.width/4),round(r*source.height/4),round((c+1)*source.width/4),round((r+1)*source.height/4))) for r in range(4) for c in range(4)]
    spans=[hat_span(frame) for frame in frames]
    factor=40/median(spans[i][1]-spans[i][0] for i in [0,4,8,12])
    sheet=Image.new('RGBA',(128*4,112*4))
    for idx,frame in enumerate(frames):
        _,y=feet(frame)
        # A stepping boot changes sides each frame. Anchor horizontally by
        # the head instead, so a held tool cannot jitter with the leading leg.
        x=(spans[idx][0]+spans[idx][1])/2
        box=frame.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox();assert box
        im=frame.crop(box)
        im=im.resize((round(im.width*factor),round(im.height*factor)),Image.Resampling.NEAREST)
        px=round(64+(box[0]-x)*factor);py=round(100+(box[1]-y)*factor)
        assert 0<=px and 0<=py and px+im.width<=128 and py+im.height<=112,(kind,idx,px,py,im.size)
        row,col=divmod(idx,4)
        sheet.alpha_composite(im,(col*128+px,row*112+py))
    sheet.save(OUT/f'carry-{kind}.png',optimize=True)
print('Prepared 48 complete carry frames, with fixed foot anchors and no floating overlays.')
