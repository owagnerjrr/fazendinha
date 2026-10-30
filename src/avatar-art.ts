import Phaser from 'phaser';
import {drawModelFeatures} from './avatar-features';
import {cleanAvatarPixels} from './avatar-pixels';
import {drawNightHood} from './hood-art';
import {idlePixels} from './idle-pixels';
import { SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, type Avatar } from './content';
const spec:Record<string,{w:number;h:number}>={'farmer-v2':{w:48,h:64},'carry-hoe':{w:128,h:112},'carry-seed':{w:128,h:112},'carry-water':{w:128,h:112},'hoe-actions':{w:96,h:112},'water-actions':{w:96,h:112}};
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
let avatarInstance=0;
export class AvatarArt {
 private instance=++avatarInstance;
 private keys=new Map<string,string>();private generation=0;private previous?:Avatar;
 constructor(private scene:Phaser.Scene){}
 destroy(){for(const key of this.keys.values())this.scene.textures.remove(key);this.keys.clear();}
 key(base:string,avatar:Avatar){
  const old=this.previous;
  if(!old||old.style!==avatar.style||old.skin!==avatar.skin||old.hair!==avatar.hair||old.shirt!==avatar.shirt){for(const key of this.keys.values()){this.scene.textures.remove(key);this.scene.textures.remove(`${key}-source`);}this.keys.clear();this.previous={...avatar};this.generation++;}
  if(this.keys.has(base))return this.keys.get(base)!;
  if(base==='pose-sit'||base==='pose-sleep'){
   const source=this.scene.textures.get(this.key('farmer-v2',avatar)).getSourceImage() as HTMLCanvasElement;
   const cv=document.createElement('canvas');cv.width=48;cv.height=64;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;
   c.drawImage(source,0,base==='pose-sit'?192:0,48,48,0,0,48,48);
   if(base==='pose-sleep'){// Keep face/skin; cover open-eye pixels with skin and closed lids.
    const pixels=c.getImageData(0,0,48,48),d=pixels.data;let eyeY=29;const rows=new Map<number,number>();
    for(let y=24;y<38;y++)for(let x=15;x<34;x++){const i=(y*48+x)*4;if(d[i+3]>100&&d[i]<75&&d[i+1]<65&&d[i+2]<65)rows.set(y,(rows.get(y)??0)+1);}
    eyeY=[...rows].sort((a,b)=>b[1]-a[1])[0]?.[0]??29;
    c.fillStyle=SKIN_TONES[avatar.skin];c.fillRect(17,eyeY-2,5,5);c.fillRect(27,eyeY-2,5,5);c.fillStyle='#50392b';c.fillRect(17,eyeY+1,5,1);c.fillRect(27,eyeY+1,5,1);
   }const key=`avatar-${this.instance}-${this.generation}-${base}`;this.scene.textures.addCanvas(key,cv);this.keys.set(base,key);return key;
  }
  const {w,h}=spec[base],source=this.scene.textures.get(base).getSourceImage() as HTMLImageElement;
  const canvas=document.createElement('canvas');canvas.width=w*4;canvas.height=h*4;const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(source,0,0);
  const skin=rgb(SKIN_TONES[avatar.skin]),hair=rgb(HAIR_COLORS[avatar.hair]),shirt=rgb(SHIRT_COLORS[avatar.shirt]);
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   const data=ctx.getImageData(col*w,row*h,w,h),p=data.data;let top=h,cx=w/2,left=w,right=0;
   for(let y=0;y<h*.65;y++)for(let x=Math.max(0,w/2-24);x<Math.min(w,w/2+24);x++){const i=(y*w+x)*4;if(p[i+3]>180&&p[i]>145&&p[i+1]>95&&p[i]>p[i+1]*1.08&&p[i+2]<p[i+1]*.8)top=Math.min(top,y);}
   for(let y=top;y<Math.min(h,top+15);y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(p[i+3]>180&&p[i]>145&&p[i+1]>95&&p[i]>p[i+1]*1.08&&p[i+2]<p[i+1]*.8){left=Math.min(left,x);right=Math.max(right,x);}}
   if(left<right)cx=Math.round((left+right)/2);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4;if(p[i+3]<180)continue;const r=p[i],g=p[i+1],b=p[i+2];let target:number[]|null=null,shade=1;
    if(y>top+23&&y<h-8&&Math.abs(x-cx)<23&&g>r*1.08&&g>b*1.1){target=shirt;shade=Math.max(.35,Math.min(1.3,(r+g+b)/180));}
    // The native face includes orange/brown shadow pixels, not just peach highlights.
    // Recolor that bounded face region together, preserving eyes and outlines.
    else if(y>top+21&&y<top+34&&Math.abs(x-(cx+(row===1?-3:row===2?3:0)))<9&&row!==3&&r>125&&g>55&&r>g*1.15&&b<g*1.1){target=skin;shade=Math.max(.72,Math.min(1.12,(r+g+b)/540));}
    // Outside the face, recolor only peach skin so boots remain brown.
    else if(y>top+15&&y<h-13&&Math.abs(x-cx)<23&&r>200&&g>125&&g<r*.84&&b>85&&b<g*.85){target=skin;shade=Math.max(.5,Math.min(1.15,(r+g+b)/565));}
    else if(y>top+16&&y<top+31&&Math.abs(x-cx)<20&&r>65&&r<180&&g<r*.55&&b<65){target=hair;shade=Math.max(.4,Math.min(1.1,r/125));}
    if(target){p[i]=Math.min(255,target[0]*shade);p[i+1]=Math.min(255,target[1]*shade);p[i+2]=Math.min(255,target[2]*shade);}
   }
   cleanAvatarPixels(p,w,h);ctx.putImageData(data,col*w,row*h);
   // Every style keeps the complete native body and face; no separate head is cut in.
   const direction=['down','left','right','up'][row],ox=col*w,oy=row*h;
   ctx.save();ctx.beginPath();ctx.rect(ox,oy,w,h);ctx.clip();
   ctx.save();ctx.translate(ox,oy);drawModelFeatures(ctx,avatar,row,cx,top);ctx.restore();
   if(avatar.style==='hood'){
    const face=document.createElement('canvas');face.width=22;face.height=15;face.getContext('2d')!.drawImage(canvas,ox+cx-11,oy+top+19,22,15,0,0,22,15);
    ctx.clearRect(ox+cx-25,oy+Math.max(0,top-4),50,top+30-Math.max(0,top-4));ctx.save();ctx.translate(ox+cx-20,oy+top-4);drawNightHood(ctx,direction);ctx.restore();
    if(direction!=='up'){ctx.save();ctx.beginPath();ctx.rect(ox+cx-10,oy+top+20,20,13);ctx.clip();ctx.drawImage(face,ox+cx-11,oy+top+19);ctx.restore();}
   }else if(avatar.style==='puffs'||avatar.style==='braids'){
    const baseHair=HAIR_COLORS[avatar.hair];ctx.fillStyle=baseHair;
    const sides=direction==='left'?[1]:direction==='right'?[-1]:[-1,1];
    for(const side of sides){const profile=direction==='left'||direction==='right';const x=ox+cx+side*(profile?7:10)-2,y=oy+top+21;
     if(avatar.style==='puffs'){ctx.fillRect(x,y,5,7);ctx.fillRect(x-1,y+2,7,3);ctx.fillStyle='#bd9d6a';ctx.fillRect(x+2,y,3,1);ctx.fillStyle=baseHair;}
     else{for(let n=0;n<4;n++)ctx.fillRect(x+(n%2),y+n*3,4,4);ctx.fillStyle='#bd9d6a';ctx.fillRect(x+1,y+11,3,2);ctx.fillStyle=baseHair;}
    }
   }
   ctx.restore();const final=ctx.getImageData(ox,oy,w,h);cleanAvatarPixels(final.data,w,h);ctx.putImageData(final,ox,oy);
  }
  const key=`avatar-${this.instance}-${this.generation}-${base}`;const sourceTexture=this.scene.textures.addCanvas(key,canvas)!;this.scene.textures.addSpriteSheet('',sourceTexture,{frameWidth:w,frameHeight:h});this.keys.set(base,key);return key;
 }
 idleKey(base:string,avatar:Avatar){
  const sourceKey=this.key(base,avatar),cache=`idle-${base}`;if(this.keys.has(cache))return this.keys.get(cache)!;
  const pose=base.startsWith('pose-'),{w,h}=spec[base]??{w:48,h:64},rows=pose?1:4;
  const source=this.scene.textures.get(sourceKey).getSourceImage() as HTMLCanvasElement;
  const cv=document.createElement('canvas');cv.width=w*4;cv.height=h*rows;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;
  const frame=document.createElement('canvas');frame.width=w;frame.height=h;const f=frame.getContext('2d')!;
  const feet=pose?48:h===112?100:62,legs=feet-10,upper=legs-14;
  for(let row=0;row<rows;row++){f.clearRect(0,0,w,h);f.drawImage(source,0,row*h,w,h,0,0,w,h);const pixels=f.getImageData(0,0,w,h);
   for(let col=0;col<4;col++){const data=c.createImageData(w,h);data.data.set(idlePixels(pixels.data,w,h,upper,legs,col===3?1:col));c.putImageData(data,col*w,row*h);}
  }
  const key=`avatar-${this.instance}-${this.generation}-${cache}`,texture=this.scene.textures.addCanvas(key,cv)!;this.scene.textures.addSpriteSheet('',texture,{frameWidth:w,frameHeight:h});this.keys.set(cache,key);return key;
 }
}
