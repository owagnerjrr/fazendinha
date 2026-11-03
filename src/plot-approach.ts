import type{Direction}from'./action-timing';
type Point={x:number;y:number};
export function toolDirection(player:Point,target:Point,fallback:Direction='down'):Direction{const dx=target.x-player.x,dy=target.y-player.y;if(Math.hypot(dx,dy)<.01)return fallback;return Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';}
/** Prefer the player's side of the plot; callers still validate every route against collisions. */
export function plotApproaches(player:Point,target:Point){return [[42,10],[-42,10],[0,45],[0,-45]].map(([x,y])=>({x:target.x+x,y:target.y+y})).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));}
