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
export function dogWalkPixels(pose:Uint8ClampedArray,width:number,height:number,phase:number){
 const clean=cleanDogPixels(pose,width,height),out=new Uint8ClampedArray(clean.length),split=Math.floor(height*.74);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;if(!clean[i+3])continue;
  const leg=Math.min(3,Math.floor(x/(width/4))),lift=y>=split&&((phase+leg)%4===1)?1:0,dy=y-lift;
  out.set(clean.subarray(i,i+4),(dy*width+x)*4);
 }
 return out;
}
export const DOG_WALK_TEXTURE='dog-walk-stable';
export const DOG_REST_TEXTURE='dog-rest-stable';
export function dogArt(scene:Phaser.Scene){
 const stride=56,pad=4,size=48;
 for(const mode of ['walk','rest'] as const){const name=mode==='walk'?DOG_WALK_TEXTURE:DOG_REST_TEXTURE;if(scene.textures.exists(name))continue;
  const source=scene.textures.get(`dog-${mode}`).getSourceImage() as HTMLImageElement,rows=mode==='walk'?4:2;
  const canvas=document.createElement('canvas');canvas.width=stride*4;canvas.height=stride*rows;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;
  const sample=document.createElement('canvas');sample.width=size;sample.height=size;const b=sample.getContext('2d')!;b.imageSmoothingEnabled=false;
  for(let row=0;row<rows;row++)for(let col=0;col<4;col++){
   b.clearRect(0,0,size,size);b.drawImage(source,(mode==='walk'?0:col)*size,row*size,size,size,0,0,size,size);
   const frame=b.getImageData(0,0,size,size);frame.data.set(mode==='walk'?dogWalkPixels(frame.data,size,size,col):cleanDogPixels(frame.data,size,size));
   c.putImageData(frame,col*stride+pad,row*stride+pad);
  }
  const atlas=scene.textures.addCanvas(name,canvas)!;atlas.setFilter(1);
  for(let i=0;i<4*rows;i++)atlas.add(i,0,(i%4)*stride+pad,Math.floor(i/4)*stride+pad,size,size);
 }
}
