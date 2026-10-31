import {PetWorld} from './pet-world';
import {isPet} from './pet-rules';
import {petStroke} from './pet-motion';
import {houseOffset} from './home-design';
import {outfitSleeveColor} from './outfit-art';
import {appearanceOf} from './wardrobe';
import {closestInReach} from './proximity';
import {buildBarnShell} from './barn-design';
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
type Services={farm:()=>Farm;stick:()=>{x:number;y:number};modal:()=>boolean;tool:()=>Tool;now:()=>number;avatar:()=>void;wardrobe?:()=>void;animals:(id?:string)=>void;equipment:()=>void;toast:(s:string)=>void;open:(title:string,html:string)=>void;exit:()=>void;collect?:(id:string)=>Promise<unknown>;home?:(c:{type:'home';action:'tv'|'lights'|'sleep'|'wake';on?:boolean})=>Promise<unknown>;care?:(c:{type:'pet-animal'|'play-animal';id:string})=>Promise<unknown>;failed?:(error:Error,room:'house'|'barn')=>void};
export class InteriorScene extends Phaser.Scene {
 pets!:PetWorld;private failed=false;
 private bonding:{id:string;type:'pet-animal'|'play-animal';phase:'arriving'|'contact'|'saving'|'reacting';start:number;resolve:()=>void;reject:(e:Error)=>void}|null=null;private gesture!:Phaser.GameObjects.Graphics;private reduced=matchMedia('(prefers-reduced-motion: reduce)');
 private breathing=new IdleBreathing();
 private nextUI=0;private house?:ReturnType<typeof buildHouse>;private lighting!:TimeLighting;private homeBusy=false;
 private rest:{kind:'sit'|'sleep'|'leaving';start:number;from:{x:number;y:number}}|null=null;
 private houseButton:HTMLButtonElement|null=null;private tvButton:HTMLButtonElement|null=null;
 private room:'house'|'barn'='house';private overview=false;private player!:Phaser.Physics.Arcade.Sprite;private actor!:Phaser.GameObjects.Sprite;private art!:AvatarArt;private keys!:Record<string,Phaser.Input.Keyboard.Key>;private dir=0;private target:{x:number;y:number;run?:()=>void}|null=null;private route:{x:number;y:number}[]=[];private blocks:{x:number;y:number;width:number;height:number}[]=[];private points:RoomPoint[]=[];private barn?:ReturnType<typeof buildBarn>;private animalSignature='';
 constructor(private services:Services){super('Interior');}
 init(data:{room:'house'|'barn'}){this.failed=false;this.bonding=null;this.rest=null;this.homeBusy=false;this.nextUI=0;this.house=undefined;this.breathing.reset();this.room=data.room;this.overview=false;this.target=null;this.route=[];this.blocks=[];this.points=[];this.barn=undefined;this.animalSignature='';}
 create(){try{this.createRoom();}catch(error){this.failRoom(error);}}
 private createRoom(){
  const s=this.services;this.art=new AvatarArt(this);this.cameras.main.setBackgroundColor('#20382f');
  if(this.room==='barn'){
   barnMaterials(this);buildBarnShell(this);
  }
  const group=this.physics.add.staticGroup();
  const block=(x:number,y:number,w:number,h:number)=>{const z=this.add.zone(x+w/2,y+h/2,w,h);group.add(z);(z.body as Phaser.Physics.Arcade.StaticBody).setSize(w,h);this.blocks.push({x,y,width:w,height:h});};
  if(this.room==='house'){
   for(const b of HOUSE_WALLS)block(b.x,b.y,b.width,b.height);
   this.house=buildHouse(this,block,kind=>this.useHouse(kind),s.farm());this.points.push(...this.house);

  }else{
   block(145,130,20,690);block(1035,130,20,690);block(150,130,900,90);block(150,807,380,18);block(670,807,380,18);
   this.barn=buildBarn(this,s.farm(),block,id=>s.animals(id),()=>s.equipment(),id=>{if(this.homeBusy)return;this.homeBusy=true;void(s.collect?.(id)??Promise.resolve()).catch(e=>s.toast(e.message)).finally(()=>{this.homeBusy=false;});});this.points.push(...this.barn.points);this.animalSignature=JSON.stringify(s.farm().animals.filter(a=>!isPet(a)).map(a=>[a.id,a.kind,a.housing]));
  }
  bakeFloor(this,this.room==='house'?{x:258,y:154,width:686,height:580}:{x:140,y:130,width:920,height:700});
  const exitY=this.room==='house'?697:790;this.points.push({x:600,y:exitY,name:'Voltar à fazenda',run:()=>this.leave()});
  const spawnY=this.room==='house'?660:735;
  // Development-only synthetic QA spawn; never present in production builds or real profiles.
  const qa=import.meta.env.DEV&&s.farm().playerName?.startsWith('QA')?new URLSearchParams(location.search).get('qa-room'):null;
  const spawn=this.room==='barn'&&qa==='barn'?{x:550,y:323}:this.room==='house'&&qa?({sofa:{x:829,y:497},bed:{x:376,y:337},lamp:{x:352,y:685}} as Record<string,{x:number;y:number}>)[qa]:undefined;
  this.player=this.physics.add.sprite(600,spawnY,'farmer-down-0').setVisible(false).setOrigin(.5,1).setCollideWorldBounds(true);this.player.body!.setSize(14,10).setOffset(17,52);this.physics.world.setBounds(this.room==='house'?278:165,224,this.room==='house'?644:870,this.room==='house'?500:596);this.physics.add.collider(this.player,group);
  if(spawn)this.player.setPosition(spawn.x,spawn.y);
  this.actor=this.add.sprite(this.player.x,this.player.y,'farmer-down-0').setOrigin(.5,62/64).setScale(1.08);
  this.lighting=new TimeLighting(this,true);
  this.houseButton=document.getElementById('house-action') as HTMLButtonElement|null;this.tvButton=document.getElementById('house-tv') as HTMLButtonElement|null;if(this.houseButton)this.houseButton.onclick=()=>this.interact();if(this.tvButton)this.tvButton.onclick=()=>this.useHouse('tv');
  this.gesture=this.add.graphics();this.pets=new PetWorld(this,this.room,s.farm,()=>this.blocks,{x:this.room==='house'?278:165,y:224,width:this.room==='house'?644:870,height:this.room==='house'?485:580},id=>s.animals(id),c=>s.care?.(c)??Promise.reject(Error('Cuidados indisponíveis.')));
  this.cameras.main.setBounds(0,0,1200,950);this.cameras.main.startFollow(this.player,true,.1,.1,0,30);this.resize();this.scale.on('resize',this.resize,this);
  this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard!.on('keydown-E',(e:KeyboardEvent)=>{if(!e.repeat&&claimInteractionEvent(e))this.interact();});this.input.keyboard!.on('keydown-ESC',()=>{if(!s.modal())this.leave();});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(s.modal()||this.bonding||this.pets?.locked||this.homeBusy)return;const point=this.cameras.main.getWorldPoint(p.x,p.y);const pet=this.pets.hit(point);if(pet){s.animals(pet);return;}if(this.rest){if(this.rest.kind==='sit'&&Math.abs(point.x-740)<50&&point.y>235&&point.y<330)this.useHouse('tv');else this.releaseRest();return;}const item=this.points.find(t=>(!t.enabled||t.enabled())&&Math.hypot((t.hitX??t.x)-point.x,(t.hitY??t.y-30)-point.y)<(t.radius??65));if(item?.interactionPosition&&Math.hypot(this.player.x-item.interactionPosition().x,this.player.y-item.interactionPosition().y)<100){item.run();return;}if(item?.kind){this.requestHouseInteraction(item.kind);return;}const target=item?{x:item.x,y:item.y,run:item.run}:{x:Phaser.Math.Clamp(point.x,185,1015),y:Phaser.Math.Clamp(point.y,240,790)};this.route=findPath(this.player,target,this.blocks);if(this.route.length)this.target=target;else s.toast('Passagem bloqueada.');});
  this.events.once('shutdown',()=>{this.scale.off('resize',this.resize,this);this.art.destroy();if(this.houseButton)this.houseButton.hidden=true;if(this.tvButton)this.tvButton.hidden=true;this.bonding?.reject(new Error('Interação interrompida.'));this.bonding=null;});

 }
 private resize(){const camera=this.cameras.main;if(this.scale.width>=900){camera.stopFollow();camera.removeBounds();camera.setZoom(Math.min(this.scale.width/1150,this.scale.height/850));camera.centerOn(600,470);}else if(this.overview){camera.stopFollow();camera.removeBounds();camera.setZoom(Math.min(this.scale.width/980,(this.scale.height-170)/800));camera.centerOn(600,470);}else{camera.setBounds(0,0,1200,950);camera.startFollow(this.player,true,.1,.1,0,30);camera.setZoom(1.05);}}
 toggleView(){this.overview=!this.overview;this.resize();return this.overview;}

 getRoom(){return this.room;}
 async bond(id:string,type:'pet-animal'|'play-animal'):Promise<void>{
  if(this.bonding||this.pets.locked)throw Error('Aguarde a interação atual.');
  if(this.services.farm().animals.some(a=>a.id===id&&isPet(a))){this.pets.update(this.time.now,this.player);return this.pets.bond(id,type);}
  const signature=JSON.stringify(this.services.farm().animals.filter(a=>!isPet(a)).map(a=>[a.id,a.kind,a.housing]));
  if(this.room==='barn'&&this.animalSignature!==signature){const created=new Promise<void>(resolve=>this.events.once('create',resolve));this.scene.restart({room:'barn'});await created;}
  if(this.bonding)return Promise.reject(new Error('Aguarde a interação atual.'));
  const access=this.barn?.access(id);if(!access||!this.services.farm().animals.some(a=>a.id===id))return Promise.reject(new Error('Animal não encontrado no celeiro.'));
  const route=findPath(this.player,access,this.blocks);if(!route.length)return Promise.reject(new Error('Não há passagem livre até o animal.'));
  return new Promise((resolve,reject)=>{this.bonding={id,type,phase:'arriving',start:this.time.now,resolve,reject};this.route=route;this.target={...access,run:()=>{if(!this.bonding)return;this.bonding.phase='contact';this.bonding.start=this.time.now;this.barn!.beginCare(id,type,this.time.now);this.dir=access.x<600?1:2;}};});
 }
 exitRoom(){this.leave();}
 private leave(){if(this.bonding||this.pets?.locked||this.homeBusy||this.services.farm().home?.sleep)return;if(this.rest){this.releaseRest();return;}this.player.setVelocity(0);this.target=null;this.route=[];this.scene.stop();this.scene.wake('Farm');this.services.exit();}
 interact(){if(this.services.modal()||this.bonding||this.pets?.locked||this.homeBusy)return;if(this.pets.interact(this.player))return;if(this.rest?.kind==='sit'){const s=this.services;s.open('Sofá',`<button id="sofa-tv">${s.farm().home?.tvOn?'Desligar':'Ligar'} TV</button><button id="sofa-rise">Levantar</button>`);document.getElementById('sofa-tv')!.onclick=()=>{(document.getElementById('panel') as HTMLDialogElement).close();this.useHouse('tv');};document.getElementById('sofa-rise')!.onclick=()=>{(document.getElementById('panel') as HTMLDialogElement).close();this.releaseRest();};return;}if(this.rest){this.releaseRest();return;}const nearest=closestInReach(this.player,this.points.filter(p=>!p.pointerOnly&&(!p.enabled||p.enabled())),110);nearest?.run();}
 getActivity(){return this.homeBusy?'Salvando':this.rest?.kind==='sit'?'Sentada no sofá':this.rest?.kind==='sleep'?'Dormindo na cama':this.rest?.kind==='leaving'?'Levantando':this.target?'Caminhando':'Em pé';}
 requestHouseInteraction(kind:string){
  if(this.room!=='house'||this.services.modal()||this.homeBusy||this.services.farm().home?.sleep)return;
  if(this.rest){this.releaseRest();return;}
  const point=this.house?.find(p=>p.kind===kind);if(!point)return;const prop={access:{x:point.x,y:point.y}};const route=findPath(this.player,prop.access,this.blocks);if(!route.length){this.services.toast('Não há passagem livre até o móvel.');return;}
  this.route=route;this.target={...prop.access,run:()=>this.useHouse(kind)};
 }
 private useHouse(kind:string){
  const s=this.services;if(this.homeBusy||s.farm().home?.sleep)return;
  if(kind==='wardrobe'){(s.wardrobe??s.avatar)();return;}
  if(kind==='sofa'){this.rest={kind:'sit',start:this.time.now,from:{x:this.player.x,y:this.player.y-2}};this.target=null;this.route=[];this.player.setVelocity(0);return;}
  if(kind==='lamp'){if(s.home){this.homeBusy=true;void s.home({type:'home',action:'lights',on:s.farm().home?.lightsOn===false}).catch(e=>s.toast(e.message)).finally(()=>this.homeBusy=false);}return;}
  if(kind==='bed'||kind==='tv'){
   if(!s.home){s.toast('Interação indisponível neste ambiente.');return;}
   this.homeBusy=true;this.player.setVelocity(0);this.target=null;this.route=[];
   const c=kind==='bed'?{type:'home' as const,action:'sleep' as const}:{type:'home' as const,action:'tv' as const,on:!s.farm().home?.tvOn};
   void s.home(c).then(()=>{if(kind==='bed')this.rest={kind:'sleep',start:this.time.now,from:{x:this.player.x,y:this.player.y-2}};}).catch(e=>s.toast(e.message)).finally(()=>{this.homeBusy=false;});return;
  }
  s.open('À mesa','<p>Um cantinho tranquilo para desacelerar.</p>');
 }
 private releaseRest(){if(!this.rest||this.rest.kind==='leaving'||this.services.farm().home?.sleep||this.homeBusy)return;if(this.rest.kind==='sit'&&this.services.farm().home?.tvOn)void this.services.home?.({type:'home',action:'tv',on:false}).catch(e=>this.services.toast(e.message));this.rest={kind:'leaving',start:this.time.now,from:{x:this.actor.x,y:this.actor.y}};}
 private restFrame(time:number,phase:number){
  const rest=this.rest;if(!rest)return;
  const destination=rest.kind==='sit'?{x:HOUSE_SEAT.x+houseOffset(this.services.farm(),'sofa').x,y:HOUSE_SEAT.y+houseOffset(this.services.farm(),'sofa').y}:rest.kind==='sleep'?{x:HOUSE_SLEEP.x+houseOffset(this.services.farm(),'bed').x,y:HOUSE_SLEEP.y+houseOffset(this.services.farm(),'bed').y}:{x:this.player.x,y:this.player.y-2};const t=Math.min(1,(time-rest.start)/600),ease=t*t*(3-2*t);
  this.actor.setTexture(this.art.idleKey(rest.kind==='sleep'?'pose-sleep':'pose-sit',appearanceOf(this.services.farm())),rest.kind==='leaving'?0:phase).setOrigin(.5,1).setScale(1.08).setPosition(rest.from.x+(destination.x-rest.from.x)*ease,rest.from.y+(destination.y-rest.from.y)*ease).setDepth(rest.kind==='sleep'?316+houseOffset(this.services.farm(),'bed').y:520+houseOffset(this.services.farm(),'sofa').y);
  if(rest.kind==='leaving'&&t>=1){this.rest=null;this.actor.setDepth(this.player.y);}
 }
 private updateHouseControls(){
  if(!this.houseButton)return;const f=this.services.farm();this.houseButton.hidden=this.room!=='house'||this.services.modal();if(this.tvButton)this.tvButton.hidden=true;if(this.houseButton.hidden)return;
  this.houseButton.disabled=this.homeBusy||!!f.home?.sleep||this.rest?.kind==='leaving';
  if(this.homeBusy){this.houseButton.textContent='Salvando…';return;}
  if(f.home?.sleep){this.houseButton.textContent=`Dormindo… ${Math.max(0,Math.ceil((SLEEP_MS-this.services.now()+f.home.sleep.startedAt)/1000))}s`;return;}
  if(this.rest){this.houseButton.textContent='Levantar do sofá · E / Usar';if(this.tvButton&&this.rest.kind==='sit'){this.tvButton.hidden=false;this.tvButton.disabled=this.homeBusy;this.tvButton.textContent=f.home?.tvOn?'Desligar TV':'Ligar TV';}return;}
  const near=HOUSE_PROPS.map(p=>{const d=houseOffset(this.services.farm(),p.kind);return{...p,access:{x:p.access.x+d.x,y:p.access.y+d.y}};}).filter(p=>['bed','sofa','tv'].includes(p.kind)).sort((a,b)=>Math.hypot(a.access.x-this.player.x,a.access.y-this.player.y)-Math.hypot(b.access.x-this.player.x,b.access.y-this.player.y))[0];
  if(!near||Math.hypot(near.access.x-this.player.x,near.access.y-this.player.y)>72){this.houseButton.hidden=true;return;}
  this.houseButton.textContent=near.kind==='bed'?'Deitar e dormir · E / Usar':near.kind==='sofa'?'Sentar no sofá · E / Usar':f.home?.tvOn?'Desligar TV · E / Usar':'Ligar TV · E / Usar';
 }
 private finishBond(error?:Error){const bond=this.bonding;this.bonding=null;this.barn?.endCare();this.gesture.clear();this.target=null;this.route=[];if(error)bond?.reject(error);else bond?.resolve();}
 update(time:number){if(this.failed)return;try{this.updateRoom(time);}catch(error){this.failRoom(error);}}
 private failRoom(error:unknown){if(this.failed)return;this.failed=true;if(this.player?.body)this.player.setVelocity(0);const detail=error instanceof Error?error:new Error(String(error));queueMicrotask(()=>{if(this.services.failed)this.services.failed(detail,this.room);else this.services.toast(`Não foi possível abrir o cômodo: ${detail.message}`);});}
 private updateRoom(time:number){if(!this.player)return;const s=this.services;this.pets.update(time,this.player,s.modal()||!!this.rest||!!this.bonding);this.lighting.update(s.farm().calendar,s.now(),this.room==='house'?s.farm().home?.lightsOn!==false:undefined);if(this.room==='house'&&s.farm().home?.sleep&&!this.rest)this.rest={kind:'sleep',start:time,from:{x:this.player.x,y:this.player.y-2}};if(this.rest?.kind==='sleep'&&!s.farm().home?.sleep)this.releaseRest();let vx=0,vy=0;
  if(!s.modal()){const stick=s.stick();vx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown)+stick.x;vy=Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)+stick.y;
   if(this.rest&&(vx||vy))this.releaseRest();
   if(this.bonding||this.pets.locked||this.rest||this.homeBusy){vx=0;vy=0;}
   if((vx||vy)&&!this.bonding){this.target=null;this.route=[];}else if(this.target&&!this.rest&&!this.homeBusy){const p=this.route[0]??this.target,dx=p.x-this.player.x,dy=p.y-this.player.y,d=Math.hypot(dx,dy);if(d<8){if(this.route.length>1)this.route.shift();else{const done=this.target;this.target=null;done.run?.();}}else{vx=dx/d;vy=dy/d;}}
  }
  const bond=this.bonding;if(bond&&bond.phase!=='arriving'){vx=0;vy=0;this.target=null;this.route=[];}
  if(this.pets.locked){vx=0;vy=0;this.target=null;this.route=[];this.dir=this.pets.direction==='left'?1:2;}
  const len=Math.hypot(vx,vy);this.player.setVelocity(len?vx/Math.max(1,len)*145:0,len?vy/Math.max(1,len)*145:0);if(len>.1)this.dir=Math.abs(vx)>Math.abs(vy)?vx<0?1:2:vy<0?3:0;
  const phase=this.breathing.frame(time,len>.1,!!bond,!display.breathing),idle=len<=.1&&!bond;
  const tool=bond||this.pets.locked?'hand':s.tool(),base=tool==='hand'||tool==='rod'?'farmer-v2':`carry-${tool}`,key=idle?this.art.idleKey(base,appearanceOf(s.farm())):this.art.key(base,appearanceOf(s.farm())),frame=this.dir*4+(len>.1?Math.floor(time/140)%4:phase);this.actor.setTexture(key,frame).setScale(1.08).setOrigin(.5,base==='farmer-v2'?62/64:100/112).setPosition(this.player.x,this.player.y-2).setDepth(this.player.y);
  this.restFrame(time,phase);this.house?.updateHome(s.farm().home,time,this.rest?.kind==='sleep',this.reduced.matches);if(time>=this.nextUI){this.updateHouseControls();this.nextUI=time+100;}
  this.barn?.update(time,s.farm(),s.now(),this.player);this.gesture.clear();
  if(bond){
   if(bond.phase==='contact'&&time-bond.start>=3000){
    const access=this.barn?.access(bond.id);if(!access||Math.hypot(this.player.x-access.x,this.player.y-access.y)>20){this.finishBond(new Error('Fora de alcance.'));return;}
    bond.phase='saving';void (s.care?.({type:bond.type,id:bond.id})??Promise.reject(new Error('Cuidados indisponíveis.'))).then(()=>{if(this.bonding===bond){bond.phase='reacting';bond.start=this.time.now;}}).catch(e=>{if(this.bonding===bond)this.finishBond(e);});
   }
   if(bond.phase==='contact'||bond.phase==='reacting'){
    const elapsed=time-bond.start,side=this.dir===1?-1:1,pet=this.barn?.contact(bond.id),skin=parseInt(SKIN_TONES[s.farm().avatar.skin].slice(1),16),shirt=parseInt(outfitSleeveColor(appearanceOf(s.farm())).slice(1),16);
    if(pet){const pose=petStroke(this.player,{x:pet.headX,y:pet.headY},side,bond.phase==='contact'?elapsed:3000,this.reduced.matches),g=this.gesture;g.setDepth(Math.max(this.player.y,pet.y)+2);
     if(bond.type==='play-animal'&&bond.phase==='contact'){const toyX=pet.headX+Math.sin(elapsed/350)*4,toyY=pet.headY+7;g.fillStyle(0xb7b477).fillRect(toyX-4,toyY,8,3).fillStyle(0xe7c987).fillRect(toyX-2,toyY-2,3,2);g.lineStyle(3,shirt).lineBetween(this.player.x+side*8,this.player.y-29,toyX,toyY-1);}
     if(pose.visible&&bond.phase==='contact'){const {shoulder:a,elbow:b,hand:h}=pose;g.lineStyle(6,0x49382a).lineBetween(a.x,a.y,b.x,b.y).lineBetween(b.x,b.y,h.x,h.y).lineStyle(4,shirt).lineBetween(a.x,a.y,b.x,b.y).lineStyle(3,skin).lineBetween(b.x,b.y,h.x,h.y).fillStyle(skin).fillRect(Math.round(h.x)-2,Math.round(h.y)-1,5,3);}
     if(bond.phase==='reacting'){const x=Math.round(pet.headX),y=Math.round(pet.headY-13-Math.min(10,elapsed/100));g.fillStyle(0xd79a9c,Math.max(0,1-elapsed/1300)).fillRect(x-4,y,3,3).fillRect(x+1,y,3,3).fillRect(x-3,y+2,6,3).fillRect(x-1,y+5,2,2);}
    }
    if(bond.phase==='reacting'&&elapsed>1100)this.finishBond();
   }
   if(time-bond.start>15000&&bond.phase==='arriving')this.finishBond(new Error('O caminho até o animal ficou bloqueado.'));
  }
  if(this.barn&&!s.modal()&&this.animalSignature!==JSON.stringify(s.farm().animals.filter(a=>!isPet(a)).map(a=>[a.id,a.kind,a.housing])))this.scene.restart({room:'barn'});
 }
}
