import Phaser from 'phaser';
import {breathingPixels} from './idle-art';
import { SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, type Avatar } from './content';
const spec:Record<string,{w:number;h:number}>={'farmer-v2':{w:48,h:64},'carry-hoe':{w:128,h:112},'carry-seed':{w:128,h:112},'carry-water':{w:128,h:112},'hoe-actions':{w:96,h:112},'water-actions':{w:96,h:112}};
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
let avatarInstance=0;
export class AvatarArt {
 private instance=++avatarInstance;
 private signature='';private keys=new Map<string,string>();private generation=0;
 constructor(private scene:Phaser.Scene){}
 key(base:string,avatar:Avatar){
  const signature=JSON.stringify(avatar);
  if(signature!==this.signature){for(const key of this.keys.values()){this.scene.textures.remove(key);this.scene.textures.remove(`${key}-source`);}this.keys.clear();this.signature=signature;this.generation++;}
  if(this.keys.has(base))return this.keys.get(base)!;
  if(base.endsWith('-idle')){
   const sourceBase=base.slice(0,-5),sourceKey=this.key(sourceBase,avatar),{w,h}=spec[sourceBase];
   const source=this.scene.textures.get(sourceKey).getSourceImage() as HTMLCanvasElement;
   const canvas=document.createElement('canvas');canvas.width=w*4;canvas.height=h*4;const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
   const feet=sourceBase==='farmer-v2'?h-10:h-20;
   for(let row=0;row<4;row++)for(let phase=0;phase<4;phase++){
    const x=phase*w,y=row*h,data=(source as HTMLCanvasElement).getContext('2d')!.getImageData(0,y,w,h);
    data.data.set(breathingPixels(data.data,w,h,feet,phase));ctx.putImageData(data,x,y);
   }
   const key=`avatar-${this.instance}-${this.generation}-${base}`,texture=this.scene.textures.addCanvas(key,canvas)!;
   this.scene.textures.addSpriteSheet('',texture,{frameWidth:w,frameHeight:h});this.keys.set(base,key);return key;
  }
  const {w,h}=spec[base],source=this.scene.textures.get(base).getSourceImage() as HTMLImageElement;
  const canvas=document.createElement('canvas');canvas.width=w*4;canvas.height=h*4;const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(source,0,0);
  const skin=rgb(SKIN_TONES[avatar.skin]),hair=rgb(HAIR_COLORS[avatar.hair]),shirt=rgb(SHIRT_COLORS[avatar.shirt]);
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   const data=ctx.getImageData(col*w,row*h,w,h),p=data.data;let top=h,cx=w/2,left=w,right=0;
   for(let y=0;y<h*.72;y++)for(let x=Math.max(0,w/2-24);x<Math.min(w,w/2+24);x++){const i=(y*w+x)*4,r=p[i],g=p[i+1],b=p[i+2];if(p[i+3]>100&&r>145&&g>95&&r>g*1.08&&b<g*.8)top=Math.min(top,y);}
   for(let y=top;y<Math.min(h,top+15);y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(p[i+3]>100&&p[i]>145&&p[i+1]>95&&p[i]>p[i+1]*1.08&&p[i+2]<p[i+1]*.8){left=Math.min(left,x);right=Math.max(right,x);}}
   if(left<right)cx=(left+right)/2;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4;if(p[i+3]<30)continue;const r=p[i],g=p[i+1],b=p[i+2];let target:number[]|null=null,shade=1;
    if(y>top+23&&y<h-8&&Math.abs(x-cx)<23&&g>r*1.08&&g>b*1.1){target=shirt;shade=Math.max(.35,(r+g+b)/340);}
    else if(y>top+15&&y<h-9&&Math.abs(x-cx)<26&&r>g*1.12&&g>b*1.15&&r>105&&g>55&&b>25){target=skin;shade=Math.max(.38,Math.min(1.2,(r+g+b)/480));}
    if(target){p[i]=Math.min(255,target[0]*shade);p[i+1]=Math.min(255,target[1]*shade);p[i+2]=Math.min(255,target[2]*shade);}
   }
   ctx.putImageData(data,col*w,row*h);
   if(avatar.style!=='classic'){
    const direction=['down','left','right','up'][row],head=this.scene.textures.get(`head-${avatar.style}-${direction}`).getSourceImage() as HTMLImageElement;
    const headCanvas=document.createElement('canvas');headCanvas.width=head.width;headCanvas.height=head.height;const hc=headCanvas.getContext('2d')!;hc.drawImage(head,0,0);const hd=hc.getImageData(0,0,head.width,head.height),hp=hd.data;
    for(let y=0;y<head.height;y++)for(let x=0;x<head.width;x++){const i=(y*head.width+x)*4,r=hp[i],g=hp[i+1],b=hp[i+2];if(hp[i+3]<30)continue;let target:number[]|null=null,shade=1;
     if(y>head.height*.36&&r>g*1.35&&g>b*1.1&&r>65&&g>30){target=skin;shade=Math.min(1.2,(r+g+b)/260);}
     else if(y>head.height*.34&&r<95&&g<75&&b<75&&r>g*.9){target=hair;shade=Math.max(.35,(r+g+b)/110);}
     if(target){hp[i]=target[0]*shade;hp[i+1]=target[1]*shade;hp[i+2]=target[2]*shade;}
    }hc.putImageData(hd,0,0);
    ctx.clearRect(col*w+cx-25,row*h+top-2,50,40);const scale=40/head.width;ctx.drawImage(headCanvas,col*w+cx-20,row*h+top-1,40,head.height*scale);
   }
  }
  const key=`avatar-${this.instance}-${this.generation}-${base}`;const sourceTexture=this.scene.textures.addCanvas(key,canvas)!;this.scene.textures.addSpriteSheet('',sourceTexture,{frameWidth:w,frameHeight:h});this.keys.set(base,key);return key;
 }
}
