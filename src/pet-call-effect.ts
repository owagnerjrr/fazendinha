import Phaser from'phaser';import type{Avatar}from'./content';import{SKIN_TONES}from'./content';import{outfitSleeveColor}from'./outfit-art';import{effectsAudio}from'./sound';import{AvatarArt}from'./avatar-art';
let serial=0;
/** Authored pixel poses replace the native arms, rather than drawing extra arms over them. */
export class PetCallEffect{
 private g:Phaser.GameObjects.Graphics;private born:number;private art:AvatarArt;private key:string;active=true;
 constructor(private scene:Phaser.Scene,private position:()=>{x:number;y:number},private kind:'cat'|'dog',private avatar:Avatar,private actor:Phaser.GameObjects.Sprite,private freeze:()=>void=()=>{}){
  this.g=scene.add.graphics();this.born=scene.time.now;this.art=new AvatarArt(scene);this.key='pet-call-pose-'+(++serial);const source=scene.textures.get(this.art.key('farmer-v2',avatar)).getSourceImage() as HTMLCanvasElement,cv=document.createElement('canvas');cv.width=48*8;cv.height=64;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;
  const skin=SKIN_TONES[avatar.skin],shirt=outfitSleeveColor(avatar),outline='#3b3028',line=(x:number,y:number,tx:number,ty:number,color:string,size:number)=>{const n=Math.max(Math.abs(tx-x),Math.abs(ty-y));c.fillStyle=color;for(let j=0;j<=n;j++)c.fillRect(Math.round(x+(tx-x)*j/Math.max(1,n))-Math.floor(size/2),Math.round(y+(ty-y)*j/Math.max(1,n))-Math.floor(size/2),size,size);};
  for(let frame=0;frame<8;frame++){c.save();c.translate(frame*48,0);c.drawImage(source,0,0,48,64,0,0,48,64);c.clearRect(0,33,17,17);c.clearRect(31,33,17,17);line(17,35,14,42,outline,5);line(17,35,14,40,shirt,3);line(14,41,15,47,skin,3);
   const phase=[0,.4,.8,1,1,1,.5,0][frame],hand={x:Math.round(34-9*phase),y:Math.round(46-17*phase)},elbow={x:34,y:Math.round(41-4*phase)};line(30,35,elbow.x,elbow.y,outline,5);line(elbow.x,elbow.y,hand.x,hand.y,outline,4);line(30,35,elbow.x,elbow.y,shirt,3);line(elbow.x,elbow.y,hand.x,hand.y,skin,2);c.fillStyle=skin;c.fillRect(hand.x-1,hand.y-2,3,3);if(phase===1){c.fillStyle=outline;c.fillRect(23,29,1,1);if(kind==='dog'){c.fillStyle=skin;c.fillRect(24,28,3,1);}else{c.fillStyle=outline;c.fillRect(25,30,1,1);}}c.restore();}
  const texture=scene.textures.addCanvas(this.key,cv)!;scene.textures.addSpriteSheet('',texture,{frameWidth:48,frameHeight:64});effectsAudio.call(kind);scene.events.on('postupdate',this.update,this);scene.events.once('shutdown',this.destroy,this);
 }
 private update(time:number){if(!this.actor.scene){this.destroy();return;}const t=time-this.born;if(t>=1500){this.destroy();return;}this.freeze();const p=this.position(),frame=t<450?Math.min(3,Math.floor(t/150)):t<1100?(this.kind==='cat'&&Math.floor(t/140)%2?4:3):Math.min(7,5+Math.floor((t-1100)/140));this.actor.setTexture(this.key,frame).setOrigin(.5,62/64).setScale(1.08).setPosition(p.x,p.y-2).setDepth(p.y);
  this.g.clear().setDepth(p.y+2);const beat=(t%220)/220;if(t>400&&t<1150)for(let i=0;i<3;i++)this.g.fillStyle(0xf8e4a6,(1-beat)*.65).fillRect(Math.round(p.x+8+i*5+beat*3),Math.round(p.y-38+(i%2)*2),2,1);
 }
 destroy(){if(!this.active)return;this.active=false;this.scene.events.off('postupdate',this.update,this);this.scene.events.off('shutdown',this.destroy,this);this.g.destroy();this.scene.textures.remove(this.key);this.art.destroy();}
}
