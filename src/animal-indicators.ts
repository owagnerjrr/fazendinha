import type Phaser from 'phaser';import {animalNeeds} from './animal-needs';import {ANIMALS,animalReady,type Animal} from './content';import {livestockArt} from './livestock-art';
function icons(scene:Phaser.Scene){livestockArt(scene);for(const [kind,color] of [['food','#d6b25b'],['water','#8dd9e0'],['clean','#c5bd81'],['sick','#f0a186'],['milk','#d3e4d4']]){const key=`need-${kind}`;if(scene.textures.exists(key))continue;const cv=document.createElement('canvas');cv.width=12;cv.height=14;const c=cv.getContext('2d')!;c.fillStyle='#344433';c.fillRect(0,0,12,14);c.fillStyle=color;
 if(kind==='sick'){c.fillRect(5,3,3,9);c.fillRect(2,6,9,3);}else if(kind==='water'){for(let y=3;y<11;y++){const width=y<8?y-1:6;c.fillRect(6-Math.floor(width/2),y,width,1);}}else if(kind==='milk'){c.fillRect(3,4,7,8);c.fillStyle='#8bb9b4';c.fillRect(4,2,5,3);c.fillStyle='#f5efcf';c.fillRect(4,6,2,5);}else{c.fillRect(2,8,8,3);c.fillRect(3,5,6,2);c.fillRect(5,3,3,2);}scene.textures.addCanvas(key,cv);}}
export class AnimalIndicators{
 readonly need:Phaser.GameObjects.Image;readonly product:Phaser.GameObjects.Image;
 constructor(scene:Phaser.Scene){icons(scene);this.need=scene.add.image(0,0,'need-food').setOrigin(.5,1).setVisible(false);this.product=scene.add.image(0,0,'farm-egg').setOrigin(.5,1).setVisible(false);}
 update(a:Animal,now:number,x:number,y:number,height:number,spot:{x:number;y:number}){
  const n=animalNeeds(a,now),kind=n.sick?'sick':n.food<=25?'food':n.water<=25?'water':n.clean<=25?'clean':null;
  this.need.setVisible(!!a.care&&!!kind).setPosition(x,y-height-3).setDepth(y+1);if(kind)this.need.setTexture(`need-${kind}`);
  const ready=animalReady(a,now),incubating=a.kind==='chicken'&&a.incubationAt!=null;
  this.product.setVisible(ready||incubating).setTexture(ANIMALS[a.kind].product==='egg'||incubating?'farm-egg':'need-milk').setPosition(spot.x,spot.y).setDepth(spot.y+1).setTint(!ready&&incubating?0xe3c968:0xffffff);
 }
 destroy(){this.need.destroy();this.product.destroy();}
}
