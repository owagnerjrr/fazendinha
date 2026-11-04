/** Two fixed-length arm segments: approach the animal, never stretch the arm. */
export function petStroke(player:{x:number;y:number},head:{x:number;y:number},side:number,elapsed:number,reduced=false,feeding=false){
 const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
 const reach=ease((elapsed-200)/600),stroke=reduced||feeding?0:Math.sin(Math.max(0,elapsed-800)/1200*Math.PI*2)*1.2;
 const shoulder={x:player.x+side*7,y:player.y-29};
 const target={x:head.x-side*stroke,y:head.y+(feeding?4:0)+Math.abs(stroke)*.2};
 const dx=target.x-shoulder.x,dy=target.y-shoulder.y,length=Math.hypot(dx,dy),scale=Math.min(1,23/Math.max(1,length));
 const hand={x:shoulder.x+side*3*(1-reach)+dx*scale*reach,y:shoulder.y+13*(1-reach)+dy*scale*reach};
 const hx=hand.x-shoulder.x,hy=hand.y-shoulder.y,d=Math.max(.01,Math.hypot(hx,hy)),bend=Math.sqrt(Math.max(0,12*12-d*d/4));
 const elbow={x:(shoulder.x+hand.x)/2-hy/d*bend*side,y:(shoulder.y+hand.y)/2+hx/d*bend*side};
 return{shoulder,elbow,hand,visible:reach>.01,heartY:head.y-13-ease((elapsed-1100)/1500)*10};
}
