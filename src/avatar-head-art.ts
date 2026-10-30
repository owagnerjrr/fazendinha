import bounds from './avatar-heads.json';
import {HAIR_COLORS,SKIN_TONES,type Avatar} from './content';
import {cleanAvatarPixels} from './avatar-pixels';
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const cache=new Map<string,{canvas:HTMLCanvasElement;x:number;y:number}>();
export function drawPortraitHead(ctx:CanvasRenderingContext2D,atlas:CanvasImageSource,avatar:Avatar,row:number,cx:number,neckY:number){
 if(!Object.hasOwn(bounds,avatar.style))return false;
 const id=`${avatar.style}:${row}:${avatar.skin}:${avatar.hair}`;let head=cache.get(id);
 if(!head){
  const box=bounds[avatar.style as keyof typeof bounds][row],scale=.16,w=Math.round(box.w*scale),h=Math.round(box.h*scale);
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;c.drawImage(atlas,box.x,box.y,box.w,box.h,0,0,w,h);
  const im=c.getImageData(0,0,w,h),p=im.data,skin=rgb(SKIN_TONES[avatar.skin]),hair=rgb(HAIR_COLORS[avatar.hair]);
  for(let i=0;i<p.length;i+=4){if(p[i+3]<180)continue;const r=p[i],g=p[i+1],b=p[i+2];let target:number[]|undefined,light=1;
   if(r>200&&g>100&&b>60&&r>g*1.08&&g>b*1.1){target=skin;light=Math.max(.67,Math.min(1.15,(r+g+b)/550));}
   else if(r>30&&r<180&&g<130&&b<115&&r>g*.95&&r>b*.95){target=hair;light=Math.max(.42,Math.min(1.65,(r+g+b)/165));}
   if(target){p[i]=Math.min(255,target[0]*light);p[i+1]=Math.min(255,target[1]*light);p[i+2]=Math.min(255,target[2]*light);}
  }
  cleanAvatarPixels(p,w,h);c.putImageData(im,0,0);
  head={canvas,x:Math.round((box.neckX-box.x)*w/box.w),y:Math.round((box.neckY-box.y)*h/box.h)};cache.set(id,head);
 }
 ctx.fillStyle=SKIN_TONES[avatar.skin];ctx.fillRect(cx-3,neckY,6,5);ctx.fillRect(cx-4,neckY+3,8,2);ctx.drawImage(head.canvas,Math.round(cx-head.x),Math.round(neckY+2-head.y));return true;
}
