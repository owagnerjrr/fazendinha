export const HOE_PHASES=[0,55,110,170,230,280,330,390,455,540,650,760] as const;
export const HOE_FRAMES=HOE_PHASES.length;
export function hoeFrame(elapsed:number){let frame=0;while(frame+1<HOE_FRAMES&&elapsed>=HOE_PHASES[frame+1])frame++;return frame;}

const poses=[ [14,-26,35,0],[13,-29,10,0],[9,-34,-55,0],[3,-43,-105,0],[-4,-45,-130,0],[3,-39,-90,0],[11,-29,-25,1],[12,-17,30,2],[11,-20,36,2],[12,-23,30,1],[13,-25,35,0],[14,-26,35,0] ];

export function hoePose(row:number,frame:number){const [gx,gy,angle,bend]=poses[Math.max(0,Math.min(HOE_FRAMES-1,Math.floor(frame)))],side=row===1?-1:1,rad=angle*Math.PI/180,v={x:side*Math.cos(rad),y:Math.sin(rad)},n={x:-side*v.y,y:side*v.x},grip={x:48+side*gx,y:100+gy};return{angle,bend,side,v,n,grip,tip:{x:grip.x+v.x*28,y:grip.y+v.y*28},back:{x:grip.x-v.x*11,y:grip.y-v.y*11},butt:{x:grip.x-v.x*15,y:grip.y-v.y*15}};}
