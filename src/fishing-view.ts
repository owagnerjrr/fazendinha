import type Phaser from 'phaser';import type {Farm} from './farm';import {FISH_SPOT,nearFishing} from './fishing';
export class FishingView{
 private art:Phaser.GameObjects.Graphics;busy=false;
 constructor(private scene:Phaser.Scene,private farm:()=>Farm,private now:()=>number,private command:(c:{type:string})=>Promise<unknown>,private toast:(s:string)=>void){this.art=scene.add.graphics();}
 async use(){if(this.busy)return;this.busy=true;try{const result=await this.command({type:this.farm().fishing?.cast?'reel-line':'cast-line'}) as {message?:string};if(result.message&&result.message!=='Linha lançada.')this.toast(result.message);}catch(e){this.toast((e as Error).message);}finally{this.busy=false;}}
 async cancel(){if(!this.farm().fishing?.cast||this.busy)return;this.busy=true;try{await this.command({type:'cancel-line'});}catch(e){this.toast((e as Error).message);}finally{this.busy=false;}}
 update(player:{x:number;y:number},direction:string,selected:boolean,blocked:boolean){
  const state=this.farm().fishing,cast=state?.cast,now=this.now(),active=!!cast&&now<=cast.expiresAt;
  const button=document.getElementById('fish-action') as HTMLButtonElement;button.hidden=blocked||!state?.rod||!selected||!nearFishing(player);button.disabled=this.busy;button.setAttribute('aria-label',cast?'Recolher linha':'Lançar linha');button.classList.toggle('bite',!!cast&&now>=cast.biteAt&&now<=cast.expiresAt);
  this.art.clear();if(!selected&&!active)return;
  const side=active||direction==='right'?1:direction==='left'?-1:1,hand={x:Math.round(player.x+side*12),y:Math.round(player.y-25)},tip={x:hand.x+side*34,y:hand.y-46};
  this.art.setDepth(player.y+2).lineStyle(4,0x3a2c20).lineBetween(hand.x,hand.y,tip.x,tip.y).lineStyle(2,0xc5a16b).lineBetween(hand.x,hand.y,tip.x,tip.y).lineStyle(4,0x88623d).lineBetween(hand.x,hand.y,hand.x+side*7,hand.y-10);
  if(active&&cast){const bx=FISH_SPOT.x+78,by=FISH_SPOT.y+26+Math.sin(now/350)*(now>=cast.biteAt?3:1);this.art.lineStyle(1,0xe2dfbc,.8).lineBetween(tip.x,tip.y,bx,by);this.art.lineStyle(1,now>=cast.biteAt?0xeac875:0x91cbc4,.7).strokeEllipse(bx,by+3,14+Math.sin(now/230)*3,6);this.art.fillStyle(0xf0e3b7).fillRect(bx-2,by-4,4,5).fillStyle(0xd76a42).fillRect(bx-2,by,4,4);if(now>=cast.biteAt)this.art.fillStyle(0xffd77b).fillRect(bx-1,by-22,3,9).fillRect(bx-1,by-10,3,3);}
 }
}
