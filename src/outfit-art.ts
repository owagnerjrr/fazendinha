import headBounds from './avatar-heads.json';
import {SHIRT_COLORS} from './content';
import type {Avatar} from './content';import type {HeadAttachment} from './avatar-attachment';
const rgb=(s:string)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const PALETTE={adventure:{cloth:'#438753',sleeve:'#ded1a1',legs:'#6c543b',boots:'#65402b'},space:{cloth:'#df8b35',sleeve:'#b66a28',legs:'#294c58',boots:'#614535'},gardener:{cloth:'#376fa4',sleeve:'#b84440',legs:'#376fa4',boots:'#674638'}};
/** Garment masks are evaluated on the original frame, preserving skin, tools and silhouette. */
export function outfitPixels(out:Uint8ClampedArray,original:Uint8ClampedArray,w:number,h:number,a:Avatar,neck:HeadAttachment,row:number){
 if(!a.outfit)return;const palette=PALETTE[a.outfit];if(!palette)return;const foot=h===64?62:100,hip=neck.y+12;
 for(let y=neck.y;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(original[i+3]<180||out[i+3]<180||Math.abs(x-neck.x)>22)continue;const r=original[i],g=original[i+1],b=original[i+2];const green=g>r*1.08&&g>b*1.1,cream=r>225&&g>=225&&b>155,boot=y>=foot-14&&r>55&&r>g*1.4&&b<g*1.25&&Math.abs(x-neck.x)<17;
  let tone:string|undefined,light=1;
  if(green){tone=y>hip+(a.outfit==='adventure'?4:2)?palette.legs:palette.cloth;light=Math.max(.5,Math.min(1.25,(r+g+b)/180));}
  else if(cream&&y<foot-15){tone=palette.sleeve;light=Math.max(.7,Math.min(1.1,(r+g+b)/660));}
  else if(boot){tone=palette.boots;light=Math.max(.42,Math.min(1.15,(r+g+b)/210));}
  if(a.outfit==='space'&&y<neck.y+7&&Math.abs(x-neck.x)>=7&&Math.abs(x-neck.x)<16){tone=y<neck.y+2?'#ffe0a0':Math.abs(x-neck.x)>13?'#83532d':'#eaaa4a';light=1;}
  if(!tone)continue;
  let color=rgb(tone);if(green&&y>=hip-1&&y<=hip&&a.outfit!=='space')color=rgb(Math.abs(x-neck.x)<2&&row===0?'#e6b957':'#4f352a');
  if(green&&a.outfit==='adventure'&&y<hip-1&&Math.abs(x-neck.x-(row===2?-1:1)*Math.round((y-neck.y)/2-3))<1)color=rgb('#795338');
  if(green&&a.outfit==='space'&&y>=neck.y+3&&y<=neck.y+7&&Math.abs(x-neck.x)<4)color=rgb(y===neck.y+5?'#8ce4cd':'#344d57');
  if(green&&a.outfit==='gardener'&&y<neck.y+5&&Math.abs(x-neck.x)>5)color=rgb(palette.sleeve);
  if(green&&a.outfit==='gardener'&&row===0&&y===neck.y+5&&[neck.x-5,neck.x+5].includes(x))color=rgb('#edc76a');
  for(let c=0;c<3;c++)out[i+c]=Math.min(255,Math.round(color[c]*light));
 }
}
export function drawOutfitCap(c:CanvasRenderingContext2D,a:Avatar,row:number,neck:HeadAttachment){
 if(a.outfit!=='gardener'||a.style==='hood')return;
 const views=headBounds[a.style as keyof typeof headBounds],box=views?.[row];const headTop=box?neck.y+3-Math.round((box.neckY-box.y)*.16):neck.y-29;
 const x=neck.x,y=headTop+9;c.save();
 // A full stepped cap silhouette, with room for curls, braids and ponytails around it.
 c.fillStyle='#542b30';c.fillRect(x-9,y-9,18,3);c.fillRect(x-12,y-6,24,9);
 c.fillStyle='#542b30';c.fillRect(x-10,y-7,20,8);c.fillStyle='#b84643';c.fillRect(x-8,y-8,16,7);c.fillStyle='#d96451';c.fillRect(x-5,y-8,9,2);c.fillStyle='#873139';c.fillRect(x-11+(row===1?-3:row===2?3:0),y-1,22,3);if(a.style==='classic'){c.fillStyle='#873139';c.fillRect(x-22,headTop+14,44,3);c.fillStyle='#b84643';c.fillRect(x-18,headTop+11,36,3);}
 if(row===0){c.fillStyle='#f2dcac';c.fillRect(x-1,y-5,3,3);}c.restore();
}

export function outfitSleeveColor(a:Avatar){return a.outfit?PALETTE[a.outfit]?.sleeve??SHIRT_COLORS[a.shirt]:SHIRT_COLORS[a.shirt];}
