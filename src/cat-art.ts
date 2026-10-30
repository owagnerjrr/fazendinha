import type Phaser from 'phaser';
import type {Animal} from './content';
import coats from './cat-pixels.json';
export const catTexture=(color:Animal['color']='black')=>`cat-${color}`;
/** Original raster art, decoded once so barns never start with a missing texture. */
export function catArt(scene:Phaser.Scene){for(const [color,source]of Object.entries(coats)){
 const key=catTexture(color as Animal['color']);if(scene.textures.exists(key))continue;
 const {width:w,height:h,palette}=source,indices=atob(source.pixels),colors=palette.map(hex=>[0,2,4,6].map(i=>parseInt(hex.slice(i,i+2),16)));
 const base=document.createElement('canvas');base.width=w;base.height=h;const b=base.getContext('2d')!,pixels=b.createImageData(w,h);
 for(let i=0;i<indices.length;i++)pixels.data.set(colors[indices.charCodeAt(i)],i*4);b.putImageData(pixels,0,0);
 const cv=document.createElement('canvas');cv.width=w*8;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;
 // Head and torso keep their silhouette; only lower paws take a short alternating step.
 for(let frame=0;frame<8;frame++){const out=c.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const leg=Math.floor(x/(w/4)),phase=frame*Math.PI/4+(leg%2)*Math.PI,blend=Math.max(0,(y-h*.76)/(h*.24));
  const sx=Math.round(x-Math.sin(phase)*2*blend),sy=y+Math.round(Math.max(0,Math.cos(phase))*blend);
  if(sx<0||sx>=w||sy>=h)continue;const at=(sy*w+sx)*4,to=(y*w+x)*4;for(let k=0;k<4;k++)out.data[to+k]=pixels.data[at+k];
 }c.putImageData(out,frame*w,0);}
 const texture=scene.textures.addCanvas(key,cv)!;for(let i=0;i<8;i++)texture.add(i,0,i*w,0,w,h);
 if(color==='black'&&!scene.textures.exists('life-cat'))scene.textures.addCanvas('life-cat',base);
}}
