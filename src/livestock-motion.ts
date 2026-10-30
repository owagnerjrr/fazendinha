import type {Obstacle} from './pathfinding.js';
/** Smooth closed walk and genuine rest, inside a private cell so herd members cannot overlap. */
export function livestockMotion(box:Obstacle,index:number,count:number,size:{width:number;height:number},time:number,seed=0){
 const cols=Math.min(3,Math.max(1,count)),rows=Math.ceil(count/cols),cw=box.width/cols,ch=box.height/rows,col=index%cols,row=Math.floor(index/cols);
 const rx=Math.max(0,Math.min(34,(cw-size.width)/2-9)),ry=Math.max(0,Math.min(22,ch-size.height-18));
 const t=((time+index*2300+seed*1900)%36000+36000)%36000,walking=t<26000,s=walking?t/26000:1,ease=s*s*(3-2*s),angle=ease*Math.PI*2;
 const vx=walking?Math.cos(angle):1;
 return{x:box.x+cw*(col+.5)+Math.sin(angle)*rx,y:box.y+ch*(row+1)-9-(1-Math.cos(angle))*ry/2,walking,flip:vx<0,frame:walking?Math.floor(ease*Math.PI*2*Math.max(rx,ry)/2.8)%8:0};
}
