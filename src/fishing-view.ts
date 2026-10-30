import type Phaser from 'phaser';import type {Farm} from './farm';import {FISH,FISH_SPOT,nearFishing,type Fish} from './fishing';import {SKIN_TONES,SHIRT_COLORS} from './content';import {castingPose,caughtFishPoint,CAST_MS,CATCH_FLY_MS,CATCH_SHOW_MS} from './fishing-animation';
function fishTextures(scene:Phaser.Scene){for(const [kind,fish] of Object.entries(FISH)){
 const key=`caught-${kind}`;if(scene.textures.exists(key))continue;const cv=document.createElement('canvas');cv.width=28;cv.height=20;const c=cv.getContext('2d')!;const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const fat=kind==='pacu'?6:kind==='tilapia'?5:3,rx=kind==='piaba'?6:kind==='mandi'?9:7,cx=15,cy=10;
 const oval=(color:string,wide:number,high:number)=>{for(let y=-high;y<=high;y++){const span=Math.floor(wide*Math.sqrt(Math.max(0,1-y*y/(high*high))));r(color,cx-span,cy+y,span*2+1,1);}};
 const tail=cx-rx-6;for(let i=0;i<5;i++){r('#294039',tail+i,cy-4+i,1,9-i*2);if(i<4)r(fish.color,tail+i+1,cy-3+i,1,7-i*2);}
 r('#526b5a',12,cy-fat-2,5,3);r(fish.color,13,cy-fat-2,3,2);oval('#294039',rx+1,fat+1);oval(fish.color,rx,fat);
 for(let y=1;y<=fat-1;y++){const span=Math.floor(rx*Math.sqrt(1-y*y/(fat*fat)));r('#5a7a71',cx-span+1,cy+y,span*2-2,1);}r('#e8e5bd',cx-rx+3,cy-fat+1,Math.max(2,rx),1);
 for(const x of [cx-3,cx,cx+3])r('#b1c7a1',x,cy-1,1,1);r('#3d5d52',cx+rx-4,cy-1,1,4);r('#f9efc9',cx+rx-2,cy-2,2,2);r('#243b36',cx+rx-1,cy-2,1,1);r('#294039',cx+rx,cy+1,2,1);r('#9cb88b',cx-1,cy+fat-1,4,2);
 if(kind==='mandi'){r('#dfc49a',24,11,4,1);r('#dfc49a',24,13,3,1);}if(kind==='tilapia')for(const x of [11,14,17])r('#477a78',x,7,1,7);if(kind==='piaba')r('#e8b75b',14,11,3,2);
 scene.textures.addCanvas(key,cv);
}}
export class FishingView{
 private art:Phaser.GameObjects.Graphics;private fish:Phaser.GameObjects.Image;private speech:Phaser.GameObjects.Text;busy=false;
 private castingAt=-Infinity;private catch?:{fish:Fish;startedAt:number};
 constructor(private scene:Phaser.Scene,private farm:()=>Farm,private now:()=>number,private command:(c:{type:string})=>Promise<unknown>,private toast:(s:string)=>void){fishTextures(scene);this.art=scene.add.graphics();this.fish=scene.add.image(0,0,'caught-lambari').setVisible(false);this.speech=scene.add.text(0,0,'',{fontFamily:'monospace',fontSize:'12px',color:'#fff2c9',backgroundColor:'#294539ee',padding:{x:9,y:6},align:'center',stroke:'#243b2c',strokeThickness:1}).setOrigin(.5,1).setVisible(false);}
 get showingFish(){return !!this.catch&&this.now()-this.catch.startedAt<CATCH_SHOW_MS;}
 get locked(){return this.busy||this.showingFish||this.now()-this.castingAt<CAST_MS||!!this.farm().fishing?.cast&&this.now()<=this.farm().fishing!.cast!.expiresAt;}
 async use(){if(this.busy||this.showingFish)return;this.busy=true;const reeling=!!this.farm().fishing?.cast;if(!reeling)this.castingAt=this.now();try{const result=await this.command({type:reeling?'reel-line':'cast-line'}) as {message?:string;caught?:Fish};if(result.caught&&Object.hasOwn(FISH,result.caught)){this.catch={fish:result.caught,startedAt:this.now()};this.fish.setTexture(`caught-${result.caught}`);this.speech.setText(`Peguei ${['piaba','tilapia'].includes(result.caught)?'uma':'um'} ${FISH[result.caught].name}!`);}else if(result.message&&result.message!=='Linha lançada.')this.toast(result.message);}catch(e){if(!reeling)this.castingAt=-Infinity;this.toast((e as Error).message);}finally{this.busy=false;}}
 async cancel(){if(!this.farm().fishing?.cast||this.busy)return;this.busy=true;try{await this.command({type:'cancel-line'});}catch(e){this.toast((e as Error).message);}finally{this.busy=false;}}
 update(player:{x:number;y:number},direction:string,selected:boolean,blocked:boolean){
  const state=this.farm().fishing,cast=state?.cast,now=this.now(),active=!!cast&&now<=cast.expiresAt,presentation=this.catch&&now-this.catch.startedAt<CATCH_SHOW_MS?this.catch:undefined;
  const button=document.getElementById('fish-action') as HTMLButtonElement;button.hidden=blocked||!state?.rod||!selected||!nearFishing(player);button.disabled=this.busy||!!presentation;button.dataset.phase=presentation?(now-presentation.startedAt>=CATCH_FLY_MS?'holding':'landing'):active?'waiting':'idle';button.setAttribute('aria-label',cast?'Recolher linha':'Lançar linha');button.classList.toggle('bite',!!cast&&now>=cast.biteAt&&now<=cast.expiresAt);
  this.art.clear();this.fish.setVisible(false);this.speech.setVisible(false);if(blocked||!selected&&!active&&!presentation)return;
  const side=active||direction==='right'?1:direction==='left'?-1:1,hand={x:Math.round(player.x+side*12),y:Math.round(player.y-25)},elapsed=now-this.castingAt,casting=elapsed<CAST_MS,pose=castingPose(elapsed),angle=casting?pose.angle:-1.02,tip={x:hand.x+side*Math.cos(angle)*53,y:hand.y+Math.sin(angle)*53};
  this.art.setDepth(player.y+3);
  const water={x:FISH_SPOT.x+78,y:FISH_SPOT.y+26};
  if(!presentation||now-presentation.startedAt<CATCH_FLY_MS){
   this.art.lineStyle(4,0x3a2c20).lineBetween(hand.x,hand.y,tip.x,tip.y).lineStyle(2,0xc5a16b).lineBetween(hand.x,hand.y,tip.x,tip.y).lineStyle(4,0x88623d).lineBetween(hand.x,hand.y,hand.x+side*7,hand.y-10);
  }
  if(active&&cast){const t=casting?pose.line:1,bx=tip.x+(water.x-tip.x)*t,by=tip.y+(water.y-tip.y)*t-Math.sin(t*Math.PI)*48+Math.sin(now/350)*(now>=cast.biteAt?3:1);this.line(tip,{x:bx,y:by},casting?16:8);
   this.art.lineStyle(1,now>=cast.biteAt?0xeac875:0x91cbc4,.7).strokeEllipse(bx,by+3,14+Math.sin(now/230)*3,6);this.art.fillStyle(0xf0e3b7).fillRect(bx-2,by-4,4,5).fillStyle(0xd76a42).fillRect(bx-2,by,4,4);if(now>=cast.biteAt)this.art.fillStyle(0xffd77b).fillRect(bx-1,by-22,3,9).fillRect(bx-1,by-10,3,3);
  }
  if(presentation){const age=now-presentation.startedAt,grip={x:player.x+21,y:player.y-43},held={x:grip.x,y:grip.y-12},p=caughtFishPoint(water,held,age),holding=age>=CATCH_FLY_MS;
   this.fish.setVisible(true).setPosition(Math.round(p.x),Math.round(p.y)).setRotation(p.rotation).setScale(1.45).setDepth(player.y+5);
   if(!holding){this.line(tip,p,3);const splash=Math.max(0,1-age/650);this.art.lineStyle(2,0xadd6c6,splash).strokeEllipse(water.x,water.y,18+age/16,8+age/40);for(let i=0;i<6;i++)this.art.fillStyle(0xb9ded0,splash).fillRect(water.x+Math.cos(i)*age/24,water.y-Math.sin(i)*12-age/35,2,3);}
   else{const a=this.farm().avatar,skin=parseInt(SKIN_TONES[a.skin].slice(1),16),shirt=parseInt(SHIRT_COLORS[a.shirt].slice(1),16);this.art.lineStyle(6,shirt).lineBetween(player.x+12,player.y-28,grip.x,player.y-33).lineStyle(5,skin).lineBetween(grip.x,player.y-33,grip.x,grip.y).fillStyle(skin).fillRect(grip.x-3,grip.y-3,6,6);this.speech.setVisible(true).setPosition(player.x,player.y-83).setDepth(player.y+10);}
  }
 }
 private line(from:{x:number;y:number},to:{x:number;y:number},slack:number){this.art.lineStyle(1,0xe3dfbf,.9);let prev=from;for(let i=1;i<=12;i++){const t=i/12,p={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t+Math.sin(t*Math.PI)*slack};this.art.lineBetween(prev.x,prev.y,p.x,p.y);prev=p;}}
}
