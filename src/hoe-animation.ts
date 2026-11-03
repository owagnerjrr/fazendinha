import type{Avatar}from'./content';import{SKIN_TONES}from'./content';import{outfitSleeveColor}from'./outfit-art';
import{hoePose}from'./hoe-motion';
type Point={x:number;y:number};
const bodies=new WeakMap<HTMLCanvasElement,Map<string,HTMLCanvasElement>>();
function bodyPose(body:HTMLCanvasElement,bend:number,lean:number){let cache=bodies.get(body);if(!cache){cache=new Map();bodies.set(body,cache);}const key=bend+':'+lean;let cv=cache.get(key);if(!cv){cv=document.createElement('canvas');cv.width=50;cv.height=66;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;for(let y=0;y<64;y++){const t=y<48?1:Math.max(0,(60-y)/12);c.drawImage(body,0,y,48,1,1+Math.round(lean*t),y+Math.round(bend*t),48,1);}cache.set(key,cv);}return cv;}

/** Integer strokes keep the new arms and tool on the same pixel grid as the source avatar. */
function line(c:CanvasRenderingContext2D,color:string,width:number,a:Point,b:Point){let x=Math.round(a.x),y=Math.round(a.y),tx=Math.round(b.x),ty=Math.round(b.y),dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1,err=dx+dy;c.fillStyle=color;for(;;){c.fillRect(x-Math.floor(width/2),y-Math.floor(width/2),width,width);if(x===tx&&y===ty)break;const e=2*err;if(e>=dy){err+=dy;x+=sx;}if(e<=dx){err+=dx;y+=sy;}}}
function polygon(c:CanvasRenderingContext2D,color:string,points:Point[]){c.fillStyle=color;const minX=Math.floor(Math.min(...points.map(p=>p.x))),maxX=Math.ceil(Math.max(...points.map(p=>p.x))),minY=Math.floor(Math.min(...points.map(p=>p.y))),maxY=Math.ceil(Math.max(...points.map(p=>p.y)));for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y+.5)!==(b.y>y+.5)&&x+.5<(b.x-a.x)*(y+.5-a.y)/(b.y-a.y)+a.x)inside=!inside;}if(inside)c.fillRect(x,y,1,1);}}
export function drawHoeFrame(c:CanvasRenderingContext2D,body:HTMLCanvasElement,avatar:Avatar,row:number,frame:number){
 const {angle,bend,side,v,n,grip,tip,back,butt}=hoePose(row,frame),skin=avatar.outfit==='forest'?'#795031':avatar.outfit==='nebula'?'#a266b4':SKIN_TONES[avatar.skin],sleeve=outfitSleeveColor(avatar),lean=row===1?-bend:row===2?bend:0;
 const arm=(shoulder:Point,hand:Point)=>{const dx=hand.x-shoulder.x,dy=hand.y-shoulder.y,d=Math.max(1,Math.hypot(dx,dy)),fold=Math.min(5,Math.sqrt(Math.max(0,17*17-d*d/4))),elbow={x:(shoulder.x+hand.x)/2-dy/d*fold*side,y:(shoulder.y+hand.y)/2+dx/d*fold*side};line(c,'#49382e',5,shoulder,elbow);line(c,sleeve,3,shoulder,elbow);line(c,'#49382e',5,elbow,hand);line(c,skin,3,elbow,hand);c.fillStyle=skin;c.fillRect(Math.round(hand.x)-1,Math.round(hand.y)-1,3,3);return elbow;};
 const tool=()=>{line(c,'#49382e',5,butt,tip);line(c,'#a36d3d',3,butt,tip);line(c,'#d1a35e',1,{x:butt.x-n.x,y:butt.y-n.y},{x:tip.x-n.x,y:tip.y-n.y});const p=(along:number,across:number)=>({x:tip.x+v.x*along+n.x*across,y:tip.y+v.y*along+n.y*across});polygon(c,'#382e39',[p(-3,-5),p(3,-5),p(7,7),p(-2,9)]);polygon(c,'#746b80',[p(-2,-3),p(2,-3),p(5,6),p(-1,7)]);line(c,'#c5b8c9',1,p(-1,6),p(4,5));};
 const near={x:48+(row===1?7:row===2?-7:9)+lean,y:74+bend},far={x:48+(row===1?-5:row===2?5:-9)+lean,y:73+bend};
 const farElbow=arm(far,back);const behind=angle< -40||row===3;if(behind)tool();
 c.drawImage(bodyPose(body,bend,lean),23,38);
 line(c,'#49382e',5,farElbow,back);line(c,skin,3,farElbow,back);arm(near,grip);if(!behind)tool();for(const hand of[back,grip]){c.fillStyle='#49382e';c.fillRect(Math.round(hand.x)-2,Math.round(hand.y)-2,5,5);c.fillStyle=skin;c.fillRect(Math.round(hand.x)-1,Math.round(hand.y)-1,3,3);}
}
