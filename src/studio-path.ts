import type{Definition}from'./studio-schema';import{mapCells}from'./studio-runtime';
export function studioGridPath(d:Definition,start:{x:number;y:number},goal:{x:number;y:number},occupied:Set<string>=new Set()){
 const w=Number(d.data.width),h=Number(d.data.height),blocked=new Set(mapCells(d).filter(c=>['water','wall','tree','bush','rock'].includes(c.type)).map(c=>c.x+','+c.y));for(const key of occupied)blocked.add(key);
 const free=(x:number,y:number)=>x>=0&&y>=0&&x<w&&y<h&&!blocked.has(x+','+y),sx=Math.floor(start.x/32),sy=Math.floor((start.y-12)/32),gx=goal.x,gy=goal.y;
 if(!free(gx,gy))return[];const from=sx+sy*w,to=gx+gy*w,queue=[from],parents=new Map<number,number>([[from,from]]);for(let head=0;head<queue.length;head++){const at=queue[head];if(at===to){const route:{x:number;y:number}[]=[];let k=to;while(k!==from){route.push({x:(k%w)*32+16,y:Math.floor(k/w)*32+28});k=parents.get(k)!;}return route.reverse();}for(const[dx,dy]of [[0,1],[0,-1],[1,0],[-1,0]]){const x=at%w+dx,y=Math.floor(at/w)+dy,k=x+y*w;if(free(x,y)&&!parents.has(k)){parents.set(k,at);queue.push(k);}}}return[];
}
