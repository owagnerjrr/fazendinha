export type Point={x:number;y:number};
export type Obstacle={x:number;y:number;width:number;height:number};
export const MAP_BOUNDS={left:105,top:190,right:1480,bottom:1070};
const NEIGHBORS=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]] as const;
/** A* with a min-heap and per-search collision memo; dynamic obstacles are never cached across calls. */
export function findPath(start:Point,goal:Point,obstacles:Obstacle[],step=16):Point[]{
 if(!Number.isFinite(step)||step<=0||![start.x,start.y,goal.x,goal.y].every(Number.isFinite))return[];
 const b=MAP_BOUNDS,cols=Math.ceil((b.right-b.left)/step)+1,rows=Math.ceil((b.bottom-b.top)/step)+1,size=cols*rows;
 const blocked=(x:number,y:number)=>x<b.left||x>b.right||y<b.top||y>b.bottom||obstacles.some(o=>x>=o.x-12&&x<=o.x+o.width+12&&y>=o.y-5&&y<=o.y+o.height+17);
 if(blocked(goal.x,goal.y))return[];
 const index=(p:Point)=>Math.max(0,Math.min(rows-1,Math.round((p.y-b.top)/step)))*cols+Math.max(0,Math.min(cols-1,Math.round((p.x-b.left)/step)));
 const from=index(start),to=index(goal),cost=new Float64Array(size).fill(Infinity),parent=new Int32Array(size).fill(-1),closed=new Uint8Array(size),collision=new Uint8Array(size);
 const free=(i:number)=>{if(!collision[i])collision[i]=blocked(b.left+i%cols*step,b.top+Math.floor(i/cols)*step)?2:1;return collision[i]===1;};
 type Node={index:number;score:number;cost:number;order:number};const heap:Node[]=[];let order=0;
 const less=(a:Node,c:Node)=>a.score<c.score||a.score===c.score&&a.order<c.order;
 const push=(node:Node)=>{let i=heap.length;heap.push(node);while(i){const p=(i-1)>>1;if(!less(node,heap[p]))break;heap[i]=heap[p];i=p;}heap[i]=node;};
 const pop=()=>{const node=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&less(heap[child+1],heap[child]))child++;if(!less(heap[child],last))break;heap[i]=heap[child];i=child;}heap[i]=last;}return node;};
 const enqueue=(i:number,g:number)=>push({index:i,cost:g,score:g+Math.hypot(b.left+i%cols*step-goal.x,b.top+Math.floor(i/cols)*step-goal.y),order:order++});cost[from]=0;enqueue(from,0);
 while(heap.length){const node=pop(),at=node.index;if(closed[at]||node.cost!==cost[at])continue;
  if(at===to){const route:Point[]=[goal];let i=at;while(i!==from){route.push({x:b.left+i%cols*step,y:b.top+Math.floor(i/cols)*step});i=parent[i];}return route.reverse();}
  closed[at]=1;const x=at%cols,y=Math.floor(at/cols);
  for(const[dx,dy]of NEIGHBORS){const nx=x+dx,ny=y+dy;if(nx<0||nx>=cols||ny<0||ny>=rows)continue;const i=ny*cols+nx;if(closed[i]||!free(i)||dx&&dy&&(!free(y*cols+nx)||!free(ny*cols+x)))continue;const next=cost[at]+(dx&&dy?Math.SQRT2:1)*step;if(next<cost[i]){parent[i]=at;cost[i]=next;enqueue(i,next);}}
 }
 return[];
}
