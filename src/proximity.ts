import type {Point} from './pathfinding.js';
/** Pick only reachable targets, so a small hit range cannot mask a usable object. */
export function closestInReach<T extends Point & {reach?:number;interactionPosition?:()=>Point}>(player:Point,targets:readonly T[],defaultReach:number):T|undefined{
 let closest:T|undefined,best=Infinity;
 for(const target of targets){const point=target.interactionPosition?.()??target;const distance=Math.hypot(player.x-point.x,player.y-point.y);if(distance<(target.reach??defaultReach)&&distance<best){best=distance;closest=target;}}
 return closest;
}
