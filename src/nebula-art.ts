/** Original pixel armour, anchored to the existing body and tool frames. */
import type{HeadAttachment}from'./avatar-attachment';
const C={line:'#231d32',dark:'#44304f',purple:'#754485',mid:'#a066af',light:'#d698ce',shine:'#f4c9df',red:'#b33a3d',redLight:'#ef7255',redDark:'#75263c',gold:'#d9a25a',mint:'#c1ffc2',green:'#4baf89',deepGreen:'#285952'};
/** Narrow only the walking torso; action/tool frames retain their original tool pixels. */
export function slimNebulaWaist(p:Uint8ClampedArray,w:number,h:number,n:HeadAttachment){
 const source=p.slice();
 for(let y=n.y+6;y<Math.min(h,n.y+16);y++){
  const width=y<n.y+8||y>=n.y+15?15:13,left=Math.round(n.x-width/2);
  for(let x=n.x-8;x<n.x+8;x++)if(x>=0&&x<w)p.fill(0,(y*w+x)*4,(y*w+x)*4+4);
  for(let x=0;x<width;x++){const target=left+x,sx=n.x-8+Math.min(15,Math.floor(x*16/width));if(target<0||target>=w||sx<0||sx>=w)continue;p.set(source.subarray((y*w+sx)*4,(y*w+sx)*4+4),(y*w+target)*4);}
 }
}
export function drawNebulaArmor(c:CanvasRenderingContext2D,row:number,n:HeadAttachment,source?:{pixels:Uint8ClampedArray;width:number;height:number}){
 c.save();c.translate(n.x,n.y);c.imageSmoothingEnabled=false;
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 // Plated torso replaces the noisy cloth highlights, without moving either hip or legs.
 const profile=row===1||row===2,tx=row===1?-1:row===2?1:0;
 if(!profile){
  r(-6,-1,12,1,C.line);r(-8,0,16,6,C.line);r(-6,6,12,1,C.line);r(-5,7,10,3,C.line);
  r(-6,0,12,2,row===3?C.purple:C.redLight);r(-7,2,14,4,row===3?C.dark:C.red);r(-4,6,8,2,row===3?C.purple:C.redDark);
  if(row===0){r(-5,2,4,2,C.redLight);r(1,3,4,2,C.redDark);r(-3,5,6,1,C.gold);r(-2,7,4,1,C.line);}
  else{r(-4,1,8,7,C.line);r(-3,2,6,5,C.mid);r(-2,3,4,1,C.light);r(-2,5,4,1,C.dark);r(-2,7,4,2,C.deepGreen);r(-1,7,2,1,C.mint);}
  r(-3,9,7,5,C.line);r(-2,9,5,4,C.gold);r(-2,10,5,1,'#f0c47c');r(-1,12,3,1,'#996137');r(-5,14,11,2,C.line);r(-4,14,9,1,C.purple);r(-2,14,4,2,C.mid);
 }else{
  r(tx-6,0,12,5,C.line);r(tx-4,5,8,2,C.line);r(tx-5,1,10,4,C.red);r(tx-4,1,4,2,C.redLight);r(tx-3,5,6,2,C.redDark);
  r(tx-3,8,6,6,C.line);r(tx-2,8,4,5,C.gold);r(tx-2,9,3,1,'#f0c47c');r(tx-4,14,8,2,C.dark);
 }
 // Rounded dome, chamfered jaw and an angular illuminated visor.
 r(-4,-24,8,1,C.line);r(-7,-23,14,2,C.line);r(-9,-21,18,3,C.line);r(-10,-18,20,8,C.line);r(-9,-10,18,3,C.line);r(-7,-7,14,3,C.line);r(-4,-4,8,3,C.line);
 r(-4,-23,8,1,C.redLight);r(-6,-22,12,2,C.redLight);r(-8,-20,16,3,C.red);r(-9,-17,18,7,C.red);r(-7,-10,14,4,C.redDark);r(-4,-6,8,3,C.dark);
 r(-4,-22,4,1,'#ffc491');r(-7,-19,2,3,C.redLight);r(-8,-16,1,3,'#e35b4a');r(7,-18,2,8,C.redDark);r(6,-19,1,3,C.redDark);r(-1,-22,2,3,C.red);
 if(row===0){
  r(-7,-16,14,1,C.line);r(-8,-15,16,3,C.deepGreen);r(-7,-15,14,2,C.green);r(-6,-15,5,1,C.mint);r(1,-15,5,1,C.mint);r(-5,-13,10,2,C.green);r(-3,-11,6,1,C.mint);r(-2,-10,4,1,C.deepGreen);
  r(-7,-9,2,3,C.redLight);r(5,-9,2,3,C.red);r(-3,-6,6,1,C.redDark);r(-1,-5,2,1,C.gold);r(-10,-14,2,5,C.purple);r(8,-14,2,5,C.purple);
 }else if(row===1||row===2){
  const s=row===1?-1:1;
  r(s===1?4:-10,-16,6,7,C.line);r(s===1?5:-10,-15,5,4,C.green);r(s===1?7:-10,-15,3,2,C.mint);r(s===1?7:-10,-11,3,1,C.deepGreen);
  r(s===1?-7:4,-15,4,6,C.dark);r(s===1?-6:5,-14,2,3,C.purple);r(s===1?-6:5,-14,1,1,C.gold);r(s===1?5:-7,-8,2,2,C.redLight);
 }else{
  r(-6,-19,12,10,C.redDark);r(-4,-20,8,9,C.red);r(-2,-20,4,5,C.redLight);r(-7,-11,3,4,C.purple);r(4,-11,3,4,C.dark);r(-4,-7,8,2,C.line);r(-3,-6,6,1,C.gold);r(-1,-9,2,1,C.redLight);
 }
 // Separate stepped shoulder plates. Profile view exposes the near shoulder.
 const pads=row===1?[-1]:row===2?[1]:[-10,10];
 for(const x of pads){
  c.save();c.translate(0,-3);
  // Slightly smaller dome; profile anchors sit over the upper arm, not in front of the chest.
  r(x-3,-7,6,1,C.line);r(x-5,-6,10,2,C.line);r(x-7,-4,14,2,C.line);r(x-8,-2,16,6,C.line);r(x-7,4,14,2,C.line);r(x-5,6,10,1,C.line);r(x-3,7,6,1,C.line);
  r(x-3,-6,6,1,C.light);r(x-4,-5,8,2,C.mid);r(x-6,-3,12,3,C.purple);r(x-7,0,14,4,C.purple);r(x-6,-1,2,3,C.mid);r(x+5,-2,2,5,C.dark);r(x-5,4,10,2,C.dark);r(x-3,6,6,1,C.purple);
  r(x-3,-4,4,1,C.light);r(x-2,-5,2,1,C.shine);r(x-5,-2,3,2,C.mid);r(x-4,-1,2,1,C.light);r(x+1,-3,3,3,C.gold);r(x+2,-3,1,1,'#ffe4a7');r(x+1,0,2,1,'#a36d44');r(x-4,3,2,1,C.mid);
  c.restore();
 }
 if(source){for(const side of[-1,1]){let x=0,y=0,count=0;const{pixels:p,width:w,height:h}=source,foot=h===64?62:100;for(let py=n.y+5;py<foot-11;py++)for(let px=Math.max(0,n.x-21);px<Math.min(w,n.x+22);px++){const i=(py*w+px)*4;if((px-n.x)*side>7&&p[i+3]>180&&p[i]>225&&p[i+1]>115&&p[i+1]<225&&p[i]-p[i+1]>25&&p[i+1]-p[i+2]>25){x+=px;y+=py;count++;}}if(count<2)continue;const gx=Math.round(x/count)-n.x,gy=Math.round(y/count)-n.y,cannon=side===(row===3?1:-1);r(gx-3,gy-5,6,8,C.line);if(cannon){r(gx-4,gy-5,8,8,C.line);r(gx-3,gy-4,6,7,C.deepGreen);r(gx-2,gy-4,4,5,C.green);r(gx-2,gy-4,2,3,'#9bcdb0');r(gx-3,gy-1,6,1,C.deepGreen);r(gx-2,gy+2,4,1,C.line);r(gx-1,gy+2,2,1,C.green);}else{r(gx-2,gy-4,4,6,C.purple);r(gx-2,gy-4,2,3,C.light);r(gx-2,gy+1,4,2,C.dark);r(gx-2,gy-1,4,1,C.mid);}}}
 // Knee plates follow each leg's actual source pixels, preserving its walking silhouette.
 if(source){const{pixels:p,width:w,height:h}=source,foot=h===64?62:100;
  for(const side of[-1,1]){let top=foot,bottom=0;const points:{x:number;y:number}[]=[];
   for(let y=n.y+16;y<foot;y++)for(let x=Math.max(0,n.x-14);x<Math.min(w,n.x+15);x++){const i=(y*w+x)*4;if((x-n.x)*side<=0||p[i+3]<180||p[i]<35||p[i]<p[i+1]*1.12)continue;points.push({x,y});top=Math.min(top,y);bottom=Math.max(bottom,y);}
   if(bottom-top<4)continue;const ky=Math.round(top+(bottom-top)*.4),band=points.filter(v=>Math.abs(v.y-ky)<=1);if(!band.length)continue;const kx=Math.round(band.reduce((sum,v)=>sum+v.x,0)/band.length);
   for(let dy=0;dy<3;dy++)for(let dx=-2;dx<=2;dx++){const px=kx+dx,py=ky+dy;if(px<0||px>=w||py>=h||p[(py*w+px)*4+3]<180)continue;r(px-n.x,py-n.y,1,1,dy===0?(dx<1?C.light:C.mid):dy===2?C.dark:dx===-2?C.mid:C.purple);}
  }
 }
 c.restore();
}
