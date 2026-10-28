import Phaser from 'phaser';import {ANIMAL_SIZE} from './barn-layout';import {animalReady,type Animal} from './content';import {outdoorBox} from './housing';import {livestockMotion} from './livestock-motion';import {livestockArt} from './livestock-art';import {AnimalIndicators} from './animal-indicators';import type {Farm} from './farm';
type Item={animal:Animal;image:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse;icons:AnimalIndicators;box:ReturnType<typeof outdoorBox>;index:number;count:number;spot:{x:number;y:number};access:{x:number;y:number}};
export class OutdoorAnimals{
 private items:Item[]=[];private signature='';private nextSignature=0;
 constructor(private scene:Phaser.Scene,private farm:()=>Farm,private now:()=>number,private animals:(id?:string)=>void,private collect:(id:string)=>void){}
 update(time:number){const f=this.farm();
  if(time>=this.nextSignature){this.nextSignature=time+300;const sig=JSON.stringify([f.buildings,f.animals.map(a=>[a.id,a.kind,a.housing])]);if(sig!==this.signature){this.signature=sig;this.rebuild(f);}}
  for(const item of this.items){const live=f.animals.find(a=>a.id===item.animal.id);if(!live)continue;item.animal=live;const size=ANIMAL_SIZE[live.kind],p=livestockMotion(item.box,item.index,item.count,size,time,item.box.x);
   item.image.setTexture(p.walking?`walk-${live.kind}`:`life-${live.kind}`,p.walking?p.frame:undefined).setDisplaySize(size.width,size.height).setPosition(p.x,p.y).setFlipX(p.flip).setDepth(p.y);
   item.shadow.setPosition(p.x,p.y-2).setDepth(p.y-.2);item.icons.update(live,this.now(),p.x,p.y,size.height,item.spot);
  }
 }
 private rebuild(f:Farm){for(const i of this.items){i.image.destroy();i.shadow.destroy();i.icons.destroy();}this.items=[];livestockArt(this.scene);
  for(const b of f.buildings??[]){if(!['coop','pasture'].includes(b.kind))continue;const box=outdoorBox(b),animals=f.animals.filter(a=>a.housing===b.id),access={x:box.x+box.width/2,y:box.y+box.height+20};
   animals.forEach((animal,index)=>{const size=ANIMAL_SIZE[animal.kind],p=livestockMotion(box,index,animals.length,size,0),image=this.scene.add.image(p.x,p.y,`life-${animal.kind}`).setOrigin(.5,1).setDisplaySize(size.width,size.height),shadow=this.scene.add.ellipse(p.x,p.y-2,size.width*.7,8,0x2b432c,.25),spot={x:box.x+15+(index%3)*27+(index>=3?8:0),y:box.y+28+(index>=3?3:0)};this.items.push({animal,image,shadow,icons:new AnimalIndicators(this.scene),box,index,count:animals.length,spot,access});});
  }
 }
 hit(p:{x:number;y:number}){
  const now=this.now();for(const i of this.items){if(i.icons.product.visible&&Math.hypot(p.x-i.spot.x,p.y-i.spot.y+6)<14)return{...i.access,run:()=>animalReady(i.animal,this.now())?this.collect(i.animal.id):this.animals(i.animal.id)};}
  for(const i of this.items){if(Math.abs(p.x-i.image.x)<i.image.displayWidth/2&&p.y<i.image.y&&p.y>i.image.y-i.image.displayHeight)return{...i.access,run:()=>this.animals(i.animal.id)};}return null;
 }
 interact(p:{x:number;y:number}){const item=this.items.find(i=>Math.hypot(p.x-i.access.x,p.y-i.access.y)<75);if(!item)return false;const ready=this.items.find(i=>i.animal.housing===item.animal.housing&&animalReady(i.animal,this.now()));if(ready)this.collect(ready.animal.id);else this.animals(item.animal.id);return true;}
 contact(id:string){const item=this.items.find(i=>i.animal.id===id);return item?{x:item.image.x,y:item.image.y}:null;}
 distance(p:{x:number;y:number}){return this.items.reduce((n,i)=>Math.min(n,Math.hypot(p.x-i.access.x,p.y-i.access.y)),Infinity);}
}
