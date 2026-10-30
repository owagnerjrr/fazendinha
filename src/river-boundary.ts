import type {Point,Obstacle} from './pathfinding.js';
/** Same bank formula as the original terrain; the feet stay on grass or dock planks. */
export const DOCK={left:1208,right:1422,top:814,bottom:876};
export const riverBank=(y:number)=>1280+Math.floor(Math.sin(Math.floor(y/8)*8/190)*4)*8-14;
export function riverWalkable(p:Point){return Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.x<=riverBank(p.y)||(p.x>=DOCK.left&&p.x<=DOCK.right&&p.y>=DOCK.top&&p.y<=DOCK.bottom));}
export function safeRiverPosition(p:Point):Point{
 if(riverWalkable(p))return{x:p.x,y:p.y};
 const bank={x:riverBank(p.y)-10,y:p.y},dock={x:Math.max(DOCK.left+10,Math.min(DOCK.right-10,p.x)),y:Math.max(DOCK.top+18,Math.min(DOCK.bottom-8,p.y))};
 return Math.hypot(p.x-dock.x,p.y-dock.y)<Math.hypot(p.x-bank.x,p.y-bank.y)?dock:bank;
}
export function riverObstacles():Obstacle[]{const result:Obstacle[]=[];const cuts=[160,...Array.from({length:118},(_,i)=>168+i*8),DOCK.top,DOCK.bottom,1104].sort((a,b)=>a-b);for(let i=0;i<cuts.length-1;i++){const y=cuts[i],height=cuts[i+1]-y;if(!height)continue;const x=y>=DOCK.top&&y<DOCK.bottom?DOCK.right:riverBank(y),last=result.at(-1);if(last&&last.x===x&&last.y+last.height===y)last.height+=height;else result.push({x,y,width:1600-x,height});}return result;}
