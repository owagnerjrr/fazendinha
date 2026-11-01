import{duckActing,duckPalm}from'./duck-play-art';
import Phaser from'phaser';import type{Avatar}from'./content';import{SKIN_TONES}from'./content';import type{AvatarArt}from'./avatar-art';import{nearbyLeisure,duckToy,type LeisureTarget}from'./south-leisure-rules';
/** Local scene activity only: no inventory, health, currency or ownership changes. */
export class SouthLeisure{
 active?:LeisureTarget;private started=0;private graphics:Phaser.GameObjects.Graphics;
 constructor(private scene:Phaser.Scene){this.graphics=scene.add.graphics().setDepth(1900);scene.events.once('shutdown',()=>this.stop());}
 start(target:LeisureTarget,p:{x:number;y:number}){if(Math.hypot(p.x-target.point.x,p.y-target.point.y)>54)return false;this.active=target;this.started=this.scene.time.now;if(target.kind==='ducks')this.scene.data.set('south-duck-play',{pond:'pond'in target?target.pond:0,started:this.started});return true;}
 stop(){this.active=undefined;this.scene.data.remove('south-duck-play');this.graphics.clear();}
 label(p:{x:number;y:number}){return this.active?(this.active.kind==='sit'?'Levantar':this.active.kind==='picnic'?'Encerrar piquenique':'Encerrar interação'):nearbyLeisure(p)?.label;}
 draw(actor:Phaser.GameObjects.Sprite,art:AvatarArt,avatar:Avatar,time:number){const target=this.active,g=this.graphics;g.clear();if(!target)return;const elapsed=time-this.started,sitting=target.kind==='sit'||target.kind==='picnic';
 if(sitting)actor.setTexture(art.key('pose-sit-front',avatar)).setOrigin(.5,55/64).setPosition(target.seat.x,target.seat.y).setDepth(target.seat.y+4).setScale(1.08);
 else actor.setTexture(art.key(target.kind==='ducks'?'pose-duck-play':'farmer-v2',avatar),target.kind==='ducks'?('pond'in target&&target.pond===1?0:4)+duckActing(elapsed).frame:0).setOrigin(.5,62/64).setScale(1.08);
 const skin=avatar.outfit==='forest'?0x795031:avatar.outfit==='nebula'?0xa266b4:parseInt(SKIN_TONES[avatar.skin].slice(1),16),x=actor.x,y=actor.y;
 if(target.kind==='picnic'){const lift=(Math.sin(elapsed/650)+1)/2,hy=y-20-lift*13;g.lineStyle(4,skin).lineBetween(x+9,y-28,x+12,hy);g.fillStyle(0xd6a758).fillRect(x+8,hy-3,9,5).fillStyle(0xf2d99a).fillRect(x+8,hy-4,9,2).fillStyle(0x75944a).fillRect(x+9,hy-1,7,1);}
 if(target.kind==='ducks'){
  const pond='pond'in target?target.pond:0,acting=duckActing(elapsed),water=duckToy(pond,time,this.started),palm=duckPalm(pond===0?1:0,elapsed<650?acting.frame:2),start={x:x+(palm.x-24)*1.08,y:y+(palm.y-62)*1.08},p=acting.flight,e=p*p*(3-2*p),toy={x:start.x+(water.x-start.x)*e,y:start.y+(water.y-start.y)*e-Math.sin(p*Math.PI)*26},size=.65+.35*p;
  g.fillStyle(0x83633f).fillRect(Math.round(toy.x-7*size),Math.round(toy.y),Math.round(15*size),Math.round(4*size)).fillStyle(0xf0d5a5).fillTriangle(toy.x,toy.y,toy.x,toy.y-12*size,toy.x+8*size,toy.y).fillStyle(0x4b6960).fillRect(Math.round(toy.x-1),Math.round(toy.y-11*size),1,Math.round(12*size));
  if(acting.landed){const splash=Math.max(0,1-(elapsed-1400)/550);g.lineStyle(1,0xc5e9d5,.65).strokeEllipse(water.x,water.y+5,24+Math.sin(elapsed/300)*5,7);for(let i=0;i<5&&splash>0;i++)g.fillStyle(0xd3efdc,splash).fillRect(water.x-12+i*6,water.y-3-Math.sin(i+1)*splash*9,2,2);}
 }
 if(target.kind==='flowers'){const hy=y-24-Math.sin(elapsed/600)*3;g.lineStyle(3,skin).lineBetween(x+8,y-29,x+11,hy);for(let i=0;i<3;i++)g.fillStyle([0xe5b1c8,0xe8d596,0xb9acd6][i]).fillRect(x+9+i*3,hy-5-i%2*3,4,4);g.lineStyle(1,0x688745).lineBetween(x+13,hy-2,x+11,hy+5);}
 }
}
