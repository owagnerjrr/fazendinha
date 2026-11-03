const STRIDES:Record<string,number>={pig:20,horse:32,bull:28,donkey:28,dog:24,cat:22,rabbit:16};

/** Ground distance per complete step cycle, independent of frame rate. */
export function animalStride(kind:string,growth=1){return (STRIDES[kind]??24)*growth;}
export function animalWalkFrame(distance:number,kind:string,growth=1){return Math.floor(distance/(animalStride(kind,growth)/8))%8;}

/** Bend the complete lower legs from fixed hips, never translate the animal's body.
 * The old toe-only cut left just 2–5 pixels moving after the sprite was scaled.
 * Stance moves backward along the ground; swing lifts and returns each foot. */
export function polishedGait(raw:Uint8ClampedArray,w:number,h:number,frame:number,kind:string,direction:string){
 if(frame===8)return raw.slice();
 const out=raw.slice();let l=w,r=0,t=h,b=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(raw[(y*w+x)*4+3]>150){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 if(l>r)return out;
 const vertical=direction==='down'||direction==='up',span=r-l+1;
 const cut=Math.round(t+(b-t)*(vertical?.77:kind==='horse'||kind==='donkey'?.65:kind==='pig'?.74:.70));
 // Keep muzzles, rear tails and peripheral fur in their original layer.
 const legAt=(x:number)=>{const q=(x-l)/span;if(vertical){const gap=direction==='up'?.10:.04;return q>=.14&&q<.5-gap?0:q>.5+gap&&q<=.86?1:-1;}return q<.14||q>.90?-1:Math.min(3,Math.floor((q-.14)/.76*4));};
 const phases=kind==='horse'||kind==='donkey'?[0,.5,.25,.75]:[0,.5,.5,0];
 const height=Math.max(1,b-cut),reach=Math.min(kind==='pig'?9:kind==='rabbit'?10:14,height*.9),lift=Math.min(6,height*.4);
 for(let y=cut;y<=b;y++)for(let x=l;x<=r;x++)if(legAt(x)>=0)out.fill(0,(y*w+x)*4,(y*w+x)*4+4);
 const transform=(x:number,y:number,leg:number)=>{const u=(frame/8+(vertical?leg*.5:phases[leg]))%1,stance=u<.625,step=stance?1-2*u/.625:-1+2*(u-.625)/.375,raise=stance?0:Math.sin((u-.625)/.375*Math.PI),ratio=(y-cut)/height,bend=ratio*ratio;
  return{x:x+Math.round((vertical?(leg?1:-1)*raise*2:step*reach*(direction==='left'?-1:1))*bend),y:y+Math.round((vertical?step*3*(direction==='up'?-1:1):0)*bend-raise*lift*ratio)};};
 for(let y=cut;y<=b;y++)for(let x=l;x<=r;x++){
  const leg=legAt(x),at=(y*w+x)*4;if(leg<0||raw[at+3]<150)continue;
  const a=transform(x,y,leg),next=y<b&&raw[((y+1)*w+x)*4+3]>150?transform(x,y+1,leg):a;
  // Rasterize between adjacent source rows so bending cannot detach a hoof.
  const steps=Math.max(1,Math.abs(next.x-a.x),Math.abs(next.y-a.y));
  for(let n=0;n<=steps;n++){const px=Math.round(a.x+(next.x-a.x)*n/steps),py=Math.round(a.y+(next.y-a.y)*n/steps);if(px>=0&&px<w&&py>=cut&&py<h)for(let k=0;k<4;k++)out[(py*w+px)*4+k]=raw[at+k];}
 }
 return out;
}
