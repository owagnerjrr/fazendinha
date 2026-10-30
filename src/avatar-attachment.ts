export type HeadAttachment={x:number;y:number};
const shirt=(r:number,g:number,b:number)=>g>r*1.08&&g>b*1.1;
/** Register the neck on the torso, never on the tilted brim or a wooden tool. */
export function headAttachment(p:Uint8ClampedArray,w:number,h:number,top:number,hatX:number):HeadAttachment{
 let y=Math.min(h-1,top+29);
 for(let row=Math.max(0,top+25);row<Math.min(h-12,top+42);row++){
  let count=0;for(let x=Math.max(0,Math.round(w/2)-17);x<Math.min(w,w/2+17);x++){const i=(row*w+x)*4;if(p[i+3]>180&&shirt(p[i],p[i+1],p[i+2]))count++;}
  if(count>=2){y=row;break;}
 }
 let sum=0,count=0;
 for(const row of [y,y-1]){for(let x=Math.max(0,Math.round(w/2)-7);x<Math.min(w,w/2+7);x++){const i=(row*w+x)*4;const r=p[i],g=p[i+1],b=p[i+2];if(p[i+3]>180&&r>225&&g>115&&g<225&&r-g>25&&g-b>25){sum+=x;count++;}}if(count)break;}
 return{x:count?Math.round(sum/count):Math.round(Math.max(w/2-5,Math.min(w/2+5,hatX))),y};
}
/** Remove the old head only; arms, shoulders, clothing and foreground tools stay intact. */
export function eraseNativeHead(p:Uint8ClampedArray,w:number,h:number,top:number,hatX:number,neckY:number,_row:number){
 for(let y=Math.max(0,top-3);y<Math.min(h,neckY);y++){
  const half=25;
  for(let x=Math.max(0,Math.round(hatX-half));x<Math.min(w,hatX+half+1);x++)p[(y*w+x)*4+3]=0;
 }
}
/** Peach skin excludes cream fabric, wood, boots and outlines. */
export function nativeSkin(r:number,g:number,b:number){return r>225&&g>115&&g<225&&r-g>25&&g-b>25;}
/** Find the green hat band first so raised wooden tools cannot become the head's center. */
export function nativeHeadRegion(p:Uint8ClampedArray,w:number,h:number,fallback:{x:number;top:number}){
 let band=-1,left=w,right=-1;
 for(let y=0;y<h*.65;y++){
  const xs:number[]=[];for(let x=Math.max(0,w/2-24);x<Math.min(w,w/2+24);x++){const i=(y*w+x)*4;if(p[i+3]>180&&shirt(p[i],p[i+1],p[i+2]))xs.push(x);}
  if(xs.length>=2){band=y;break;}
 }
 if(band<0)return fallback;
 for(let y=band;y<Math.min(h,band+7);y++)for(let x=Math.max(0,w/2-24);x<Math.min(w,w/2+24);x++){const i=(y*w+x)*4;if(p[i+3]>180&&shirt(p[i],p[i+1],p[i+2])){left=Math.min(left,x);right=Math.max(right,x);}}
 const center=Math.round((left+right)/2);let top=band;
 for(let y=Math.max(0,band-12);y<=band;y++)for(let x=Math.max(0,center-11);x<Math.min(w,center+12);x++){const i=(y*w+x)*4,r=p[i],g=p[i+1],b=p[i+2];if(p[i+3]>180&&r>145&&g>95&&r>g*1.08&&b<g*.8)top=Math.min(top,y);}
 return{x:center,top};
}
// Authored occlusion contours for the native raised-hoe frame. These limbs and the
// handle pass in front of the head, unlike the torso which remains behind the collar.
const RAISED_FOREGROUND=[
 [[26,37],[30,38],[37,53],[39,62],[40,69],[45,74],[41,78],[33,70],[30,58]],
 [[59,36],[62,39],[52,55],[51,61],[46,68],[43,74],[39,76],[36,73],[39,66],[43,58],[46,52],[57,39]],
 [[27,37],[30,38],[45,53],[47,61],[53,69],[55,74],[51,77],[47,74],[42,67],[38,61],[38,55]],
 [[66,37],[69,40],[64,54],[62,65],[57,72],[52,77],[49,73],[56,65],[59,54]],
] as const;
function inside(x:number,y:number,points:readonly(readonly number[])[]){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function restoreRaisedTool(out:Uint8ClampedArray,source:Uint8ClampedArray,w:number,h:number,base:string,row:number,col:number,skin:number[],neckY=h){
 if(base!=='hoe-actions'||col!==1)return;
 const polygons:readonly(readonly(readonly number[])[])[]=row===3?[RAISED_FOREGROUND[row],[[32,65],[36,65],[40,75],[36,77],[32,71]]]:[RAISED_FOREGROUND[row]];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(source[i+3]<180||!polygons.some(p=>inside(x+.5,y+.5,p)))continue;out.set(source.subarray(i,i+4),i);const r=source[i],g=source[i+1],b=source[i+2];if(y<neckY&&nativeSkin(r,g,b)){const light=Math.max(.5,Math.min(1.15,(r+g+b)/565));for(let c=0;c<3;c++)out[i+c]=Math.min(255,skin[c]*light);}}
}

/** Back-facing heads follow the spine rather than alternating shoulder skin highlights. */
export function alignHeadToSpine(neck:HeadAttachment,w:number,row:number):HeadAttachment{return row===3?{x:w/2,y:neck.y}:neck;}
