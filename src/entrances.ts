import type {Point} from './pathfinding.js';
export const ENTRANCES=[
 {id:'house',name:'Casa',x:408,y:466,hit:{left:285,top:265,right:525,bottom:460}},
 {id:'shop',name:'Venda',x:1030,y:406,hit:{left:930,top:245,right:1130,bottom:410}},
 {id:'barn',name:'Celeiro',x:1050,y:814,hit:{left:960,top:620,right:1140,bottom:820}},
] as const;
export type Entrance=typeof ENTRANCES[number];
export function nearestEntrance(point:Point,reach=85):Entrance|undefined{return ENTRANCES.filter(e=>Math.hypot(e.x-point.x,e.y-point.y)<reach).sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0];}
export function entranceAt(point:Point){return ENTRANCES.find(e=>point.x>e.hit.left&&point.x<e.hit.right&&point.y>e.hit.top&&point.y<e.hit.bottom);}
export function entranceUnlocked(now:number,lockedUntil:number,inside:boolean,modal:boolean,working:boolean){return now>=lockedUntil&&!inside&&!modal&&!working;}

/** Enter only at a narrow front doorstep while walking toward the door. */
export class AutoEntrance {
 private held?:Entrance;
 hold(point:Point){this.held=nearestEntrance(point,70);}
 update(point:Point,towardDoor:boolean,enabled:boolean,entries:readonly Entrance[]=ENTRANCES){if(this.held){if(Math.abs(point.x-this.held.x)<36&&Math.abs(point.y-this.held.y)<48)return;this.held=undefined;}if(!enabled)return;const entry=entries.find(e=>Math.abs(point.x-e.x)<=18&&point.y>=e.y-10&&point.y<=e.y+8);if(!entry||!towardDoor)return;this.held=entry;return entry;}
}
