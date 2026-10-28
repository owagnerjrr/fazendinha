import type Phaser from 'phaser';import {ANIMAL_SIZE} from './barn-layout';
/** Four cached original-asset gait frames; one opaque animal, no layered trails. */
export function livestockArt(scene:Phaser.Scene){
 for(const kind of ['cow','goat','chicken','rooster','chick'] as const){const key=`walk-${kind}`;if(scene.textures.exists(key)||!scene.textures.exists(`life-${kind}`))continue;
  const {width:w,height:h}=ANIMAL_SIZE[kind],source=scene.textures.get(`life-${kind}`).getSourceImage() as HTMLImageElement;
  const base=document.createElement('canvas');base.width=w;base.height=h;const b=base.getContext('2d')!;b.imageSmoothingEnabled=false;b.drawImage(source,0,0,w,h);
  const cv=document.createElement('canvas');cv.width=w*4;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;const split=Math.floor(h*.76);
  for(let frame=0;frame<4;frame++){const bob=frame%2;c.drawImage(base,0,0,w,split,frame*w,-bob,w,split);c.drawImage(base,0,split-1,w,2,frame*w,split-bob-1,w,2+bob);
   for(let leg=0;leg<4;leg++){const left=Math.floor(leg*w/4),right=Math.floor((leg+1)*w/4),lift=(frame+leg)%4===1?1:0;c.drawImage(base,left,split,right-left,h-split,frame*w+left,split-lift,right-left,h-split);}
  }
  const tex=scene.textures.addCanvas(key,cv)!;for(let i=0;i<4;i++)tex.add(i,0,i*w,0,w,h);
 }
 if(!scene.textures.exists('farm-egg')){const cv=document.createElement('canvas');cv.width=12;cv.height=14;const c=cv.getContext('2d')!;c.fillStyle='#5d482f';c.fillRect(2,11,8,2);c.fillStyle='#d1bb83';c.fillRect(2,5,8,6);c.fillStyle='#fff0bc';c.fillRect(3,3,6,8);c.fillRect(4,1,4,11);c.fillStyle='#fffbe6';c.fillRect(5,3,2,5);c.fillStyle='#bca06a';c.fillRect(4,11,5,1);scene.textures.addCanvas('farm-egg',cv);}
}
