"""Slice the original generated v5 atlases; runtime palettes and room geometry are code-native."""
from pathlib import Path
from PIL import Image
from collections import deque
def sprite_box(im):
 alpha=im.getchannel('A');pixels=alpha.load();seen=set();best=[]
 for y in range(im.height):
  for x in range(im.width):
   if (x,y) in seen or pixels[x,y]<80:continue
   q=deque([(x,y)]);seen.add((x,y));group=[]
   while q:
    a,b=q.popleft();group.append((a,b))
    for dx,dy in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(1,1),(-1,1),(1,-1)]:
     nx,ny=a+dx,b+dy
     if 0<=nx<im.width and 0<=ny<im.height and (nx,ny) not in seen and pixels[nx,ny]>=80:seen.add((nx,ny));q.append((nx,ny))
   if len(group)>len(best):best=group
 assert best
 return (max(0,min(x for x,y in best)-2),max(0,min(y for x,y in best)-2),min(im.width,max(x for x,y in best)+3),min(im.height,max(y for x,y in best)+3))

root=Path(__file__).resolve().parents[1];out=root/'public/assets/v5';out.mkdir(parents=True,exist_ok=True)
names=['bed','tv','sofa','window','wardrobe','rack','cow','goat','dog','chicken','strawberry','tulip','sunflower','corn','cocoaTree','flowerPlanter']
source=Image.open(root/'art-source/v5/life-atlas.png').convert('RGBA')
for i,name in enumerate(names):
 r,c=divmod(i,4);cell=source.crop((round(c*source.width/4),round(r*source.height/4),round((c+1)*source.width/4),round((r+1)*source.height/4)));box=sprite_box(cell)
 cell=cell.crop(box);limit=160 if name in ['cocoaTree','bed','wardrobe'] else 120
 cell.thumbnail((limit,limit),Image.Resampling.NEAREST);cell.save(out/f'{name}.png',optimize=True)
source=Image.open(root/'art-source/v5/avatar-heads.png').convert('RGBA')
for r,name in enumerate(['crop','puffs','short','braids']):
 for c,direction in enumerate(['down','left','right','up']):
  cell=source.crop((round(c*source.width/4),round(r*source.height/4),round((c+1)*source.width/4),round((r+1)*source.height/4)));box=sprite_box(cell)
  cell=cell.crop(box);cell.thumbnail((44,44),Image.Resampling.NEAREST);cell.save(out/f'head-{name}-{direction}.png',optimize=True)
print('Prepared 16 props and 16 directional avatar heads.')
