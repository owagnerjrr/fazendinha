import type {Definition} from './studio-schema';
import{imageAsset,type MediaRef}from'./studio-assets-client';
// Original parametric pixel art. Imported sheets can override it without changing behavior.
export function drawStudioAnimal(c:CanvasRenderingContext2D,d:Definition,x:number,y:number,row:number,frame:number,action='idle'){
 const spec=d.data.sprite as (MediaRef&{frameWidth:number;frameHeight:number;frames:number;scale?:number;offsetX?:number;offsetY?:number})|undefined,image=imageAsset(spec);if(image&&spec){const scale=spec.scale??1,w=spec.frameWidth*scale,h=spec.frameHeight*scale;c.drawImage(image,(frame%spec.frames)*spec.frameWidth,row*spec.frameHeight,spec.frameWidth,spec.frameHeight,Math.round(x-w/2+(spec.offsetX??0)),Math.round(y-h+(spec.offsetY??0)),w,h);return;}
 c.save();c.translate(Math.round(x),Math.round(y));if(row===1)c.scale(-1,1);const color=d.color,shape=d.data.shape??'short',step=[0,2,0,-2][frame%4];
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 c.fillStyle='#19382d44';c.fillRect(-12,-3,25,5);
 if(shape==='bird'){r(-8,-19,16,16,'#3e382c');r(-7,-18,14,13,color);r(3,-25,9,10,'#3e382c');r(4,-24,7,8,color);r(11,-20,5,3,'#d8a243');r(8,-22,2,2,'#201f26');r(-5,-3+step,3,4,'#b98b4e');r(4,-3-step,3,4,'#b98b4e');r(-11,-17,6,6,color);}

 else {
 const tint=(factor:number)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(color.slice(i,i+2),16)*factor))).toString(16).padStart(2,'0')).join(''),dark=tint(.58),shade=tint(.8),light=tint(1.2),cream='#d8c6aa',pink='#c88783';
 const band=(rows:number[][],tone:string)=>{for(const[y,x,w,h]of rows)r(x,y,w,h,tone);};
 if(row===0||row===3){
 band([[-24,-7,14,2],[-22,-10,20,3],[-19,-12,24,11],[-8,-10,20,4],[-4,-7,14,2]],dark);
 band([[-22,-7,14,2],[-20,-9,18,11],[-9,-8,16,4]],color);r(-8,-18,4,8,light);r(7,-17,3,10,shade);r(-5,-7,10,4,cream);
 for(const[x,shift]of [[-8,step],[3,-step]]){r(x,-5+shift,6,5,dark);r(x+1,-5+shift,5,3,light);r(x+1,-2+shift,4,1,cream);}
 const ears=shape==='long'?16:6;
 for(const[x,lean]of [[-8,-1],[3,1]]){r(x+lean,-31-ears,3,2,dark);r(x-1,-29-ears,6,ears+7,dark);r(x,-29-ears,4,ears+5,color);r(x+1,-27-ears,2,ears,pink);r(x+1,-29-ears,2,2,light);}
 band([[-30,-5,10,2],[-28,-9,18,3],[-25,-10,20,10],[-15,-7,14,3]],dark);band([[-28,-5,10,2],[-26,-8,16,10],[-16,-5,10,3]],color);r(-7,-25,4,6,light);r(6,-24,2,8,shade);
 if(row===0){r(-8,-18,7,4,cream);r(1,-18,7,4,cream);for(const x of[-6,4]){r(x,-23,3,4,'#292b28');r(x,-23,1,1,'#eeebd6');}r(-2,-18,4,2,pink);r(-1,-16,2,3,dark);r(-4,-14,3,1,dark);r(1,-14,3,1,dark);r(-12,-17,5,1,cream);r(7,-17,5,1,cream);if(action==='pet'){r(-6,-23,3,4,color);r(4,-23,3,4,color);r(-6,-21,3,1,dark);r(4,-21,3,1,dark);}}
 else {r(-4,-10,8,7,dark);r(-3,-11,6,6,cream);r(-2,-10,3,2,'#ece1c8');}
 }else{
 band([[-23,-7,14,2],[-21,-11,23,3],[-18,-13,27,10],[-8,-11,24,4],[-4,-7,17,2]],dark);
 band([[-21,-6,13,2],[-19,-10,22,10],[-9,-9,20,4]],color);r(-9,-18,6,7,light);r(-10,-8,8,3,shade);r(0,-8,11,3,cream);
 r(-11,-5+step,8,5,dark);r(-10,-5+step,8,3,color);r(-8,-3+step,6,2,cream);r(7,-6-step,5,7,dark);r(8,-6-step,3,6,light);r(11,-4-step,4,4,cream);
 r(-17,-14,6,6,dark);r(-17,-15,5,5,cream);r(-16,-15,3,2,'#ece1c8');
 const ears=shape==='long'?16:6;r(4,-32-ears,4,2,dark);r(2,-30-ears,6,ears+7,dark);r(3,-29-ears,4,ears+5,color);r(4,-27-ears,2,ears,pink);r(12,-30-ears,3,2,dark);r(10,-28-ears,6,ears+5,dark);r(11,-27-ears,4,ears+4,light);r(12,-25-ears,2,ears,pink);
 band([[-30,6,7,2],[-28,3,14,3],[-25,1,18,9],[-16,5,13,3]],dark);band([[-28,6,7,2],[-26,3,14,9],[-17,6,11,3]],color);r(4,-25,4,6,light);r(13,-19,6,4,cream);r(18,-18,3,2,pink);r(13,-23,3,3,'#252a26');r(13,-23,1,1,'#f8efdb');r(17,-14,3,1,dark);r(17,-16,6,1,cream);if(action==='pet'){r(13,-23,3,3,color);r(12,-22,4,1,dark);}
 }
 }
 if(action==='play'){r(21,-4,7,7,'#bd7046');r(22,-4,3,2,'#f6d98d');}if(action==='pet'){r(-3,-47,3,3,'#e8a084');r(2,-47,3,3,'#e8a084');r(-2,-44,6,3,'#e8a084');r(0,-41,2,2,'#e8a084');}c.restore();
}
export function animalSheet(d:Definition,action='idle'){const cv=document.createElement('canvas');cv.width=96*4;cv.height=112*4;const c=cv.getContext('2d')!;for(let row=0;row<4;row++)for(let f=0;f<4;f++)drawStudioAnimal(c,d,f*96+48,row*112+109,row,f,action);return cv;}
