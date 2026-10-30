/** Runtime images (needs, eggs, etc.) must survive static floor capture. */
const liveNodes=new WeakSet<object>();
export function retainLiveFloorNode<T extends object>(node:T):T{liveNodes.add(node);return node;}
export type FloorNode={depth:number;visible?:boolean;active?:boolean;x:number;y:number;destroy:()=>void};
export function isStaticFloorNode(node:FloorNode){return !liveNodes.has(node)&&node.active!==false&&node.visible!==false&&node.depth>=0&&node.depth<10;}
type FloorTarget<T>={beginDraw:()=>unknown;batchDraw:(node:T,x:number,y:number)=>unknown;endDraw:()=>unknown;destroy:()=>void};
/** Capture at each object's own room-relative position; delete originals only after success. */
export function cacheFloorNodes<T extends FloorNode>(nodes:T[],box:{x:number;y:number},target:FloorTarget<T>){
 try{target.beginDraw();try{for(const node of nodes)target.batchDraw(node,node.x-box.x,node.y-box.y);}finally{target.endDraw();}}
 catch{target.destroy();return 0;}
 for(const node of nodes)node.destroy();return nodes.length;
}
