import {findPath,type Point,type Obstacle} from './pathfinding.js';
export type DogFacing=0|1|2|3;
export function dogFacing(dx:number,dy:number):DogFacing{return Math.abs(dx)>Math.abs(dy)?dx<0?1:2:dy<0?3:0;}
export function dogFrame(facing:DogFacing,distance:number){return facing*4+Math.floor(Math.max(0,distance)/5)%4;}
/** Closed walking loop followed by a real stop: feet animate only during travel. */
export function penDogMotion(time:number,index=0){
 const t=((time+index*2700)%18000+18000)%18000,walking=t<8000;
 const corners=[[-12,0],[12,0],[12,-18],[-12,-18],[-12,0]];
 const leg=walking?Math.floor(t/2000):3,progress=walking?(t%2000)/2000:1;
 const [ax,ay]=corners[leg],[bx,by]=corners[leg+1],facing=dogFacing(bx-ax,by-ay);
 return{x:ax+(bx-ax)*progress,y:ay+(by-ay)*progress,facing,walking,resting:t>=11500,frame:dogFrame(facing,Math.hypot(bx-ax,by-ay)*progress)};
}
/** Route to a free offset beside the owner, never into the owner's collider. */
export function dogFollowRoute(start:Point,owner:Point,index:number,obstacles:Obstacle[]){
 const angle=index*2.1,radius=48+Math.floor(index/6)*24;
 const candidates=Array.from({length:8},(_,i)=>{const a=angle+[0,.7,-.7,1.4,-1.4,2.1,-2.1,Math.PI][i];return{x:owner.x+Math.cos(a)*radius,y:owner.y+Math.sin(a)*radius};});
 for(const target of candidates){const route=findPath(start,target,obstacles);if(route.length)return route;}
 return [];
}
