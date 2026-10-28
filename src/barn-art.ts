import Phaser from 'phaser';
import {barnMaterials} from './barn-materials';
import { ANIMALS, animalReady, type AnimalKind } from './content';
import { barnLayout,animalPose,type BarnPen } from './barn-layout';
import type { Farm } from './farm';
type Block=(x:number,y:number,w:number,h:number)=>void;
export type BarnActor={pen:BarnPen;index:number;sprite:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse};
export type RoomPoint={x:number;y:number;hitX?:number;hitY?:number;radius?:number;run:()=>void};
export function buildBarn(scene:Phaser.Scene,farm:Farm,block:Block,animals:(id?:string)=>void,equipment:()=>void){
 const points:RoomPoint[]=[],actors:BarnActor[]=[],labels:{pen:BarnPen;text:Phaser.GameObjects.Text}[]=[];
 const text=(x:number,y:number,label:string,size=10)=>scene.add.text(x,y,label,{fontFamily:'monospace',fontSize:`${size}px`,color:'#f5dfad',backgroundColor:'#493c2ee8',padding:{x:7,y:4}}).setOrigin(.5).setDepth(1300);
 barnMaterials(scene);const pens=barnLayout(farm.animals);
 const board=(x:number,y:number,w:number,h:number,depth:number,vertical=false)=>{const tile=scene.add.tileSprite(x,y,vertical?h:w,vertical?w:h,'barn-board').setOrigin(.5).setDepth(depth);if(vertical)tile.setRotation(Math.PI/2);return tile;};
 const aisle=scene.add.graphics().setDepth(1);aisle.fillStyle(0x604c33,.35);aisle.fillRect(531,250,137,550);aisle.lineStyle(2,0xbca16a,.5);aisle.lineBetween(538,260,538,782);aisle.lineBetween(661,260,661,782);
 // Reuse the original equipment sprite at a scale consistent with the player.
 const rackSource=scene.textures.get('life-rack').getSourceImage() as HTMLImageElement;scene.add.image(600,251,'life-rack').setOrigin(.5,1).setDisplaySize(55*rackSource.width/rackSource.height,55).setDepth(251);block(565,220,70,28);
 text(600,190,'CELEIRO DO VALE',14);text(600,263,'FERRAMENTAS',9);points.push({x:600,y:291,hitX:600,hitY:233,radius:38,run:equipment});
 for(const pen of pens){
  const {x,y,width:w,height:h}=pen;block(x,y,w,h);
  const floor=scene.add.graphics().setDepth(2);floor.fillStyle(0x30271b,.5);floor.fillRect(x-3,y+5,w+7,h+5);
  scene.add.tileSprite(x,y,w,h,'barn-bedding').setOrigin(0).setDepth(2.1);
  floor.setDepth(2.2).fillStyle(0x3f3020,.26).fillRect(x,y,w,11).fillRect(x,y,8,h);
  // Rear boards, feeding trough and water. They sit behind the animals.
  const rear=scene.add.graphics().setDepth(y+26);rear.fillStyle(0x513b28);rear.fillRect(x,y-3,w,7);rear.fillStyle(0xa47b45);rear.fillRect(x,y-7,w,5);rear.lineStyle(1,0xe5c38a,.5);for(let k=12;k<w;k+=38){rear.lineBetween(x+k,y-6,x+k+20,y-6);}
  board(x+w/2,y-1,w,10,y+27);scene.add.image(x+w-42,y+25,'barn-water').setOrigin(.5,1).setDisplaySize(58,25).setDepth(y+28);
  if(pen.kind==='chicken'){
   for(let n=0;n<3;n++)scene.add.image(x+39+n*51,y+32,'barn-nest').setOrigin(.5,1).setDepth(y+33);
   rear.lineStyle(4,0x62462d);rear.lineBetween(x+170,y+22,x+210,y+22);rear.lineBetween(x+174,y+18,x+174,y+37);rear.lineBetween(x+206,y+18,x+206,y+37);
  }else scene.add.image(x+20,y+29,'barn-trough').setOrigin(0,1).setDisplaySize(pen.kind==='dog'?50:108,24).setDepth(y+30);
  const front=scene.add.graphics().setDepth(y+h+10);front.fillStyle(0x65482d);front.fillRect(x,y+h-2,w,6);front.fillStyle(0xb18b51);front.fillRect(x,y+h-6,w,4);front.lineStyle(1,0xe4bf80,.45);for(let k=8;k<w-20;k+=37)front.lineBetween(x+k,y+h-5,x+k+20,y+h-5);
  // Closed wooden gates face the central corridor. Their footprint is part of the pen collider.
  for(const edge of [x,x+w-6]){front.fillStyle(0x63472e);front.fillRect(edge,y,6,h);for(const postY of [y,y+h-13]){front.fillStyle(0x785631);front.fillRect(edge-3,postY,12,21);front.fillStyle(0xc49b5c);front.fillRect(edge-3,postY,12,4);}}
  board(x+w/2,y+h-1,w,12,y+h+11);for(const edge of [x+3,x+w-3])board(edge,y+h/2,9,h+8,y+h+12,true);
  const gateX=pen.side==='left'?x+w-10:x-2;const gate=scene.add.graphics().setDepth(y+h+13);gate.lineStyle(3,0xc09759);gate.strokeRect(gateX,y+39,12,39);gate.lineBetween(gateX,y+42,gateX+12,y+75);
  const plaque=text(x+w/2,y-15,pen.purpose.toUpperCase(),9);labels.push({pen,text:plaque});
  if(pen.animals.length){
   points.push({...pen.access,hitX:gateX+6,hitY:y+58,radius:26,run:()=>animals()});
   pen.animals.forEach((a,index)=>{ensureBlink(scene,a.kind);const pose=animalPose(pen,index,0);const shadow=scene.add.ellipse(pose.x,pose.y-2,pose.width*.72,pose.width*.21,0x332d20,.35).setDepth(pose.y-.2);const sprite=scene.add.image(pose.x,pose.y,`life-${a.kind}`).setOrigin(.5,1).setDisplaySize(pose.width,pose.height).setDepth(pose.y);actors.push({pen,index,sprite,shadow});points.push({...pen.access,hitX:pose.x,hitY:pose.y-pose.height/2,radius:Math.max(15,pose.width*.48),run:()=>animals(a.id)});});
  }else{
   // Available pens have useful storage, never large empty placeholder labels.
   for(let n=0;n<2+(pen.id%2);n++){const hx=x+59+n*65+(pen.id%3)*6,hy=y+83+((n+pen.id)%2)*5;scene.add.image(hx,hy,'barn-hay').setOrigin(.5,1).setDepth(hy);}
   scene.add.image(x+w-75,y+91,'barn-sack').setOrigin(.5,1).setDepth(y+91);scene.add.image(x+w-42,y+85,'barn-sack').setOrigin(.5,1).setScale(.85).setDepth(y+85);

  }
 }
 text(600,800,'SAÍDA',10);
 return {points,actors,update(time:number,current:Farm,now:number){
  for(const a of actors){const pose=animalPose(a.pen,a.index,time),kind=a.pen.animals[a.index].kind;
   if(pose.dog&&scene.textures.exists('dog-walk')&&scene.textures.exists('dog-rest'))a.sprite.setTexture(pose.dog.walking?'dog-walk':'dog-rest',pose.dog.walking?pose.dog.frame:(pose.dog.resting?4:0)+pose.dog.facing);
   else a.sprite.setTexture(`life-${kind}${pose.blink?'-blink':''}`);
   a.sprite.setPosition(pose.x,pose.y).setDisplaySize(pose.width,pose.height).setFlipX(pose.flip).setAngle(pose.eating?(pose.flip?-4:4):0).setDepth(pose.y);a.shadow.setPosition(pose.x,pose.y-2).setDepth(pose.y-.2);
  }
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
