"""Slice v0.3 action art, keeping feet aligned and a consistent character scale.
Requires Pillow. Runtime uses the committed PNGs and needs no Python.
"""
from pathlib import Path
from statistics import median
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/v3'
OUT.mkdir(parents=True, exist_ok=True)
DIRECTIONS = ['down', 'left', 'right', 'up']

def cells(name):
    source = Image.open(ROOT / 'art-source/v3' / f'{name}.png').convert('RGBA')
    return [source.crop((round(c*source.width/4), round(r*source.height/4), round((c+1)*source.width/4), round((r+1)*source.height/4))) for r in range(4) for c in range(4)]

def gold_points(im, lower=False):
    points=[]
    for y in range(im.height):
        if (not lower and y > im.height*.57) or (lower and y < im.height*.62): continue
        for x in range(im.width):
            r,g,b,a=im.getpixel((x,y))
            if a>90 and r>145 and g>95 and r>g*1.08 and b<g*.8:
                points.append((x,y))
    return points

def boot_anchor(im):
    # Steel below the boots is excluded by its neutral hue; low brown pixels
    # near the body center identify the planted feet rather than the hoe tip.
    points=[]
    for y in range(round(im.height*.67),im.height):
        for x in range(round(im.width*.27),round(im.width*.73)):
            r,g,b,a=im.getpixel((x,y))
            if a>100 and r>43 and g>22 and r>g*1.16 and g>b*1.16:
                points.append((x,y))
    assert points,'Cannot identify boots'
    bottom=max(y for x,y in points)
    foot=[x for x,y in points if y>bottom-10]
    return (min(foot)+max(foot))/2,bottom

anchors={}
for kind in ['hoe','water']:
    sprites=cells(f'farmer-{kind}')
    hat_widths=[]
    for i in [0,4,8,12]:
        pts=gold_points(sprites[i]); assert pts
        hat_widths.append(max(x for x,y in pts)-min(x for x,y in pts))
    factor=40/median(hat_widths)
    sheet=Image.new('RGBA',(96*4,112*4))
    anchors[kind]={}
    for idx,im in enumerate(sprites):
        cx,feet=boot_anchor(im)
        bbox=im.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox(); assert bbox
        crop=im.crop(bbox)
        sized=crop.resize((round(crop.width*factor),round(crop.height*factor)),Image.Resampling.NEAREST)
        px=round(48+(bbox[0]-cx)*factor); py=round(100+(bbox[1]-feet)*factor)
        assert px>=0 and py>=0 and px+sized.width<=96 and py+sized.height<=112,(kind,idx,px,py,sized.size)
        row,col=divmod(idx,4)
        sheet.alpha_composite(sized,(col*96+px,row*112+py))
        # Where water leaves the brass sprinkler rose, in local sprite pixels.
        pts=gold_points(im,lower=True)
        if row==3:
            pts=[]
            for y in range(round(im.height*.44),round(im.height*.77)):
                for x in range(round(cx+20),im.width):
                    r,g,b,a=im.getpixel((x,y))
                    if a>90 and r>145 and g>95 and r>g*1.08 and b<g*.8: pts.append((x,y))
        if pts:
            edge=min(x for x,y in pts) if row==1 else max(x for x,y in pts)
            pts=[(x,y) for x,y in pts if abs(x-edge)<22]
            sx=sum(x for x,y in pts)/len(pts); sy=sum(y for x,y in pts)/len(pts)
        else: sx,sy=cx+50,feet-45
        anchors[kind].setdefault(DIRECTIONS[row],[]).append({'x':round(48+(sx-cx)*factor,2),'y':round(100+(sy-feet)*factor,2)})
    sheet.save(OUT/f'farmer-{kind}.png',optimize=True)

sprites=cells('chickens')
trimmed=[im.crop(im.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox()) for im in sprites]
factor=min(35/max(im.width for im in trimmed),34/max(im.height for im in trimmed))
sheet=Image.new('RGBA',(160,160))
for idx,im in enumerate(trimmed):
    im=im.resize((round(im.width*factor),round(im.height*factor)),Image.Resampling.NEAREST)
    row,col=divmod(idx,4)
    sheet.alpha_composite(im,(col*40+(40-im.width)//2,row*40+38-im.height))
sheet.save(OUT/'chickens.png',optimize=True)
(OUT/'anchors.json').write_text(json.dumps(anchors,ensure_ascii=False,indent=2)+'\n')
print('Prepared two 16-frame farmer action sheets, 16 chicken frames and nozzle anchors.')
