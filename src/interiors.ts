import {claimInteractionEvent} from './interaction-event';
import {display} from './display-settings';
import {bakeFloor} from './static-layer';
import {TimeLighting} from './time-lighting';
import {SLEEP_MS} from './world-time';
import Phaser from 'phaser';
import {buildHouse,HOUSE_WALLS,HOUSE_PROPS,HOUSE_SEAT,HOUSE_SLEEP} from './house-art';
import {barnMaterials} from './barn-materials';
import { SKIN_TONES, SHIRT_COLORS } from './content';
import {IdleBreathing} from './idle-art';
import { AvatarArt } from './avatar-art';
import { buildBarn, type RoomPoint } from './barn-art';
import type { Farm, Tool } from './farm';
import { findPath } from './pathfinding';
type Services={farm:()=>Farm;stick:()=>{x:number;y:number};modal:()=>boolean;tool:()=>Tool;now:()=>number;avatar:()=>void;animals:(id?:string)=>void;equipment:()=>void;toast:(s:string)=>void;open:(title:string,html:string)=>void;exit:()=>void;collect?:(id:string)=>Promise<unknown>;home?:(c:{type:'home';action:'tv'|'sleep'|'wake';on?:boolean})=>Promise<unknown>;care?:(c:{type:'pet-animal'|'play-animal';id:string})=>Promise<unknown>;failed?:(error:Error,room:'house'|'barn')=>void};
export class InteriorScene extends Phaser.Scene {
 private failed=false;
 private bonding:{id:string;type:'pet-animal'|'play-animal';phase:'arriving'|'contact'|'saving'|'reacting';start:number;resolve:()=>void;reject:(e:Error)=>void}|null=null;private gesture!:Phaser.GameObjects.Graphics;private context!:Phaser.GameObjects.Text;private reduced=matchMedia('(prefers-reduced-motion: reduce)');
 private breathing=new IdleBreathing();
 private nextUI=0;private house?:ReturnType<typeof buildHouse>;private lighting!:TimeLighting;private homeBusy=false;
 private rest:{kind:'sit'|'sleep'|'leaving';start:number;from:{x:number;y:number}}|null=null;
 private houseButton:HTMLButtonElement|null=null;private tvButton:HTMLButtonElement|null=null;
 private room:'house'|'barn'='house';private overview=false;private player!:Phaser.Physics.Arcade.Sprite;private actor!:Phaser.GameObjects.Sprite;private art!:AvatarArt;private keys!:Record<string,Phaser.Input.Keyboard.Key>;private dir=0;private target:{x:number;y:number;run?:()=>void}|null=null;private route:{x:number;y:number}[]=[];private blocks:{x:number;y:number;width:number;height:number}[]=[];private points:RoomPoint[]=[];private barn?:ReturnType<typeof buildBarn>;private animalSignature='';
 constructor(private services:Services){super('Interior');}
 init(data:{room:'house'|'barn'}){this.failed=false;this.bonding=null;this.rest=null;this.homeBusy=false;this.nextUI=0;this.house=undefined;this.breathing.reset();this.room=data.room;this.overview=this.room==='barn';this.target=null;this.route=[];this.blocks=[];this.points=[];this.barn=undefined;this.animalSignature='';}
 create(){try{this.createRoom();}catch(error){this.failRoom(error);}}
 private createRoom(){
  const s=this.services;this.art=new AvatarArt(this);this.cameras.main.setBackgroundColor('#20382f');
  const g=this.add.graphics();
  if(this.room==='barn'){
   barnMaterials(this);this.add.tileSprite(160,220,880,586,'barn-floor').setOrigin(0).setDepth(.5);
   g.fillStyle(0xc3b183);g.fillRect(150,140,900,80);g.fillStyle(0x624b36);g.fillRect(150,210,900,14);g.fillRect(150,140,14,680);g.fillRect(1036,140,14,680);g.fillRect(150,806,380,14);g.fillRect(670,806,380,14);g.fillStyle(0x9b7b4e);g.fillRect(530,790,140,35);
   for(const x of [170,460,740,1030])this.add.tileSprite(x,180,84,15,'barn-board').setRotation(Math.PI/2).setDepth(225);
   this.add.tileSprite(600,213,900,15,'barn-board').setDepth(226);
   const wall=this.add.graphics().setDepth(224);wall.fillStyle(0x725334);wall.fillRect(164,190,872,19);wall.fillStyle(0x9d7a48);wall.fillRect(164,190,872,3);for(let x=170;x<1036;x+=28){wall.fillStyle(0x997b51);wall.fillRect(x,195,24,11);wall.fillStyle(0xb19465);wall.fillRect(x+1,195,22,1);}wall.fillStyle(0x453520,.2);wall.fillRect(164,214,872,9);
   const light=this.add.graphics().setDepth(2);for(const x of [325,880]){light.fillStyle(0xf5d58d,.055);light.fillTriangle(x-23,225,x+25,225,x+125,500);}
   for(const x of [215,505,695,985]){this.add.image(x,210,'barn-lantern').setOrigin(.5,1).setDepth(225);const glow=this.add.graphics().setDepth(2);for(const [radius,alpha] of [[55,.035],[35,.045],[18,.05]])glow.fillStyle(0xf5c474,alpha).fillEllipse(x,220,radius*2,radius*1.3);}
   for(const x of [325,880])this.add.image(x,204,'life-window').setOrigin(.5,1).setDisplaySize(54,60).setDepth(220);
  }
  const group=this.physics.add.staticGroup();
  const block=(x:number,y:number,w:number,h:number)=>{const z=this.add.zone(x+w/2,y+h/2,w,h);group.add(z);(z.body as Phaser.Physics.Arcade.StaticBody).setSize(w,h);this.blocks.push({x,y,width:w,height:h});};
  const label=(x:number,y:number,text:string)=>this.add.text(x,y,text,{fontFamily:'monospace',fontSize:'11px',color:'#fff1cf',backgroundColor:'#334a37e6',padding:{x:7,y:4}}).setOrigin(.5).setDepth(1500);
  if(this.room==='house'){
   for(const b of HOUSE_WALLS)block(b.x,b.y,b.width,b.height);
   this.house=buildHouse(this,block,kind=>this.useHouse(kind));this.points.push(...this.house);

  }else{
   block(145,130,20,690);block(1035,130,20,690);block(150,130,900,90);block(150,807,380,18);block(670,807,380,18);
   this.barn=buildBarn(this,s.farm(),block,id=>s.animals(id),()=>s.equipment(),id=>{if(this.homeBusy)return;this.homeBusy=true;void(s.collect?.(id)??Promise.resolve()).catch(e=>s.toast(e.message)).finally(()=>{this.homeBusy=false;});});this.points.push(...this.barn.points);this.animalSignature=JSON.stringify(s.farm().animals.map(a=>[a.id,a.kind,a.housing]));
  }
  bakeFloor(this,this.room==='house'?{x:258,y:154,width:686,height:580}:{x:140,y:130,width:920,height:700});
  const exitY=this.room==='house'?697:790;label(600,exitY+36,'SAÍDA');this.points.push({x:600,y:exitY,name:'Voltar à fazenda',run:()=>this.leave()});
  const spawnY=this.room==='house'?660:735;
  this.player=this.physics.add.sprite(600,spawnY,'farmer-down-0').setVisible(false).setOrigin(.5,1).setCollideWorldBounds(true);this.player.body!.setSize(14,10).setOffset(17,52);this.physics.world.setBounds(this.room==='house'?278:165,224,this.room==='house'?644:870,this.room==='house'?500:596);this.physics.add.collider(this.player,group);
  this.actor=this.add.sprite(600,spawnY,'farmer-down-0').setOrigin(.5,62/64).setScale(1.08);
  this.lighting=new TimeLighting(this,true);
  this.houseButton=document.getElementById('house-action') as HTMLButtonElement|null;this.tvButton=document.getElementById('house-tv') as HTMLButtonElement|null;if(this.houseButton)this.houseButton.onclick=()=>this.interact();if(this.tvButton)this.tvButton.onclick=()=>this.useHouse('tv');
  this.gesture=this.add.graphics();this.context=this.add.text(0,0,'',{fontFamily:'monospace',fontSize:'10px',color:'#fff1cf',backgroundColor:'#334a37e6',padding:{x:5,y:3}}).setOrigin(.5,0).setDepth(1500);
  this.cameras.main.setBounds(0,0,1200,950);this.cameras.main.startFollow(this.player,true,.1,.1,0,30);this.resize();this.scale.on('resize',this.resize,this);
  this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard!.on('keydown-E',(e:KeyboardEvent)=>{if(!e.repeat&&claimInteractionEvent(e))this.interact();});this.input.keyboard!.on('keydown-ESC',()=>{if(!s.modal())this.leave();});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(s.modal()||this.bonding||this.homeBusy)return;if(this.rest){this.releaseRest();return;}const point=this.cameras.main.getWorldPoint(p.x,p.y);const item=this.points.find(t=>(!t.enabled||t.enabled())&&Math.hypot((t.hitX??t.x)-point.x,(t.hitY??t.y-30)-point.y)<(t.radius??65));if(item?.kind){this.requestHouseInteraction(item.kind);return;}const target=item?{x:item.x,y:item.y,run:item.run}:{x:Phaser.Math.Clamp(point.x,185,1015),y:Phaser.Math.Clamp(point.y,240,790)};this.route=findPath(this.player,target,this.blocks);if(this.route.length)this.target=target;else s.toast('Aproxime-se pelo corredor livre.');});
  this.events.once('shutdown',()=>{this.scale.off('resize',this.resize,this);this.art.destroy();if(this.houseButton)this.houseButton.hidden=true;if(this.tvButton)this.tvButton.hidden=true;this.bonding?.reject(new Error('Interação interrompida.'));this.bonding=null;});

 }
 private resize(){const camera=this.cameras.main;if(this.scale.width>=900){camera.stopFollow();camera.removeBounds();camera.setZoom(Math.min(this.scale.width/1150,this.scale.height/850));camera.centerOn(600,470);}else if(this.overview){camera.stopFollow();camera.removeBounds();camera.setZoom(Math.min(this.scale.width/980,(this.scale.height-170)/800));camera.centerOn(600,470);}else{camera.setBounds(0,0,1200,950);camera.startFollow(this.player,true,.1,.1,0,30);camera.setZoom(1.05);}}
 toggleView(){this.overview=!this.overview;this.resize();return this.overview;}

 getRoom(){return this.room;}
 bond(id:string,type:'pet-animal'|'play-animal'):Promise<void>{
  if(this.bonding)return Promise.reject(new Error('Aguarde a interação atual.'));
  const access=this.barn?.access(id);if(!access||!this.services.farm().animals.some(a=>a.id===id))return Promise.reject(new Error('Animal não encontrado no celeiro.'));
  const route=findPath(this.player,access,this.blocks);if(!route.length)return Promise.reject(new Error('Não há passagem livre até o animal.'));
  return new Promise((resolve,reject)=>{this.bonding={id,type,phase:'arriving',start:this.time.now,resolve,reject};this.route=route;this.target={...access,run:()=>{if(!this.bonding)return;this.bonding.phase='contact';this.bonding.start=this.time.now;this.barn!.beginCare(id,type,this.time.now);this.dir=access.x<600?1:2;}};});
 }
 exitRoom(){this.leave();}
 private leave(){if(this.bonding||this.homeBusy||this.services.farm().home?.sleep)return;this.player.setVelocity(0);this.target=null;this.route=[];this.scene.stop();this.scene.wake('Farm');this.services.exit();}
 interact(){if(this.services.modal()||this.bonding||this.homeBusy)return;if(this.rest){this.releaseRest();return;}const nearest=this.points.filter(p=>!p.enabled||p.enabled()).sort((a,b)=>Phaser.Math.Distance.Between(this.player.x,this.player.y,a.x,a.y)-Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y))[0];if(nearest&&Math.hypot(this.player.x-nearest.x,this.player.y-nearest.y)<110)nearest.run();else this.services.toast('Aproxime-se de um móvel, animal ou da saída.');}
 getActivity(){return this.homeBusy?'Salvando':this.rest?.kind==='sit'?'Sentada no sofá':this.rest?.kind==='sleep'?'Dormindo na cama':this.rest?.kind==='leaving'?'Levantando':this.target?'Caminhando':'Em pé';}
 requestHouseInteraction(kind:string){
  if(this.room!=='house'||this.services.modal()||this.homeBusy||this.services.farm().home?.sleep)return;
  if(this.rest){this.releaseRest();return;}
  const prop=HOUSE_PROPS.find(p=>p.kind===kind);if(!prop)return;const route=findPath(this.player,prop.access,this.blocks);if(!route.length){this.services.toast('Não há passagem livre até o móvel.');return;}
  this.route=route;this.target={...prop.access,run:()=>this.useHouse(kind)};
 }
 private useHouse(kind:string){
  const s=this.services;if(this.homeBusy||s.farm().home?.sleep)return;
  if(kind==='wardrobe'){s.avatar();return;}
  if(kind==='sofa'){this.rest={kind:'sit',start:this.time.now,from:{x:this.player.x,y:this.player.y-2}};this.target=null;this.route=[];this.player.setVelocity(0);return;}
  if(kind==='bed'||kind==='tv'){
   if(!s.home){s.toast('Interação indisponível neste ambiente.');return;}
   this.homeBusy=true;this.player.setVelocity(0);this.target=null;this.route=[];
   const c=kind==='bed'?{type:'home' as const,action:'sleep' as const}:{type:'home' as const,action:'tv' as const,on:!s.farm().home?.tvOn};
   void s.home(c).then(()=>{if(kind==='bed')this.rest={kind:'sleep',start:this.time.now,from:{x:this.player.x,y:this.player.y-2}};}).catch(e=>s.toast(e.message)).finally(()=>{this.homeBusy=false;});return;
  }
  s.open('À mesa','<p>Um cantinho tranquilo para desacelerar.</p>');
 }
 private releaseRest(){if(!this.rest||this.rest.kind==='leaving'||this.services.farm().home?.sleep||this.homeBusy)return;this.rest={kind:'leaving',start:this.time.now,from:{x:this.actor.x,y:this.actor.y}};}
 private restFrame(time:number,phase:number){
  const rest=this.rest;if(!rest)return;
  const destination=rest.kind==='sit'?HOUSE_SEAT:rest.kind==='sleep'?HOUSE_SLEEP:{x:this.player.x,y:this.player.y-2};const t=Math.min(1,(time-rest.start)/600),ease=t*t*(3-2*t);
  this.actor.setTexture(this.art.idleKey(rest.kind==='sleep'?'pose-sleep':'pose-sit',this.services.farm().avatar),rest.kind==='leaving'?0:phase).setOrigin(.5,1).setScale(1.08).setPosition(rest.from.x+(destination.x-rest.from.x)*ease,rest.from.y+(destination.y-rest.from.y)*ease).setDepth(rest.kind==='sleep'?316:520);
  if(rest.kind==='leaving'&&t>=1){this.rest=null;this.actor.setDepth(this.player.y);}
 }
 private updateHouseControls(){
  if(!this.houseButton)return;const f=this.services.farm();this.houseButton.hidden=this.room!=='house'||this.services.modal();if(this.tvButton)this.tvButton.hidden=true;if(this.houseButton.hidden)return;
  this.houseButton.disabled=this.homeBusy||!!f.home?.sleep||this.rest?.kind==='leaving';
  if(this.homeBusy){this.houseButton.textContent='Salvando…';return;}
  if(f.home?.sleep){this.houseButton.textContent=`Dormindo… ${Math.max(0,Math.ceil((SLEEP_MS-this.services.now()+f.home.sleep.startedAt)/1000))}s`;return;}
  if(this.rest){this.houseButton.textContent='Levantar do sofá · E / Usar';if(this.tvButton&&this.rest.kind==='sit'){this.tvButton.hidden=false;this.tvButton.disabled=this.homeBusy;this.tvButton.textContent=f.home?.tvOn?'Desligar TV':'Ligar TV';}return;}
  const near=HOUSE_PROPS.filter(p=>['bed','sofa','tv'].includes(p.kind)).sort((a,b)=>Math.hypot(a.access.x-this.player.x,a.access.y-this.player.y)-Math.hypot(b.access.x-this.player.x,b.access.y-this.player.y))[0];
  if(!near||Math.hypot(near.access.x-this.player.x,near.access.y-this.player.y)>72){this.houseButton.hidden=true;return;}
  this.houseButton.textContent=near.kind==='bed'?'Deitar e dormir · E / Usar':near.kind==='sofa'?'Sentar no sofá · E / Usar':f.home?.tvOn?'Desligar TV · E / Usar':'Ligar TV · E / Usar';
 }
 private finishBond(error?:Error){const bond=this.bonding;this.bonding=null;this.barn?.endCare();this.gesture.clear();this.target=null;this.route=[];if(error)bond?.reject(error);else bond?.resolve();}
 update(time:number){if(this.failed)return;try{this.updateRoom(time);}catch(error){this.failRoom(error);}}
 private failRoom(error:unknown){if(this.failed)return;this.failed=true;if(this.player?.body)this.player.setVelocity(0);const detail=error instanceof Error?error:new Error(String(error));queueMicrotask(()=>{if(this.services.failed)this.services.failed(detail,this.room);else this.services.toast(`Não foi possível abrir o cômodo: ${detail.message}`);});}
 private updateRoom(time:number){if(!this.player)return;const s=this.services;this.lighting.update(s.farm().calendar,s.now());if(this.room==='house'&&s.farm().home?.sleep&&!this.rest)this.rest={kind:'sleep',start:time,from:{x:this.player.x,y:this.player.y-2}};if(this.rest?.kind==='sleep'&&!s.farm().home?.sleep)this.releaseRest();let vx=0,vy=0;
  if(!s.modal()){const stick=s.stick();vx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown)+stick.x;vy=Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)+stick.y;
   if(this.rest&&(vx||vy))this.releaseRest();
   if(this.bonding||this.rest||this.homeBusy){vx=0;vy=0;}
   if((vx||vy)&&!this.bonding){this.target=null;this.route=[];}else if(this.target&&!this.rest&&!this.homeBusy){const p=this.route[0]??this.target,dx=p.x-this.player.x,dy=p.y-this.player.y,d=Math.hypot(dx,dy);if(d<8){if(this.route.length>1)this.route.shift();else{const done=this.target;this.target=null;done.run?.();}}else{vx=dx/d;vy=dy/d;}}
  }
  const bond=this.bonding;if(bond&&bond.phase!=='arriving'){vx=0;vy=0;this.target=null;this.route=[];}
  const len=Math.hypot(vx,vy);this.player.setVelocity(len?vx/Math.max(1,len)*145:0,len?vy/Math.max(1,len)*145:0);if(len>.1)this.dir=Math.abs(vx)>Math.abs(vy)?vx<0?1:2:vy<0?3:0;
  const phase=this.breathing.frame(time,len>.1,!!bond,!display.breathing),idle=len<=.1&&!bond;
  const tool=bond?'hand':s.tool(),base=tool==='hand'?'farmer-v2':`carry-${tool}`,key=idle?this.art.idleKey(base,s.farm().avatar):this.art.key(base,s.farm().avatar),frame=this.dir*4+(len>.1?Math.floor(time/140)%4:phase);this.actor.setTexture(key,frame).setScale(1.08).setOrigin(.5,tool==='hand'?62/64:100/112).setPosition(this.player.x,this.player.y-2).setDepth(this.player.y);
  this.restFrame(time,phase);this.house?.updateHome(s.farm().home,time,this.rest?.kind==='sleep',this.reduced.matches);if(time>=this.nextUI){this.updateHouseControls();this.nextUI=time+100;}
  this.barn?.update(time,s.farm(),s.now(),this.player);this.gesture.clear();
  const near=this.points.filter(p=>p.name&&(!p.enabled||p.enabled())).sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0];
  this.context.setVisible(!this.rest&&!this.homeBusy&&!bond&&!s.modal()&&!!near&&Math.hypot(near.x-this.player.x,near.y-this.player.y)<72);if(near)this.context.setText(`${near.name} · E / Usar`).setPosition(this.player.x,this.player.y+9);
  if(bond){
   if(bond.phase==='contact'&&time-bond.start>=1100){
    const access=this.barn?.access(bond.id);if(!access||Math.hypot(this.player.x-access.x,this.player.y-access.y)>20){this.finishBond(new Error('Aproxime-se do portão do animal.'));return;}
    bond.phase='saving';void (s.care?.({type:bond.type,id:bond.id})??Promise.reject(new Error('Cuidados indisponíveis.'))).then(()=>{if(this.bonding===bond){bond.phase='reacting';bond.start=this.time.now;}}).catch(e=>{if(this.bonding===bond)this.finishBond(e);});
   }
   if(bond.phase==='reacting'){
    const elapsed=time-bond.start,side=this.dir===1?-1:1,wave=this.reduced.matches?0:Math.round(Math.sin(elapsed/140)*2),skin=parseInt(SKIN_TONES[s.farm().avatar.skin].slice(1),16),shirt=parseInt(SHIRT_COLORS[s.farm().avatar.shirt].slice(1),16);
    this.gesture.setDepth(this.player.y+1).fillStyle(shirt).fillRect(this.player.x+side*17-4,this.player.y-29,12,7).fillStyle(skin).fillRect(this.player.x+side*28-4,this.player.y-28+wave,8,4);
    const pet=this.barn?.contact(bond.id);if(pet&&bond.type==='play-animal'){this.gesture.fillStyle(0xcaae63).fillCircle(pet.x-side*12,pet.y-6,3);}
    if(elapsed>2100)this.finishBond();
   }
   if(time-bond.start>15000&&bond.phase==='arriving')this.finishBond(new Error('O caminho até o animal ficou bloqueado.'));
  }
  if(this.barn&&!s.modal()&&this.animalSignature!==JSON.stringify(s.farm().animals.map(a=>[a.id,a.kind,a.housing])))this.scene.restart({room:'barn'});
 }
}
