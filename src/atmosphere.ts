import Phaser from 'phaser';
import {newWeather,advanceWeather,windAmount,birdPosition} from './weather-state';
type Ambient=Phaser.GameObjects.Image|Phaser.GameObjects.Rectangle;
export class Atmosphere {
 private state=newWeather();private graphics:Phaser.GameObjects.Graphics;private shadows:Phaser.GameObjects.Graphics;private reduced=matchMedia('(prefers-reduced-motion: reduce)');private wasReduced:boolean|undefined;private foliage:{image:Phaser.GameObjects.Image;angle:number;phase:number}[];
 constructor(private scene:Phaser.Scene,trees:Phaser.GameObjects.Image[],private ambient:Ambient[]=[]){
  this.graphics=scene.add.graphics().setDepth(1800);this.shadows=scene.add.graphics().setDepth(3);this.foliage=trees.map((image,i)=>({image,angle:image.angle,phase:i*.83}));
  scene.events.once('shutdown',()=>{for(const f of this.foliage)if(f.image.active)f.image.setAngle(f.angle);});
 }
 update(time:number){
  this.graphics.clear();this.shadows.clear();const reduced=this.reduced.matches;
  if(reduced!==this.wasReduced){for(const node of this.ambient){node.setVisible(!reduced);for(const tween of this.scene.tweens.getTweensOf(node))reduced?tween.pause():tween.resume();}this.wasReduced=reduced;}
  advanceWeather(this.state,time,this.scene.scale.width<600,reduced);const wind=windAmount(this.state,time,reduced);
  for(const f of this.foliage)if(f.image.active)f.image.setAngle(f.angle+Math.sin(time/(1300+(f.phase%4)*110)+f.phase)*wind);
  if(reduced)return;
  for(const leaf of this.state.leaves){const t=time-leaf.born;if(t<0)continue;const x=leaf.x+t*leaf.speed,y=leaf.y+Math.sin(t/330)*11;this.graphics.fillStyle(t%600<300?0xc5b76a:0xe0c784,.55*(1-t/4200));this.graphics.fillRect(Math.round(x),Math.round(y),3,2);this.graphics.fillRect(Math.round(x+1),Math.round(y-1),2,1);}
  for(const b of this.state.birds){if(time<b.born)continue;const p=birdPosition(b,time);if(p.x<20||p.x>1570)continue;
   this.shadows.fillStyle(0x233729,.10).fillEllipse(p.x-12,p.y+76,14,4);
   this.graphics.lineStyle(2,0x383b32,.82).lineBetween(p.x-8,p.y-p.wing,p.x-3,p.y-2).lineBetween(p.x-3,p.y-2,p.x,p.y).lineBetween(p.x,p.y,p.x+3,p.y-2).lineBetween(p.x+3,p.y-2,p.x+8,p.y-p.wing);this.graphics.fillStyle(0x45463a,.85).fillRect(Math.round(p.x-1),Math.round(p.y-2),3,4);
  }
 }
}
