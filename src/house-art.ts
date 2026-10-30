import type Phaser from 'phaser';
import type { Obstacle } from './pathfinding';
export const HOUSE_BOUNDS={x:270,y:220,width:660,height:500};
export const HOUSE_PROPS=[
 {kind:'bed',x:317,y:315,width:74,height:84,facing:'south',body:{x:284,y:271,width:66,height:42},access:{x:376,y:337},name:'Cama'},
 {kind:'wardrobe',x:887,y:315,width:66,height:90,facing:'south',body:{x:857,y:283,width:60,height:30},access:{x:887,y:349},name:'Guarda-roupa'},
 {kind:'tv',x:740,y:326,width:78,height:90,facing:'south',body:{x:705,y:307,width:70,height:18},access:{x:740,y:359},name:'TV'},
 {kind:'sofa',x:740,y:520,width:124,height:78,facing:'north',body:{x:681,y:473,width:118,height:44},access:{x:829,y:497},name:'Sofá'},
 {kind:'coffee',x:740,y:417,width:80,height:42,facing:'south',body:{x:704,y:391,width:72,height:23},access:{x:814,y:414},name:'Mesa de centro'},
 {kind:'table',x:410,y:540,width:94,height:55,facing:'south',body:{x:367,y:510,width:86,height:27},access:{x:484,y:545},name:'Mesa'},
 {kind:'chair',x:410,y:587,width:32,height:40,facing:'north',body:{x:397,y:566,width:26,height:18},access:{x:466,y:587},name:'Cadeira'},
] as const;
export const HOUSE_LAMP={x:303,y:703};
export const HOUSE_SEAT={x:740,y:514};
export const HOUSE_SLEEP={x:317,y:294};
export const HOUSE_TV_SCREEN={x:710,y:271,width:39,height:24};
export const HOUSE_DETAIL_BODIES:Obstacle[]=[{x:286,y:680,width:34,height:21}];
export const HOUSE_WALLS:Obstacle[]=[{x:258,y:154,width:16,height:580},{x:928,y:154,width:16,height:580},{x:270,y:154,width:660,height:70},{x:270,y:716,width:280,height:16},{x:650,y:716,width:280,height:16}];
type Rect=(color:string,x:number,y:number,w:number,h:number)=>void;
/** Cached, original pixel furnishings; rich existing furniture is reused without stretching it upside down. */
function houseTextures(scene:Phaser.Scene){
 const create=(name:string,w:number,h:number,draw:(r:Rect)=>void)=>{const key=`house-${name}`;if(scene.textures.exists(key))return;const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;draw((color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);});scene.textures.addCanvas(key,cv);};
 const wood=(r:Rect,x:number,y:number,w:number,h:number)=>{r('#392b22',x,y,w,h);r('#77522f',x+1,y+1,w-2,h-2);r('#c29b63',x+2,y+1,w-4,2);r('#a87c46',x+3,y+4,w-6,h-7);r('#513923',x+2,y+h-3,w-4,2);for(let i=0;i<Math.floor(w/7);i++)r(i%2?'#bd9257':'#886037',x+4+i*6,y+6+(i%3)*2,4,1);};
 create('floor',192,64,r=>{r('#624731',0,0,192,64);for(let row=0;row<4;row++)for(let col=-1;col<3;col++){const x=col*96+(row%2)*48,y=row*16;r(['#ad8755','#a37d4d','#b08b59'][(row+col+3)%3],x+1,y+1,94,15);r('#c2a06c',x+2,y+1,92,1);r('#81603d',x+1,y+15,94,1);for(let k=0;k<12;k++)r(k%3?'#9e7849':'#bc9660',x+5+(k*17)%80,y+4+(k*3)%9,5+(k%4)*3,1);r('#6d5439',x+5,y+7,1,1);r('#d2b17c',x+5,y+8,1,1);}});
 // Seat cushions extend north toward the TV; the low, separate rear rail faces the camera.
 create('sofa-back',124,78,r=>{
  r('#302b21',8,72,110,4);for(const x of [13,105])wood(r,x,67,7,9);
  r('#2c4939',10,10,104,58);r('#648369',13,9,98,40);r('#9ab48b',15,10,94,3);
  for(const x of [17,64]){r('#345942',x,15,43,34);r('#6d906c',x+2,14,40,29);r('#9fb795',x+3,15,37,2);r('#527853',x+3,39,36,4);for(let y=21;y<39;y+=7)for(let px=x+7;px<x+36;px+=9)r('#789b73',px,y,3,1);}
  for(const x of [3,108]){wood(r,x,19,13,48);r('#42644a',x,15,13,13);r('#98ae80',x+2,16,9,2);r('#739463',x+1,20,11,5);}
  r('#264b34',12,50,100,18);r('#4c744f',14,50,96,15);r('#88a775',16,50,92,3);r('#3b603e',17,62,90,4);wood(r,10,68,104,6);
 });
 create('table',94,55,r=>{r('#32291f',5,48,85,5);for(const x of [10,78])wood(r,x,27,6,25);wood(r,1,5,92,28);r('#c6a16a',5,7,84,18);for(const y of [12,20])r('#967044',5,y,83,1);r('#e1c38c',6,7,81,1);r('#617951',27,10,39,13);r('#92a16e',28,10,37,2);r('#d9ceb0',39,12,18,7);r('#f0e6c5',41,11,14,5);r('#78959a',71,14,7,8);r('#c0d2ba',71,14,6,2);});
 create('coffee',80,42,r=>{r('#342d23',4,35,72,4);for(const x of [10,65])wood(r,x,22,5,16);wood(r,2,6,76,23);r('#c6a06b',6,8,68,15);r('#e2c795',7,8,65,1);r('#997344',8,16,62,1);r('#6e8765',24,10,30,10);r('#a7b594',25,10,28,2);r('#dbc99e',34,9,11,7);r('#eee0ba',36,9,8,2);r('#8f5b40',59,11,6,7);r('#d5b378',59,11,5,2);});
 create('chair',32,40,r=>{r('#332a22',3,36,26,3);wood(r,3,1,26,21);r('#c6a06b',7,4,18,3);r('#73502f',8,10,15,7);wood(r,3,22,26,9);r('#7e9264',6,22,20,5);for(const x of [4,24])wood(r,x,30,4,8);});
 create('lamp',42,70,r=>{r('#332c23',4,63,35,4);wood(r,4,41,34,23);wood(r,2,37,38,6);r('#e0bd7e',4,37,34,1);r('#d5ae61',19,52,4,2);r('#b99c62',19,18,4,18);r('#745334',14,34,15,3);for(let y=2;y<19;y++){const w=12+Math.floor(y*.8);r(y<8?'#eee1af':'#dbc38a',21-w/2,y,w,1);}r('#f8ebbe',12,5,3,12);r('#9f784a',7,19,29,3);r('#8aa08d',29,32,8,5);r('#d7c796',30,32,6,1);});
}
function rug(scene:Phaser.Scene,x:number,y:number,w:number,h:number,colors:[number,number,number]){
 const g=scene.add.graphics().setDepth(1);g.fillStyle(0x29291f,.2).fillRect(x+2,y+3,w,h);g.fillStyle(colors[0]).fillRect(x,y,w,h);g.fillStyle(colors[1]).fillRect(x+3,y+3,w-6,h-6);g.fillStyle(colors[2]).fillRect(x+8,y+8,w-16,h-16);g.lineStyle(1,colors[1],.9).strokeRect(x+12,y+12,w-24,h-24);
 for(let px=x+5;px<x+w-4;px+=5){g.fillStyle(0xd6c394,.8).fillRect(px,y-3,2,3).fillRect(px,y+h,2,3);}
 for(let py=y+17;py<y+h-15;py+=9)for(let px=x+18;px<x+w-16;px+=10){g.fillStyle(colors[1],.22).fillRect(px,py,2,1);}
 g.lineStyle(1,colors[1],.6);const cx=x+w/2,cy=y+h/2;for(const size of [12,22,32])g.strokePoints([{x:cx,y:cy-size},{x:cx+size,y:cy},{x:cx,y:cy+size},{x:cx-size,y:cy}],true);
}
export function buildHouse(scene:Phaser.Scene,block:(x:number,y:number,w:number,h:number)=>void,interact:(kind:string)=>void){
 houseTextures(scene);const g=scene.add.graphics().setDepth(0);g.fillStyle(0x342b24).fillRect(258,154,686,580);g.fillStyle(0xd7c59e).fillRect(270,154,660,70);
 for(let y=159;y<188;y+=9)for(let x=280;x<922;x+=14){g.fillStyle(0xaaa87a,.5).fillRect(x,y,2,3);g.fillStyle(0xe8d7b3,.9).fillRect(x-2,y+1,2,1).fillRect(x+2,y+1,2,1);}
 scene.add.tileSprite(270,224,660,492,'house-floor').setOrigin(0).setDepth(.1);
 const trim=scene.add.graphics().setDepth(1);trim.fillStyle(0x765333).fillRect(278,189,644,26);for(let x=280;x<922;x+=26){trim.fillStyle(0xaf8b56).fillRect(x,191,23,22);trim.fillStyle(0xcaae74).fillRect(x+1,191,21,1);trim.fillStyle(0x8c693f).fillRect(x+20,194,2,17);}trim.fillStyle(0xe0c18a).fillRect(278,186,644,3);trim.fillStyle(0x4e3928).fillRect(270,215,660,11).fillRect(270,224,8,492).fillRect(922,224,8,492).fillRect(270,708,280,10).fillRect(650,708,280,10);trim.fillStyle(0xba945a).fillRect(278,217,644,2).fillRect(550,708,100,18);trim.fillStyle(0xd3b77e).fillRect(555,711,90,2);
 for(const x of [335,845])scene.add.image(x,211,'life-window').setOrigin(.5,1).setDisplaySize(47,57).setDepth(221);
 rug(scene,280,233,154,133,[0x3f5a60,0xa4b4a0,0x6c8b83]);rug(scene,647,340,192,220,[0x374e3d,0xb2b384,0x66805c]);rug(scene,554,552,64,115,[0x766142,0xc8aa78,0x9c8055]);
 const points=HOUSE_PROPS.map(p=>{const key=['bed','wardrobe','tv'].includes(p.kind)?`life-${p.kind}`:p.kind==='sofa'?'house-sofa-back':`house-${p.kind}`;scene.add.ellipse(p.x+2,p.y-3,p.width*.95,12,0x30291e,.24).setDepth(p.y-.2);scene.add.image(p.x,p.y,key).setOrigin(.5,1).setDisplaySize(p.width,p.height).setDepth(p.kind==='sofa'?p.y-50:p.y);block(p.body.x,p.body.y,p.body.width,p.body.height);return {kind:p.kind,...p.access,hitX:p.x,hitY:p.y-p.height/2,radius:Math.max(18,p.width*.45),name:p.name,run:()=>interact(p.kind)};});
 scene.add.image(HOUSE_LAMP.x,HOUSE_LAMP.y,'house-lamp').setOrigin(.5,1).setDepth(HOUSE_LAMP.y);for(const b of HOUSE_DETAIL_BODIES)block(b.x,b.y,b.width,b.height);
 scene.add.image(502,258,'life-flowerPlanter').setOrigin(.5,1).setDisplaySize(31,34).setDepth(258);
 const art=scene.add.graphics().setDepth(221);art.fillStyle(0x5c3e28).fillRect(477,167,66,44);art.fillStyle(0xc5a16a).fillRect(480,170,60,38);art.fillStyle(0x89a99b).fillRect(484,174,52,30);art.fillStyle(0xdcd7a5).fillCircle(523,182,5);art.fillStyle(0x567958).fillTriangle(484,204,510,180,536,204);art.fillStyle(0x86a171).fillTriangle(503,204,524,191,536,204);
 art.fillStyle(0x64472d).fillRect(582,210,68,6);art.fillStyle(0xc09a60).fillRect(580,209,72,2);for(let i=0;i<5;i++){art.fillStyle([0x718c7b,0x9b6653,0xc9af75][i%3]).fillRect(586+i*8,191-i%2*3,6,18+i%2*3);art.fillStyle(0xe4d1a0).fillRect(587+i*8,195,4,1);}
 const light=scene.add.graphics().setDepth(1.9);light.fillStyle(0xf3cc82,.09).fillEllipse(HOUSE_LAMP.x,HOUSE_LAMP.y-20,94,85);for(const x of [335,845]){light.fillStyle(0xf5dfa6,.055).fillTriangle(x-20,225,x+21,225,x+90,430);}
 const overlay=(key:string,sourceKey:string,w:number,h:number,cut:number,x:number,y:number,depth:number)=>{
  if(!scene.textures.exists(key)){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;const image=scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;c.drawImage(image,0,image.height*cut/h,image.width,image.height*(h-cut)/h,0,cut,w,h-cut);scene.textures.addCanvas(key,cv);}
  return scene.add.image(x,y,key).setOrigin(.5,1).setDepth(depth);
 };
 overlay('house-sofa-rail','house-sofa-back',124,78,50,740,520,521);
 overlay('house-bed-cover','life-bed',74,84,45,317,315,317);
 const screen=scene.add.graphics().setDepth(327);
 let lastFrame=-1;
 return Object.assign(points,{updateHome(home:{tvOn:boolean}|undefined,time:number,sleeping:boolean,reduced:boolean){
  const frame=home?.tvOn?(reduced?0:Math.floor(time/250)%24):-2;if(frame===lastFrame)return;lastFrame=frame;screen.clear();if(!home?.tvOn)return;
  const {x,y,width:w,height:h}=HOUSE_TV_SCREEN;screen.fillStyle(0x80b8bd).fillRect(x,y,w,h);screen.fillStyle(0xe7e4aa).fillRect(x+w-9,y+3,4,4);screen.fillStyle(0x436c48).fillTriangle(x,y+h,x+15,y+9,x+w,y+h);screen.fillStyle(0x769c58).fillRect(x,y+h-6,w,6);screen.fillStyle(0xf0e8bf).fillRect(x+2+Math.max(0,frame)%12,y+4,7,2);screen.fillStyle(0xacc97b).fillRect(x+5,y+h-3,w-10,1);
 }});
}
