import type {Point} from './pathfinding';
export const CAST_MS=750,CATCH_FLY_MS=900,CATCH_SHOW_MS=3800;
export function castingPose(elapsed:number){const t=Math.max(0,Math.min(1,elapsed/CAST_MS));return{angle:t<.25?-.95-t*4.4:t<.65?-2.05+(t-.25)*3.8:-.53-(t-.65)*1.2,line:Math.max(0,Math.min(1,(t-.3)/.7))};}
export function caughtFishPoint(from:Point,hand:Point,elapsed:number){const t=Math.max(0,Math.min(1,elapsed/CATCH_FLY_MS));return{x:from.x+(hand.x-from.x)*t,y:from.y+(hand.y-from.y)*t-Math.sin(t*Math.PI)*74,rotation:t<1?Math.sin(t*Math.PI)*2:Math.sin(elapsed/170)*.08};}

/** Grip remains close to the body in all four views, with a short balanced rod. */
export function rodCarryPose(p:Point,direction:string,time:number){const side=direction==='left'?-1:1,bob=Math.sin(time/360)*.35;return{side,shoulder:{x:p.x+side*6,y:p.y-29},hand:{x:p.x+side*(direction==='up'?7:11),y:p.y-23+bob},angle:direction==='down'?-.8:direction==='up'?-1.35:-1.12,length:37};}
