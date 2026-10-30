import type Phaser from 'phaser';import {ANIMAL_SIZE} from './barn-layout';
/** Eight cached original-asset gait frames; one opaque animal, no layered trails. */
export function livestockArt(scene:Phaser.Scene){
 for(const kind of ['cow','goat','chicken','rooster','chick'] as const){const key=`walk-${kind}`;if(scene.textures.exists(key)||!scene.textures.exists(`life-${kind}`))continue;
  const {width:w,height:h}=ANIMAL_SIZE[kind],source=scene.textures.get(`life-${kind}`).getSourceImage() as HTMLImageElement;
  const base=document.createElement('canvas');base.width=w;base.height=h;const b=base.getContext('2d')!;b.imageSmoothingEnabled=false;b.drawImage(source,0,0,w,h);
  const cv=document.createElement('canvas');cv.width=w*8;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;const split=Math.floor(h*.66);
  for(let frame=0;frame<8;frame++){
   // One source sample per output pixel keeps the torso opaque and the feet free of trails.
   const data=b.getImageData(0,0,w,h),out=c.createImageData(w,h),stride=Math.max(1,Math.round(w*.055));
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const leg=Math.floor(x/(w/4)),phase=frame*Math.PI/4+(leg%2)*Math.PI;
    const blend=Math.max(0,(y-split)/(h-split)),sx=Math.round(x-Math.sin(phase)*stride*blend),sy=y+Math.round(Math.max(0,Math.cos(phase))*2*blend);
    if(sx<0||sx>=w||sy>=h)continue;const from=(sy*w+sx)*4,to=(y*w+x)*4;for(let k=0;k<4;k++)out.data[to+k]=data.data[from+k];
   }c.putImageData(out,frame*w,0);
  }
  const tex=scene.textures.addCanvas(key,cv)!;for(let i=0;i<8;i++)tex.add(i,0,i*w,0,w,h);
 }
 if(!scene.textures.exists('farm-egg')){const cv=document.createElement('canvas');cv.width=12;cv.height=14;const c=cv.getContext('2d')!;c.fillStyle='#5d482f';c.fillRect(2,11,8,2);c.fillStyle='#d1bb83';c.fillRect(2,5,8,6);c.fillStyle='#fff0bc';c.fillRect(3,3,6,8);c.fillRect(4,1,4,11);c.fillStyle='#fffbe6';c.fillRect(5,3,2,5);c.fillStyle='#bca06a';c.fillRect(4,11,5,1);scene.textures.addCanvas('farm-egg',cv);}
}
