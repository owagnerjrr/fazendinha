import type {Definition} from './studio-schema';
import{imageAsset,type MediaRef}from'./studio-assets-client';
// Original parametric pixel art. Imported sheets can override it without changing behavior.
export function drawStudioAnimal(c:CanvasRenderingContext2D,d:Definition,x:number,y:number,row:number,frame:number,action='idle'){
 const spec=d.data.sprite as (MediaRef&{frameWidth:number;frameHeight:number;frames:number;scale?:number})|undefined,image=imageAsset(spec);if(image&&spec){const scale=spec.scale??1,w=spec.frameWidth*scale,h=spec.frameHeight*scale;c.drawImage(image,(frame%spec.frames)*spec.frameWidth,row*spec.frameHeight,spec.frameWidth,spec.frameHeight,Math.round(x-w/2),Math.round(y-h),w,h);return;}
 c.save();c.translate(Math.round(x),Math.round(y));if(row===1)c.scale(-1,1);const color=d.color,shape=d.data.shape??'short',step=[0,2,0,-2][frame%4];
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 c.fillStyle='#19382d44';c.fillRect(-12,-3,25,5);
 if(shape==='bird'){r(-8,-19,16,16,'#3e382c');r(-7,-18,14,13,color);r(3,-25,9,10,'#3e382c');r(4,-24,7,8,color);r(11,-20,5,3,'#d8a243');r(8,-22,2,2,'#201f26');r(-5,-3+step,3,4,'#b98b4e');r(4,-3-step,3,4,'#b98b4e');r(-11,-17,6,6,color);}
 else if(row===0||row===3){r(-10,-19,20,16,'#3c352e');r(-9,-18,18,14,color);r(-8,-6+step,5,6,'#564738');r(3,-6-step,5,6,'#564738');r(-8,-27,16,13,'#3c352e');r(-7,-26,14,11,color);const ears=shape==='long'?13:5;r(-8,-27-ears,5,ears+4,'#3c352e');r(3,-27-ears,5,ears+4,'#3c352e');r(-7,-26-ears,3,ears,'#d99c91');r(4,-26-ears,3,ears,'#d99c91');if(row===0){r(-5,-22,2,2,'#211e24');r(3,-22,2,2,'#211e24');r(-2,-18,4,2,'#d28e85');if(action==='pet')r(-5,-22,3,1,'#211e24');}else r(-3,-14,6,6,'#e5dbba');}
 else{r(-12,-18,23,14,'#3c352e');r(-11,-17,21,12,color);r(-10,-7+step,5,7,'#514437');r(5,-7-step,5,7,'#514437');r(-4,-6-step,4,6,color);r(10,-7+step,4,6,color);r(3,-27,15,15,'#3c352e');r(4,-26,13,13,color);const ears=shape==='long'?14:6;r(5,-26-ears,5,ears+5,'#3c352e');r(11,-27-ears,5,ears+5,'#3c352e');r(6,-25-ears,3,ears,'#d99c91');r(12,-26-ears,3,ears,'#d99c91');r(13,-21,2,2,'#201e23');r(17,-16,3,3,'#db9a8b');r(-16,-14+(action==='play'?step:0),6,6,'#e2d8b8');if(action==='pet')r(12,-21,4,1,'#201e23');}
 if(action==='play'){r(21,-4,7,7,'#bd7046');r(22,-4,3,2,'#f6d98d');}if(action==='pet'){r(-3,-47,3,3,'#e8a084');r(2,-47,3,3,'#e8a084');r(-2,-44,6,3,'#e8a084');r(0,-41,2,2,'#e8a084');}c.restore();
}
export function animalSheet(d:Definition){const cv=document.createElement('canvas');cv.width=96*4;cv.height=112*4;const c=cv.getContext('2d')!;for(let row=0;row<4;row++)for(let f=0;f<4;f++)drawStudioAnimal(c,d,f*96+48,row*112+109,row,f);return cv;}
