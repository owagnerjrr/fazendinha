import type{Point}from'./pathfinding.js';
export const BED_CAPACITY=2,BED_ARRIVE_MS=7000,BED_SETTLED_MS=11000,BED_ADVANCE_MS=14500,BED_DEPART_MS=8000;
export type BedSleep={sequence?:1;startedAt:number;companions?:string[];origins?:Record<string,Point>;wakeStartedAt?:number};
export function sleepStage(s:BedSleep,now:number){if(s.wakeStartedAt!==undefined)return now-s.wakeStartedAt>=BED_DEPART_MS?'done':'waking';const t=now-s.startedAt;return t<BED_ARRIVE_MS?'arrival':t<BED_SETTLED_MS?'climb':t<BED_ADVANCE_MS?'sleep':'ready';}
export function bedPetSelected(s:BedSleep|undefined,id:string){return s?.sequence===1&&s.companions?.includes(id)===true;}
export function bedSlot(bed:Point,index:number,count:number){return{x:bed.x+(count===1?16:index?16:-16),y:bed.y-25};}
export function bedApproach(bed:Point,index:number){return{x:Math.max(300,Math.min(890,bed.x+(bed.x>790?-64:64))),y:Math.max(255,Math.min(680,bed.y+20+index*36))};}
export const smoothUnit=(t:number)=>{const n=Math.max(0,Math.min(1,t));return n*n*(3-2*n);};
export function alongRoute(points:Point[],fraction:number){if(!points.length)return{x:600,y:680};let total=0;for(let i=1;i<points.length;i++)total+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);let left=total*Math.max(0,Math.min(1,fraction));for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],d=Math.hypot(b.x-a.x,b.y-a.y);if(left<=d){const t=d?left/d:1;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}left-=d;}return{...points.at(-1)!};}
export function routeLength(points:Point[]){return points.reduce((sum,p,i)=>sum+(i?Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y):0),0);}
export const sleepReadyMs=(s:BedSleep)=>s.companions?.length?BED_ADVANCE_MS:4000;
export const sleepExitMs=(s:BedSleep)=>s.companions?.length?BED_DEPART_MS:1800;
