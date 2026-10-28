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
export function dogArt(scene:Phaser.Scene){
 for(const mode of ['walk','rest']){const name=`dog-${mode}-solid`;if(scene.textures.exists(name))continue;const texture=scene.textures.get(`dog-${mode}`),source=texture.getSourceImage() as HTMLImageElement;const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;
  for(let row=0;row<source.height/48;row++)for(let col=0;col<4;col++){
   c.clearRect(col*48,row*48,48,48);c.drawImage(source,col*48,row*48,48,48,col*48,row*48,48,48);const frame=c.getImageData(col*48,row*48,48,48);frame.data.set(cleanDogPixels(frame.data,48,48));c.putImageData(frame,col*48,row*48);
  }
  const atlas=scene.textures.addCanvas(name,canvas)!;for(let i=0;i<(source.width/48)*(source.height/48);i++)atlas.add(i,0,(i%4)*48,Math.floor(i/4)*48,48,48);
 }
}
