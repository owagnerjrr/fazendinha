import Phaser from 'phaser';import {dogArt,dogTexture} from '../src/dog-art';import {dogAppearance,type DogGait} from '../src/dog-motion';
class DogQA extends Phaser.Scene{
 private dog!:Phaser.GameObjects.Image;private elapsed=0;private phase=0;private gait:DogGait={facing:2,distance:0,frame:8,lastMovedAt:0};
 preload(){for(const k of ['walk','rest'])this.load.spritesheet(`dog-${k}`,`/assets/v7/dog-${k}.png`,{frameWidth:48,frameHeight:48});}
 create(){dogArt(this);let good=true;
  for(const walking of [true,false])for(let i=0;i<(walking?16:8);i++){const tex=this.textures.get(dogTexture(walking,i)),canvas=tex.getSourceImage() as HTMLCanvasElement,pixels=canvas.getContext('2d')!.getImageData(0,0,48,48).data;
   if(canvas.width!==48||canvas.height!==48||tex.frameTotal!==1)good=false;for(let n=3;n<pixels.length;n+=4)if(pixels[n]!==0&&pixels[n]!==255)good=false;
   const x=90+i%4*140+(walking?0:620),y=95+Math.floor(i/4)*140;this.add.rectangle(x,y,104,108,0x7b9470).setStrokeStyle(1,0xb5c998);this.add.image(x,y,dogTexture(walking,i)).setScale(2);this.add.text(x-38,y+55,`${walking?'passo':'repouso'} ${i}`,{fontSize:'12px'});
  }
  const gait:DogGait={facing:2,distance:0,frame:8,lastMovedAt:0};let seated=0;for(let n=0;n<240;n++)if(!dogAppearance(gait,n%2?1.5:0,0,n*1000/120).walking)seated++;
  document.getElementById('result')!.textContent=good&&seated===0?'PASS · 24 texturas independentes 48×48, alfa 0/255. 240 ticks com pausas da física: 0 trocas para sentado durante caminhada.':'FALHA';
  this.add.rectangle(920,565,520,100,0x7b9470);this.dog=this.add.image(730,595,dogTexture(true,8)).setOrigin(.5,1).setScale(2);
 }
 update(_time:number,delta:number){if(!this.dog)return;this.elapsed+=delta;const tick=Math.floor(this.elapsed/16.67);if(tick===this.phase)return;this.phase=tick;const moving=this.elapsed%14000<6500,dx=moving&&tick%2?1.5:0,look=dogAppearance(this.gait,dx,0,this.elapsed);this.dog.setTexture(dogTexture(look.walking,look.frame)).setX(720+this.gait.distance%420);}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',pixelArt:true,scale:{mode:Phaser.Scale.FIT,width:1240,height:700},scene:[DogQA]});
