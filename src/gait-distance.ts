import type{Point}from'./pathfinding.js';
const cache=new Map<string,Float64Array>();
export function ellipseDistance(angle:number,rx:number,ry:number){const key=rx+':'+ry;let table=cache.get(key);if(!table){table=new Float64Array(257);let last:Point={x:0,y:ry/2};for(let i=1;i<=256;i++){const a=i*Math.PI*2/256,p={x:Math.sin(a)*rx,y:Math.cos(a)*ry/2};table[i]=table[i-1]+Math.hypot(p.x-last.x,p.y-last.y);last=p;}cache.set(key,table);}const at=Math.max(0,Math.min(256,angle/(Math.PI*2)*256)),i=Math.min(255,Math.floor(at));return table[i]+(table[i+1]-table[i])*(at-i);}
