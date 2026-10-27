import Phaser from 'phaser';
type Bird={start:number;y:number;speed:number;phase:number};
export class Atmosphere {
 private birds:Bird[]=[];private last=0;private graphics:Phaser.GameObjects.Graphics;private shadows:Phaser.GameObjects.Graphics;private reduced=matchMedia('(prefers-reduced-motion: reduce)');
 constructor(private scene:Phaser.Scene, trees:Phaser.GameObjects.Image[]){
  this.graphics=scene.add.graphics().setDepth(1800);this.shadows=scene.add.graphics().setDepth(3);
  if(!this.reduced.matches) trees.forEach((tree,i)=>scene.tweens.add({targets:tree,angle:i%2?1.2:-1.2,duration:2100+(i*137)%1300,delay:(i*391)%1100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
 }
 update(time:number){
  this.graphics.clear();this.shadows.clear();
  if(this.reduced.matches){this.birds=[];return;}
  if(time-this.last>10000){this.last=time;const max=this.scene.scale.width<600?1:3;for(let i=0;i<max;i++)this.birds.push({start:time+i*650,y:250+i*35,speed:0.10+i*.012,phase:i});}
  this.birds=this.birds.filter(b=>time-b.start<18000);
  for(const b of this.birds){const elapsed=time-b.start;if(elapsed<0)continue;const x=80+elapsed*b.speed,y=b.y+Math.sin(elapsed/1100+b.phase)*16;if(x>1510)continue;const wing=3+Math.abs(Math.sin(elapsed/130))*5;
   this.shadows.fillStyle(0x253a29,.12).fillEllipse(x,y+75,13,4);
   this.graphics.lineStyle(2,0x40382d,.65).lineBetween(x-8,y-wing,x,y).lineBetween(x,y,x+8,y-wing);
  }
 }
}
