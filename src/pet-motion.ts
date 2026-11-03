/** Smooth contact with a bent two-segment arm, independent of animal size. */
export function petStroke(player:{x:number;y:number},head:{x:number;y:number},side:number,elapsed:number,reduced=false){
 const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
 const reach=ease((elapsed-200)/500),stroke=reduced?0:Math.sin(Math.max(0,elapsed-700)/1050*Math.PI*2)*1.5;
 const shoulder={x:player.x-side*7,y:player.y-29},dx=head.x-side*stroke-shoulder.x,dy=head.y+Math.abs(stroke)*.2-shoulder.y;
 const length=Math.hypot(dx,dy),scale=Math.min(1,33/Math.max(1,length));
 const hand={x:shoulder.x+dx*scale*reach,y:shoulder.y+10+(dy*scale-10)*reach};
 const hx=hand.x-shoulder.x,hy=hand.y-shoulder.y,d=Math.max(.01,Math.hypot(hx,hy)),bend=Math.sqrt(Math.max(0,17*17-d*d/4));
 const elbow={x:(shoulder.x+hand.x)/2-hy/d*bend*side,y:(shoulder.y+hand.y)/2+hx/d*bend*side};
 return{shoulder,elbow,hand,visible:reach>.01,heartY:head.y-13-ease((elapsed-1100)/1500)*10};
}
