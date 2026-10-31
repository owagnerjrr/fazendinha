import {gaitPixels} from './animal-gait';
import directions from './cat-directions.json';
import type Phaser from 'phaser';
import type {Animal} from './content';
import coats from './cat-pixels.json';
export const catTexture=(color:Animal['color']='black')=>`cat-${color}`;
/** Original raster art, decoded once so barns never start with a missing texture. */
export function catArt(scene:Phaser.Scene){for(const [color,source]of Object.entries({...coats,...Object.fromEntries(Object.entries(directions).map(([key,value])=>['27-'+key,value]))})){
 const key=color.startsWith('27-')?'cat'+color:catTexture(color as Animal['color']);if(scene.textures.exists(key))continue;
 const {width:w,height:h,palette}=source,indices=atob(source.pixels),colors=palette.map(hex=>[0,2,4,6].map(i=>parseInt(hex.slice(i,i+2),16)));
 const base=document.createElement('canvas');base.width=w;base.height=h;const b=base.getContext('2d')!,pixels=b.createImageData(w,h);
 for(let i=0;i<indices.length;i++)pixels.data.set(colors[indices.charCodeAt(i)],i*4);b.putImageData(pixels,0,0);
 const cv=document.createElement('canvas');cv.width=w*9;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;
 // Head and torso keep their silhouette; only lower paws take a short alternating step.
 for(let frame=0;frame<9;frame++){const out=c.createImageData(w,h);out.data.set(frame===8?pixels.data:gaitPixels(pixels.data,w,h,frame,'cat',color.split('-').at(-1)));c.putImageData(out,frame*w,0);}
 const texture=scene.textures.addCanvas(key,cv)!;for(let i=0;i<9;i++)texture.add(i,0,i*w,0,w,h);
 if(color==='black'&&!scene.textures.exists('life-cat'))scene.textures.addCanvas('life-cat',base);
}}
