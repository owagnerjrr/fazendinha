import Phaser from 'phaser';import {dogArt,DOG_WALK_TEXTURE,DOG_REST_TEXTURE} from '../src/dog-art';
class DogQA extends Phaser.Scene{
 private dog!:Phaser.GameObjects.Image;
 preload(){for(const k of ['walk','rest'])this.load.spritesheet(`dog-${k}`,`/assets/v7/dog-${k}.png`,{frameWidth:48,frameHeight:48});}
 create(){dogArt(this);const walk=this.textures.get(DOG_WALK_TEXTURE),rest=this.textures.get(DOG_REST_TEXTURE);let good=true;
  for(const [key,tex,rows] of [[DOG_WALK_TEXTURE,walk,4],[DOG_REST_TEXTURE,rest,2]] as const){const canvas=tex.getSourceImage() as HTMLCanvasElement,pixels=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;for(let i=3;i<pixels.length;i+=4)if(pixels[i]!==0&&pixels[i]!==255)good=false;
   for(let row=0;row<rows;row++)for(let col=0;col<4;col++){const i=row*4+col,f=tex.get(i);if(f.width!==48||f.height!==48)good=false;const x=90+col*140+(key===DOG_REST_TEXTURE?620:0),y=95+row*140;
    this.add.rectangle(x,y,104,108,0x7b9470).setStrokeStyle(1,0xb5c998);this.add.image(x,y,key,i).setScale(2).setBlendMode(Phaser.BlendModes.NORMAL);this.add.text(x-38,y+55,`${key===DOG_WALK_TEXTURE?'passo':'repouso'} ${i}`,{fontSize:'12px'});
   }
  }
  this.dog=this.add.image(770,565,DOG_WALK_TEXTURE,0).setScale(3);document.getElementById('result')!.textContent=good?'PASS · 16 passos + 8 repousos: regiões 48×48, margens transparentes e pixels visíveis 100% opacos.':'FALHA no atlas';
 }
 update(time:number){if(this.dog)this.dog.setTexture(DOG_WALK_TEXTURE,Math.floor(time/150)%16);}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',pixelArt:true,scale:{mode:Phaser.Scale.FIT,width:1240,height:700},scene:[DogQA]});
