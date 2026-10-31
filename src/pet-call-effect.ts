import Phaser from'phaser';import type{Avatar}from'./content';import{SKIN_TONES}from'./content';import{outfitSleeveColor}from'./outfit-art';import{effectsAudio}from'./sound';
/** Hand-to-mouth gesture and expanding breath rings, positioned against the actor's feet. */
export class PetCallEffect{
 private g:Phaser.GameObjects.Graphics;private born:number;active=true;
 constructor(private scene:Phaser.Scene,private position:()=>{x:number;y:number},private kind:'cat'|'dog',private avatar:Avatar){this.g=scene.add.graphics();this.born=scene.time.now;effectsAudio.call(kind);scene.events.on('update',this.update,this);scene.events.once('shutdown',this.destroy,this);}
 private update(time:number){const t=time-this.born;if(t>1500){this.destroy();return;}const p=this.position(),skin=parseInt(SKIN_TONES[this.avatar.skin].slice(1),16),shirt=parseInt(outfitSleeveColor(this.avatar).slice(1),16),fade=Math.min(1,t/150,(1500-t)/250),beat=this.kind==='cat'?Math.floor(t/200)%4:Math.floor(t/350)%2;
 this.g.clear().setDepth(p.y+5).setAlpha(Math.max(0,fade));this.g.lineStyle(5,shirt).lineBetween(p.x+9,p.y-29,p.x+18,p.y-38).lineStyle(3,skin).lineBetween(p.x+18,p.y-38,p.x+5,p.y-45).fillStyle(skin).fillRect(p.x+2,p.y-48,6,5).fillStyle(0x67462f).fillRect(p.x+1,p.y-45,2,1);
 const phase=(t%(this.kind==='cat'?200:350))/(this.kind==='cat'?200:350);for(let i=0;i<2;i++){const r=7+phase*13+i*6;this.g.lineStyle(1,0xffedb1,(1-phase)*.8).beginPath().arc(p.x+8,p.y-45,r,-.65,.65,false).strokePath();}if(this.kind==='cat')for(let i=0;i<=beat;i++)this.g.fillStyle(0xffefc2,.85).fillRect(p.x+23+i*8,p.y-58-(i%2)*3,3,2);
 }
 destroy(){if(!this.active)return;this.active=false;this.scene.events.off('update',this.update,this);this.scene.events.off('shutdown',this.destroy,this);this.g.destroy();}
}
