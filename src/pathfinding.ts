export type Point={x:number;y:number};
export type Obstacle={x:number;y:number;width:number;height:number};
export const MAP_BOUNDS={left:105,top:190,right:1480,bottom:1070};
export function findPath(start:Point,goal:Point,obstacles:Obstacle[],step=16):Point[] {
  const b=MAP_BOUNDS,cols=Math.ceil((b.right-b.left)/step)+1,rows=Math.ceil((b.bottom-b.top)/step)+1;
  const position=(i:number)=>({x:b.left+(i%cols)*step,y:b.top+Math.floor(i/cols)*step});
  const blocked=(p:Point)=>p.x<b.left||p.x>b.right||p.y<b.top||p.y>b.bottom||obstacles.some(o=>p.x>=o.x-12&&p.x<=o.x+o.width+12&&p.y>=o.y-5&&p.y<=o.y+o.height+17);
  const index=(p:Point)=>Math.max(0,Math.min(rows-1,Math.round((p.y-b.top)/step)))*cols+Math.max(0,Math.min(cols-1,Math.round((p.x-b.left)/step)));
  const from=index(start),to=index(goal); if(blocked(goal)) return [];
  const open=new Set([from]),closed=new Set<number>(),parent=new Map<number,number>(),cost=new Map([[from,0]]);
  const h=(i:number)=>Math.hypot(position(i).x-goal.x,position(i).y-goal.y);
  while(open.size) {
    let at=-1,best=Infinity;for(const i of open){const score=cost.get(i)!+h(i);if(score<best){best=score;at=i;}}
    if(at===to){const route:Point[]=[goal];let i=at;while(i!==from){route.push(position(i));i=parent.get(i)!;}return route.reverse();}
    open.delete(at);closed.add(at);const p=position(at);
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
      const q={x:p.x+dx*step,y:p.y+dy*step},i=index(q);
      if(closed.has(i)||blocked(q)||(dx&&dy&&(blocked({x:p.x+dx*step,y:p.y})||blocked({x:p.x,y:p.y+dy*step}))))continue;
      const next=cost.get(at)!+Math.hypot(dx,dy)*step;
      if(next<(cost.get(i)??Infinity)){parent.set(i,at);cost.set(i,next);open.add(i);}
    }
  }
  return [];
}
