import {SHIRT_COLORS,type Avatar} from './content';
// Keep the original body animation; alter only the collar and torso seams.
export function drawModelFeatures(c:CanvasRenderingContext2D,a:Avatar,row:number,cx:number,top:number){
 if(!['crop','short','wavy','cap'].includes(a.style))return;
 c.fillStyle=SHIRT_COLORS[a.shirt];
 if(row===0){c.fillRect(cx-7,top+32,14,2);c.fillStyle='#ded0af';c.fillRect(cx-3,top+31,2,3);c.fillRect(cx+1,top+31,2,3);}
 else if(row===3)c.fillRect(cx-7,top+33,14,1);
 else c.fillRect(cx-4,top+33,8,2);
}
