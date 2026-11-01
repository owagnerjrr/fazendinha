import{duckToy,duckPlayPose,type DuckPlay}from'./south-leisure-rules';
import{gardenButterfly}from'./south-garden';
import Phaser from'phaser';import{lightEffects}from'./display-settings';import{SOUTH_PONDS,SOUTH_LIGHTS,southDuckPose,southNatureObstacles}from'./south-nature-layout';
type Ctx=CanvasRenderingContext2D;
/** Original pixel scenery, baked once; animation uses a fixed number of small sprites. */
export function paintSouthNature(c:Ctx,random:()=>number){
 const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
 const oval=(color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,Math.PI*2);c.fill();};
 for(const p of SOUTH_PONDS){oval('#49643e',p.x,p.y+3,p.rx+18,p.ry+12);oval('#8c9661',p.x,p.y,p.rx+11,p.ry+7);oval('#bbc18a',p.x,p.y-2,p.rx+5,p.ry+3);oval('#6db6a7',p.x,p.y,p.rx,p.ry);oval('#3c8d94',p.x+3,p.y+3,p.rx-13,p.ry-9);oval('#357b87',p.x+7,p.y+7,p.rx-33,p.ry-18);
  for(let i=0;i<38;i++){const t=i*Math.PI*2/38,x=p.x+Math.cos(t)*(p.rx+8),y=p.y+Math.sin(t)*(p.ry+5);if(i%3===0){oval('#566d4b',x,y+2,7,4);oval('#afb696',x,y,6,3);r('#d8d6b0',x-3,y-2,5,1);}else{r('#365f40',x,y-9,2,11);r('#5a8648',x+3,y-6,2,7);r('#b4ae69',x,y-12,2,5);}}
  for(let i=0;i<5;i++){const x=p.x-75+i*29,y=p.y+18+(i%2)*8;oval('#3c6e4f',x,y,7,3);r('#90ad63',x-5,y-2,8,2);if(i%2===0){r('#efd0cf',x,y-4,4,3);r('#fff0d9',x+1,y-5,2,2);}}
 }
 // Rounded, fractured stone outcrop: irregular silhouette, tiny mineral pixels and trailing moss.
 const rock=(cx:number,cy:number,rx:number,ry:number,index:number)=>{
  const points=[[-.8,-.8],[-.25,-1],[.55,-.9],[1,-.45],[.9,.25],[.6,.9],[-.2,1],[-.9,.65],[-1,-.1]];
  const shape=(dx=0,dy=0)=>{c.beginPath();points.forEach(([x,y],i)=>{const px=Math.round((cx+x*rx+dx)/2)*2,py=Math.round((cy+y*ry+dy)/2)*2;i?c.lineTo(px,py):c.moveTo(px,py);});c.closePath();};
  c.fillStyle='#425946';shape(2,3);c.fill();c.fillStyle='#71816a';shape();c.fill();
  c.save();shape();c.clip();
  for(let i=0;i<rx*ry/2;i++){const x=Math.floor((cx-rx+random()*rx*2)/2)*2,y=Math.floor((cy-ry+random()*ry*2)/2)*2;r(['#637760','#76866b','#8a967b','#576e58','#929a7f'][i%5],x,y,2+(i%3)*2,2);}
  for(let i=0;i<3;i++){const x=cx-rx/2+i*rx/2,y=cy-ry/2+i*ry/3;r('#526750',x,y,2,ry*.45);r('#a0a58a',x+2,y,2,ry*.2);}
  c.restore();oval('#416a3d',cx-3,cy-ry+5,rx*.7,5);oval('#6e914c',cx-6,cy-ry+3,rx*.58,3);r('#adc071',cx-rx*.4,cy-ry+1,rx*.6,2);
  if(index%2===0)for(let j=0;j<5;j++){const x=cx-rx*.7+j*rx*.3,y=cy-ry+7;r('#3c663b',x,y,2,9+j%3*5);r('#70954c',x-2,y+6+j%2*4,5,2);}
 };
 for(const [i,b]of [[309,211,31,34],[413,214,30,33],[294,177,28,34],[418,177,26,33],[314,142,30,28],[400,140,29,28],[343,127,30,21],[377,125,31,21]].entries())rock(b[0],b[1],b[2],b[3],i);
 r('#315b53',336,118,51,133);r('#80bcb0',340,118,43,141);r('#bee3c9',342,118,7,137);r('#4e9fa4',367,118,13,140);
 for(let i=0;i<85;i++){const x=190+random()*350,y=122+random()*202;if(x>274&&x<450&&y<258||((x-360)/150)**2+((y-284)/51)**2<1)continue;r('#49753d',x,y,2,6);r(i%2?'#b5bd69':'#74934c',x-2,y,2,3);if(i%7===0)r('#e3d8a0',x-2,y-2,5,3);}
 for(const p of SOUTH_LIGHTS){oval('#273d2b33',p.x+3,p.y+36,10,3);r('#3b4634',p.x-2,p.y+8,4,29);r('#a38a56',p.x-1,p.y+9,1,26);r('#35432f',p.x-6,p.y,12,15);r('#e6c67a',p.x-4,p.y+3,8,9);r('#fff0ae',p.x-2,p.y+4,3,6);r('#536442',p.x-7,p.y-2,14,3);r('#788254',p.x-5,p.y-4,10,2);r('#364a33',p.x-4,p.y+14,8,2);}
 // A quiet wooden bench beside the spring, clear of the arrival lane.
 oval('#29432d33',582,306,38,9);for(const x of[555,604]){r('#4e4030',x,283,5,26);r('#c29a5b',x+1,284,2,23);}for(const y of[277,285,297]){r('#5b4731',551,y,62,6);r('#bb945d',552,y,60,4);r('#e0bb7e',553,y,58,1);}r('#826441',552,298,61,5);
}
function natureTextures(scene:Phaser.Scene){
 if(!scene.textures.exists('south-falls')){const cv=document.createElement('canvas');cv.width=64*8;cv.height=150;const c=cv.getContext('2d')!;for(let f=0;f<8;f++){c.save();c.translate(f*64,0);const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};r('#75c4c0',10,0,44,127);r('#c3e8d4',11,0,6,126);r('#429ca9',48,0,5,127);for(let i=0;i<11;i++){const x=15+(i*7)%34,y=(i*29+f*9)%126;r(i%3?'#d9f3df':'#9edbd2',x,y,2+(i%2),15+(i%4)*4);}for(let i=0;i<10;i++){const x=6+i*5,y=120+(i+f)%4;r(i%2?'#b8e9db':'#e2f5dc',x,y,6,3);r('#92d5d0',x-2,y+6,8,2);}for(let i=0;i<6;i++)r('#d9eee0',8+(i*11+f*3)%49,130+(i+f)%8,2,2);c.restore();}scene.textures.addCanvas('south-falls',cv);scene.textures.addSpriteSheet('',scene.textures.get('south-falls'),{frameWidth:64,frameHeight:150});}
 for(const mallard of[false,true]){const key=mallard?'south-mallard':'south-duck';if(scene.textures.exists(key))continue;const cv=document.createElement('canvas');cv.width=32*4;cv.height=28;const c=cv.getContext('2d')!;for(let f=0;f<4;f++){c.save();c.translate(f*32,0);const r=(col:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};r('#2a687b',5,23,23,2);r('#9bd7cd',8-f%2,24,17,1);r('#344b43',5,13,19,8);r('#344b43',8,20,13,2);r(mallard?'#b0b6a1':'#e6e8c9',6,13,16,7);r(mallard?'#8b7760':'#fff5db',9,12,11,3);r(mallard?'#546d5b':'#c7d4b9',7,16,10,3);r('#344b43',20,6,8,12);r(mallard?'#387b58':'#f4edd4',21,7,6,11);r(mallard?'#4d9a66':'#fff9df',22,7,4,3);r('#f1e7bd',21,15,6,2);r('#d89e40',27,11,5,3);r('#f3ca65',28,11,4,1);r('#27372f',25,9,1,2);r('#344b43',3,12,4,4);r('#c99b50',12+(f%2)*4,21,4,1);c.restore();}scene.textures.addCanvas(key,cv);scene.textures.addSpriteSheet('',scene.textures.get(key),{frameWidth:32,frameHeight:28});}
}
export function southNature(scene:Phaser.Scene,block:(x:number,y:number,w:number,h:number)=>void){
 natureTextures(scene);for(const o of southNatureObstacles())block(o.x+o.width/2,o.y+o.height/2,o.width,o.height);
 const falls=scene.add.image(362,118,'south-falls',0).setOrigin(.5,0).setDepth(250),water=scene.add.graphics().setDepth(.7),sky=scene.add.graphics().setDepth(1700),shadows=scene.add.graphics().setDepth(.8);
 const ducks=Array.from({length:6},(_,i)=>scene.add.image(0,0,i%2?'south-mallard':'south-duck',0).setScale(1.25));const reduced=matchMedia('(prefers-reduced-motion: reduce)');let next=0,placed=false;
 const update=(time:number)=>{if(time<next)return;const light=lightEffects(),quiet=reduced.matches;next=time+(light||quiet?120:66);const t=quiet?0:time,view=scene.cameras.main.worldView;falls.setFrame(Math.floor(t/90)%8);water.clear();sky.clear();shadows.clear();
  const play=scene.data.get('south-duck-play') as DuckPlay|undefined;
  for(let i=0;i<ducks.length;i++){const p=southDuckPose(i,t),react=play&&(quiet||t-play.started>=1400)&&play.pond===(i<3?0:1);if(react){const follow=duckPlayPose(i,t,play);p.x=follow.x;p.y=follow.y;}const x=quiet||!placed?p.x:ducks[i].x+(p.x-ducks[i].x)*.2,y=quiet||!placed?p.y:ducks[i].y+(p.y-ducks[i].y)*.2;ducks[i].setPosition(x,y).setFlipX(react?p.x>duckToy(play!.pond,t,play!.started).x:p.left).setFrame(p.frame).setAngle(react&&!quiet?Math.sin(t/160+i)*4:0).setDepth(y+1);}placed=true;
  for(const p of SOUTH_PONDS)for(let i=0;i<13;i++){const a=i*2.4,x=p.x+Math.sin(a)*(p.rx-28),y=p.y+Math.cos(a)*(p.ry-13);if(!view.contains(x,y))continue;const dx=quiet?0:Math.sin(t/1500+i)*5;water.fillStyle(0xbce8d7,.48).fillRect(Math.round(x+dx),Math.round(y),10+i%4*3,1).fillRect(Math.round(x+dx+5),Math.round(y+3),5,1);}
  if(quiet)return;
  for(let i=0;i<(light?2:5);i++){const p=gardenButterfly(i,t);if(!view.contains(p.x,p.y))continue;sky.fillStyle([0xe9bf83,0xd8afca,0xc8c0e2][i%3],.9).fillEllipse(p.x-p.wing,p.y,p.wing*2,4).fillEllipse(p.x+p.wing,p.y,p.wing*2,4);sky.fillStyle(0x57613e).fillRect(Math.round(p.x),Math.round(p.y-2),1,5);}
  for(let i=0;i<(light?2:4);i++){const x=90+(t*(.035+i*.004)+i*390)%1400,y=230+i*170+Math.sin(t/1900+i)*24;if(!view.contains(x,y))continue;const wing=Math.round(Math.sin(t/140+i)*5);sky.lineStyle(2,i%2?0x364849:0x4a5c58).lineBetween(x-8,y-wing,x,y+1).lineBetween(x,y+1,x+8,y-wing);sky.fillStyle(0xd1cdb4).fillRect(Math.round(x),Math.round(y),2,3);shadows.fillStyle(0x254333,.14).fillEllipse(x-9,y+52,13,4);}
 };scene.events.on('update',update);scene.events.once('shutdown',()=>scene.events.off('update',update));update(0);
}
