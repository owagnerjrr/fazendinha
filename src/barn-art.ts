import Phaser from 'phaser';
import { ANIMALS, animalReady, type AnimalKind } from './content';
import { barnLayout,animalPose,type BarnPen } from './barn-layout';
import type { Farm } from './farm';
type Block=(x:number,y:number,w:number,h:number)=>void;
export type BarnActor={pen:BarnPen;index:number;sprite:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse};
export type RoomPoint={x:number;y:number;hitX?:number;hitY?:number;radius?:number;run:()=>void};
export function buildBarn(scene:Phaser.Scene,farm:Farm,block:Block,animals:(id?:string)=>void,equipment:()=>void){
 const points:RoomPoint[]=[],actors:BarnActor[]=[],labels:{pen:BarnPen;text:Phaser.GameObjects.Text}[]=[];
 const text=(x:number,y:number,label:string,size=10)=>scene.add.text(x,y,label,{fontFamily:'monospace',fontSize:`${size}px`,color:'#f5dfad',backgroundColor:'#493c2ee8',padding:{x:7,y:4}}).setOrigin(.5).setDepth(1300);
 const pens=barnLayout(farm.animals);
 const aisle=scene.add.graphics().setDepth(1);aisle.fillStyle(0x604c33,.35);aisle.fillRect(531,250,137,550);aisle.lineStyle(2,0xbca16a,.5);aisle.lineBetween(538,260,538,782);aisle.lineBetween(661,260,661,782);
 // Reuse the original equipment sprite at a scale consistent with the player.
 scene.add.image(600,251,'life-rack').setOrigin(.5,1).setDisplaySize(70,70).setDepth(251);block(565,220,70,28);
 text(600,190,'CELEIRO DO VALE',14);text(600,263,'FERRAMENTAS',9);points.push({x:600,y:291,hitX:600,hitY:233,radius:38,run:equipment});
 for(const pen of pens){
  const {x,y,width:w,height:h}=pen;block(x,y,w,h);
  const floor=scene.add.graphics().setDepth(2);floor.fillStyle(0x55402b,.3);floor.fillRoundedRect(x-3,y+7,w+6,h+5,6);floor.fillStyle(0x8b713d);floor.fillRect(x,y,w,h);
  floor.fillStyle(0x5b4528,.32);floor.fillEllipse(x+w/2+3,y+72,w-18,76);floor.fillStyle(0xc3a45d,.5);floor.fillEllipse(x+w/2,y+66,w-24,73);floor.lineStyle(1,0xe0bb69,.65);
  for(let j=0;j<70;j++){const sx=x+13+(j*47+pen.id*19)%(w-26),sy=y+20+(j*23)%(h-29);floor.lineBetween(sx,sy,sx+5,sy-2);}
  // Rear boards, feeding trough and water. They sit behind the animals.
  const rear=scene.add.graphics().setDepth(y+26);rear.fillStyle(0x513b28);rear.fillRect(x,y-3,w,7);rear.fillStyle(0xa47b45);rear.fillRect(x,y-7,w,5);rear.lineStyle(1,0xe5c38a,.5);for(let k=12;k<w;k+=38){rear.lineBetween(x+k,y-6,x+k+20,y-6);}
  rear.fillStyle(0x584431);rear.fillRoundedRect(x+w-69,y+11,54,19,3);rear.fillStyle(0x649caa);rear.fillEllipse(x+w-42,y+17,41,9);rear.lineStyle(1,0xb1d3ca,.8);rear.lineBetween(x+w-56,y+15,x+w-33,y+15);
  if(pen.kind==='chicken'){
   for(let n=0;n<3;n++){const nx=x+18+n*51;rear.fillStyle(0x6c4b2e);rear.fillRect(nx,y+5,43,26);rear.fillStyle(0xd0ad5e);rear.fillEllipse(nx+21,y+24,34,12);rear.fillStyle(0xeee0b6);rear.fillEllipse(nx+22,y+20,8,10);}
   rear.lineStyle(4,0x62462d);rear.lineBetween(x+170,y+22,x+210,y+22);rear.lineBetween(x+174,y+18,x+174,y+37);rear.lineBetween(x+206,y+18,x+206,y+37);
  }else{
   rear.fillStyle(0x5f4830);rear.fillRect(x+18,y+11,pen.kind==='dog'?48:110,16);rear.fillStyle(0xb79c51);rear.fillRect(x+23,y+12,pen.kind==='dog'?38:100,7);
  }
  const front=scene.add.graphics().setDepth(y+h+10);front.fillStyle(0x65482d);front.fillRect(x,y+h-2,w,6);front.fillStyle(0xb18b51);front.fillRect(x,y+h-6,w,4);front.lineStyle(1,0xe4bf80,.45);for(let k=8;k<w-20;k+=37)front.lineBetween(x+k,y+h-5,x+k+20,y+h-5);
  // Closed wooden gates face the central corridor. Their footprint is part of the pen collider.
  for(const edge of [x,x+w-6]){front.fillStyle(0x63472e);front.fillRect(edge,y,6,h);for(const postY of [y,y+h-13]){front.fillStyle(0x785631);front.fillRect(edge-3,postY,12,21);front.fillStyle(0xc49b5c);front.fillRect(edge-3,postY,12,4);}}
  const gateX=pen.side==='left'?x+w-10:x-2;front.lineStyle(3,0xc09759);front.strokeRect(gateX,y+39,12,39);front.lineBetween(gateX,y+42,gateX+12,y+75);
  const plaque=text(x+w/2,y-15,pen.purpose.toUpperCase(),9);labels.push({pen,text:plaque});
  if(pen.animals.length){
   points.push({...pen.access,hitX:gateX+6,hitY:y+58,radius:26,run:()=>animals()});
   pen.animals.forEach((a,index)=>{ensureBlink(scene,a.kind);const pose=animalPose(pen,index,0);const shadow=scene.add.ellipse(pose.x,pose.y-2,pose.width*.72,pose.width*.21,0x332d20,.35).setDepth(pose.y-.2);const sprite=scene.add.image(pose.x,pose.y,`life-${a.kind}`).setOrigin(.5,1).setDisplaySize(pose.width,pose.height).setDepth(pose.y);actors.push({pen,index,sprite,shadow});points.push({...pen.access,hitX:pose.x,hitY:pose.y-pose.height/2,radius:Math.max(15,pose.width*.48),run:()=>animals(a.id)});});
  }else{
   // Available pens have useful storage, never large empty placeholder labels.
   const decor=scene.add.graphics().setDepth(y+85);for(let n=0;n<3;n++){const hx=x+40+n*67,hy=y+55+(n%2)*10;decor.fillStyle(0x5c4529,.3);decor.fillEllipse(hx+25,hy+24,59,18);decor.fillStyle(n%2?0xc3a45b:0xb18e47);decor.fillRoundedRect(hx,hy-10,54,32,4);decor.lineStyle(2,0x7b6539);decor.lineBetween(hx+14,hy-10,hx+14,hy+22);decor.lineBetween(hx+40,hy-10,hx+40,hy+22);decor.lineStyle(1,0xe2c578,.8);for(let k=0;k<4;k++)decor.lineBetween(hx+4,hy+k*6,hx+50,hy+k*6-4);}
   const sx=x+w-90;decor.fillStyle(0xc2af7d);decor.fillRoundedRect(sx,y+52,28,36,8);decor.fillStyle(0x827950);decor.fillRect(sx+5,y+65,18,10);decor.lineStyle(3,0x6e5030);decor.lineBetween(sx+42,y+30,sx+42,y+85);decor.lineStyle(2,0x909482);decor.lineBetween(sx+32,y+31,sx+52,y+31);
  }
 }
 text(600,800,'SAÍDA',10);
 return {points,actors,update(time:number,current:Farm,now:number){
  for(const a of actors){const pose=animalPose(a.pen,a.index,time);a.sprite.setTexture(`life-${a.pen.animals[a.index].kind}${pose.blink?'-blink':''}`).setPosition(pose.x,pose.y).setDisplaySize(pose.width,pose.height).setFlipX(pose.flip).setAngle(pose.eating?(pose.flip?-4:4):0).setDepth(pose.y);a.shadow.setPosition(pose.x,pose.y-2).setDepth(pose.y-.2);}
  for(const {pen,text} of labels){const ready=pen.animals.filter(a=>{const live=current.animals.find(v=>v.id===a.id);return live&&animalReady(live,now);}).length;text.setText(`${pen.purpose.toUpperCase()}${ready?' · '+ready+' PRONTO(S)':''}`);}
 }};
}
function ensureBlink(scene:Phaser.Scene,kind:AnimalKind){
 const key=`life-${kind}-blink`;if(scene.textures.exists(key))return;
 const source=scene.textures.get(`life-${kind}`).getSourceImage() as HTMLImageElement;
 const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;const c=canvas.getContext('2d')!;c.drawImage(source,0,0);
 const eye:Record<AnimalKind,[number,number]>={cow:[.72,.42],goat:[.72,.39],chicken:[.80,.35],dog:[.67,.34]};const [px,py]=eye[kind],x=Math.round(px*source.width),y=Math.round(py*source.height),fur=c.getImageData(Math.max(0,x-5),y,1,1).data;
 c.fillStyle=`rgb(${fur[0]},${fur[1]},${fur[2]})`;c.fillRect(x-3,y-3,6,6);c.fillStyle='#3c2c20';c.fillRect(x-3,y,6,1);scene.textures.addCanvas(key,canvas);
}
