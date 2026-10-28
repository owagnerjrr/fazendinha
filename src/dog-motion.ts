import {findPath,type Point,type Obstacle} from './pathfinding.js';
export type DogFacing=0|1|2|3;
export function dogFacing(dx:number,dy:number):DogFacing{return Math.abs(dx)>Math.abs(dy)?dx<0?1:2:dy<0?3:0;}
export function dogFrame(facing:DogFacing,distance:number){return facing*4+Math.floor(Math.max(0,distance)/5)%4;}
/** Closed walking loop followed by a real stop: feet animate only during travel. */
export function penDogMotion(time:number,index=0){
 const t=((time+index*2700)%18000+18000)%18000,walking=t<8000;
 const s=walking?t/8000:1,progress=s*s*(3-2*s),angle=progress*Math.PI*2;
 const x=12*Math.sin(angle),y=-9+9*Math.cos(angle),facing=dogFacing(12*Math.cos(angle),-9*Math.sin(angle));
 return{x,y,facing,walking,resting:t>=11500,frame:dogFrame(facing,progress*67)};
}
/** Route to a free offset beside the owner, never into the owner's collider. */
export function dogFollowRoute(start:Point,owner:Point,index:number,obstacles:Obstacle[]){
 const angle=index*2.1,radius=48+Math.floor(index/6)*24;
 const candidates=Array.from({length:8},(_,i)=>{const a=angle+[0,.7,-.7,1.4,-1.4,2.1,-2.1,Math.PI][i];return{x:owner.x+Math.cos(a)*radius,y:owner.y+Math.sin(a)*radius};});
 for(const target of candidates){const route=findPath(start,target,obstacles);if(route.length)return route;}
 return [];
}
