export function petStroke(player:{x:number;y:number},head:{x:number;y:number},side:number,elapsed:number,reduced=false){
 const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
 const reach=ease((elapsed-600)/350),cycle=(elapsed-950)/850,stroke=reduced?0:Math.sin(Math.max(0,cycle)*Math.PI*2)*2.5;
 const shoulder={x:player.x+side*8,y:player.y-30};
 let dx=head.x-shoulder.x-side*stroke,dy=head.y-shoulder.y+Math.abs(stroke)*.25;
 const length=Math.hypot(dx,dy),scale=Math.min(1,29/Math.max(1,length));dx*=scale;dy*=scale;
 const hand={x:shoulder.x+dx*reach,y:shoulder.y+dy*reach};
 const elbow={x:shoulder.x+dx*.48*reach,y:shoulder.y+dy*.48*reach+3*reach};
 return{shoulder,elbow,hand,visible:reach>0,heartY:head.y-13-ease((elapsed-1100)/1500)*10};
}
