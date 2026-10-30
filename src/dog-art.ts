import type Phaser from 'phaser';
/** Remove faint atlas fringes and isolated pixels; keep a single opaque silhouette per frame. */
export function cleanDogPixels(source:Uint8ClampedArray,width:number,height:number){
 const out=source.slice(),seen=new Uint8Array(width*height);let largest:number[]=[];
 for(let i=0;i<seen.length;i++){if(seen[i]||source[i*4+3]<200)continue;const component=[i];seen[i]=1;
  for(let n=0;n<component.length;n++){const p=component[n],x=p%width,y=Math.floor(p/width);for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){const nx=x+dx,ny=y+dy,j=ny*width+nx;if(nx>=0&&nx<width&&ny>=0&&ny<height&&!seen[j]&&source[j*4+3]>=200){seen[j]=1;component.push(j);}}}
  if(component.length>largest.length)largest=component;
 }
 const keep=new Set(largest);for(let i=0;i<seen.length;i++)out[i*4+3]=keep.has(i)?255:0;return out;
}
/** Stable silhouette: animate only the paws of one authored pose per direction. */
export function dogWalkPixels(pose:Uint8ClampedArray,width:number,height:number,phase:number,facing=0){
 const clean=cleanDogPixels(pose,width,height),out=new Uint8ClampedArray(clean.length),split=Math.floor(height*.74);
 if(facing===1||facing===2){
  // Keep the torso fixed; opposite front/rear strides must survive the game's ~0.7 scale.
  out.set(clean.subarray(0,split*width*4));const reach=height-1-split;
  for(let group=0;group<2;group++){
   const beat=(phase+group*2)%4,stride=[-3,0,3,0][beat],lift=beat===1?3:0;
   for(let y=split;y<height;y++){
    const sy=Math.round(split+(y-split)/(1-lift/reach));if(sy>=height)continue;
    const shift=Math.round(stride*(sy-split)/reach);
    for(let x=0;x<width;x++){const sx=x-shift;if(sx<group*width/2||sx>=(group+1)*width/2)continue;
     const from=(sy*width+sx)*4;if(clean[from+3])out.set(clean.subarray(from,from+4),(y*width+x)*4);
    }
   }
  }
  return out;
 }
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;if(!clean[i+3])continue;
  const leg=Math.min(3,Math.floor(x/(width/4))),lift=y>=split&&((phase+leg)%4===1)?1:0,dy=y-lift;
  out.set(clean.subarray(i,i+4),(dy*width+x)*4);
 }
 return out;
}
/** Every pose owns a texture: no neighbouring atlas region can enter the rendered quad. */
export const DOG_WALK_TEXTURE='dog-walk-single-v3';
export const DOG_REST_TEXTURE='dog-rest-single-v2';
export function dogTexture(walking:boolean,frame:number){return `${walking?DOG_WALK_TEXTURE:DOG_REST_TEXTURE}-${frame}`;}
/** Align the opaque silhouette to one shared centre and ground line without resampling. */
export function anchorDogPixels(source:Uint8ClampedArray,width:number,height:number){
 const pixels=cleanDogPixels(source,width,height),out=new Uint8ClampedArray(pixels.length);let min=width,max=-1,bottom=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]){min=Math.min(min,x);max=Math.max(max,x);bottom=Math.max(bottom,y);}
 if(bottom<0)return out;const dx=Math.floor((width-1-min-max)/2),dy=height-2-bottom;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,nx=x+dx,ny=y+dy;if(pixels[i+3]&&nx>=0&&nx<width&&ny>=0&&ny<height)out.set(pixels.subarray(i,i+4),(ny*width+nx)*4);}
 return out;
}
export function dogArt(scene:Phaser.Scene){
 const size=48;
 for(const mode of ['walk','rest'] as const){
  const source=scene.textures.get(`dog-${mode}`).getSourceImage() as HTMLImageElement,rows=mode==='walk'?4:2;
  if(scene.textures.exists(dogTexture(mode==='walk',rows*4-1)))continue;
  const sample=document.createElement('canvas');sample.width=size;sample.height=size;const b=sample.getContext('2d')!;b.imageSmoothingEnabled=false;
  for(let row=0;row<rows;row++)for(let col=0;col<4;col++){
   const key=dogTexture(mode==='walk',row*4+col);if(scene.textures.exists(key))continue;
   b.clearRect(0,0,size,size);b.drawImage(source,(mode==='walk'?0:col)*size,row*size,size,size,0,0,size,size);
   const frame=b.getImageData(0,0,size,size),anchored=anchorDogPixels(frame.data,size,size);frame.data.set(mode==='walk'?dogWalkPixels(anchored,size,size,col,row):anchored);
   const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;canvas.getContext('2d')!.putImageData(frame,0,0);
   scene.textures.addCanvas(key,canvas)!.setFilter(1);
  }
 }
}
