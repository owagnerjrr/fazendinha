import type{Obstacle}from'./pathfinding';
/** Natural margins only: acquired 10×5 fields and all connecting paths stay intact. */
export const SOUTH_PONDS=[{x:360,y:284,rx:138,ry:43},{x:1200,y:930,rx:142,ry:62}] as const;
export function southWaterAt(x:number,y:number,padding=0){return SOUTH_PONDS.some(p=>((x-p.x)/(p.rx+padding))**2+((y-p.y)/(p.ry+padding))**2<1);}
export const SOUTH_LIGHTS=[{x:600,y:300},{x:930,y:298},{x:555,y:744},{x:1450,y:744}] as const;
export function southNatureObstacles():Obstacle[]{return[{x:549,y:293,width:66,height:16},...SOUTH_LIGHTS.map(p=>({x:p.x-4,y:p.y+31,width:8,height:10})),{x:285,y:130,width:150,height:116},...SOUTH_PONDS.flatMap(p=>Array.from({length:8},(_,i)=>{const y=p.y-p.ry+i*p.ry/4,height=p.ry/4,dy=Math.max(0,Math.abs(y+height/2-p.y)-height/2),half=p.rx*Math.sqrt(1-(dy/p.ry)**2);return{x:p.x-half,y,width:half*2,height};}))];}
export function southDuckPose(index:number,time:number){const p=SOUTH_PONDS[index<3?0:1],t=time/15000+index*2.1;return{x:Math.round(p.x+Math.sin(t)*p.rx*.58),y:Math.round(p.y+Math.cos(t)*p.ry*.42+(index%2?6:-6)),left:Math.cos(t)<0,frame:Math.floor(time/180+index)%4};}

export function safeSouthSpawn(p:{x:number;y:number}){return southNatureObstacles().some(o=>p.x>=o.x-12&&p.x<=o.x+o.width+12&&p.y>=o.y-5&&p.y<=o.y+o.height+17)?{x:Math.max(150,Math.min(1450,p.x)),y:p.y<400?360:760}:p;}
