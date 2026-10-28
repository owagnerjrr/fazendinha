import Phaser from 'phaser';
import {buildHouse,HOUSE_WALLS} from './house-art';
import {barnMaterials} from './barn-materials';
import { SKIN_TONES, SHIRT_COLORS } from './content';
import {idlePhase} from './idle-art';
import { AvatarArt } from './avatar-art';
import { buildBarn, type RoomPoint } from './barn-art';
import type { Farm, Tool } from './farm';
import { findPath } from './pathfinding';
type Services={farm:()=>Farm;stick:()=>{x:number;y:number};modal:()=>boolean;tool:()=>Tool;now:()=>number;avatar:()=>void;animals:(id?:string)=>void;equipment:()=>void;toast:(s:string)=>void;open:(title:string,html:string)=>void;exit:()=>void;care?:(c:{type:'pet-animal'|'play-animal';id:string})=>Promise<unknown>};
export class InteriorScene extends Phaser.Scene {
 private bonding:{id:string;type:'pet-animal'|'play-animal';phase:'arriving'|'contact'|'saving'|'reacting';start:number;resolve:()=>void;reject:(e:Error)=>void}|null=null;private gesture!:Phaser.GameObjects.Graphics;private context!:Phaser.GameObjects.Text;private reduced=matchMedia('(prefers-reduced-motion: reduce)');
 private room:'house'|'barn'='house';private overview=false;private player!:Phaser.Physics.Arcade.Sprite;private actor!:Phaser.GameObjects.Sprite;private art!:AvatarArt;private keys!:Record<string,Phaser.Input.Keyboard.Key>;private dir=0;private target:{x:number;y:number;run?:()=>void}|null=null;private route:{x:number;y:number}[]=[];private blocks:{x:number;y:number;width:number;height:number}[]=[];private points:RoomPoint[]=[];private barn?:ReturnType<typeof buildBarn>;private animalSignature='';
 constructor(private services:Services){super('Interior');}
 init(data:{room:'house'|'barn'}){this.bonding=null;this.room=data.room;this.overview=this.room==='barn';this.target=null;this.route=[];this.blocks=[];this.points=[];this.barn=undefined;this.animalSignature='';}
 create(){
  const s=this.services;this.art=new AvatarArt(this);this.cameras.main.setBackgroundColor('#20382f');
  const g=this.add.graphics();
  if(this.room==='barn'){
   barnMaterials(this);this.add.tileSprite(160,220,880,586,'barn-floor').setOrigin(0).setDepth(.5);
   g.fillStyle(0xc3b183);g.fillRect(150,140,900,80);g.fillStyle(0x624b36);g.fillRect(150,210,900,14);g.fillRect(150,140,14,680);g.fillRect(1036,140,14,680);g.fillRect(150,806,380,14);g.fillRect(670,806,380,14);g.fillStyle(0x9b7b4e);g.fillRect(530,790,140,35);
   for(const x of [170,460,740,1030])this.add.tileSprite(x,180,84,15,'barn-board').setRotation(Math.PI/2).setDepth(225);
   this.add.tileSprite(600,213,900,15,'barn-board').setDepth(226);
   for(const x of [325,880])this.add.image(x,204,'life-window').setOrigin(.5,1).setDisplaySize(54,60).setDepth(220);
  }
  const group=this.physics.add.staticGroup();
  const block=(x:number,y:number,w:number,h:number)=>{const z=this.add.zone(x+w/2,y+h/2,w,h);group.add(z);(z.body as Phaser.Physics.Arcade.StaticBody).setSize(w,h);this.blocks.push({x,y,width:w,height:h});};
  const label=(x:number,y:number,text:string)=>this.add.text(x,y,text,{fontFamily:'monospace',fontSize:'11px',color:'#fff1cf',backgroundColor:'#334a37e6',padding:{x:7,y:4}}).setOrigin(.5).setDepth(1500);
  if(this.room==='house'){
   for(const b of HOUSE_WALLS)block(b.x,b.y,b.width,b.height);
   this.points.push(...buildHouse(this,block,kind=>{
    if(kind==='wardrobe')s.avatar();
    else if(kind==='bed')s.open('Um tempo para descansar','<p>Sua cama está sempre pronta. A energia continua se recuperando com o tempo, mesmo com o jogo fechado.</p>');
    else if(kind==='tv')s.open('TV do vale','<p>☀ Hoje no Vale do Sossego: tempo bom para plantar flores e visitar os amigos!</p><p>Por enquanto, a TV exibe este boletim do vale.</p>');
    else s.open(kind==='sofa'?'Sala de casa':'À mesa','<p>Um cantinho tranquilo para desacelerar.</p>');
   }));
  }else{
   block(145,130,20,690);block(1035,130,20,690);block(150,130,900,90);block(150,807,380,18);block(670,807,380,18);
   this.barn=buildBarn(this,s.farm(),block,id=>s.animals(id),()=>s.equipment());this.points.push(...this.barn.points);this.animalSignature=JSON.stringify(s.farm().animals.map(a=>[a.id,a.kind]));
  }
  const exitY=this.room==='house'?697:790;label(600,exitY+36,'SAÍDA');this.points.push({x:600,y:exitY,name:'Voltar à fazenda',run:()=>this.leave()});
  const spawnY=this.room==='house'?660:735;
  this.player=this.physics.add.sprite(600,spawnY,'farmer-down-0').setVisible(false).setOrigin(.5,1).setCollideWorldBounds(true);this.player.body!.setSize(14,10).setOffset(17,52);this.physics.world.setBounds(this.room==='house'?278:165,224,this.room==='house'?644:870,this.room==='house'?500:596);this.physics.add.collider(this.player,group);
  this.actor=this.add.sprite(600,spawnY,'farmer-down-0').setOrigin(.5,62/64).setScale(1.08);
  this.gesture=this.add.graphics();this.context=this.add.text(0,0,'',{fontFamily:'monospace',fontSize:'10px',color:'#fff1cf',backgroundColor:'#334a37e6',padding:{x:5,y:3}}).setOrigin(.5,0).setDepth(1500);
  this.cameras.main.setBounds(0,0,1200,950);this.cameras.main.startFollow(this.player,true,.1,.1,0,30);this.resize();this.scale.on('resize',this.resize,this);
  this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard!.on('keydown-E',(e:KeyboardEvent)=>{if(!e.repeat)this.interact();});this.input.keyboard!.on('keydown-ESC',()=>{if(!s.modal())this.leave();});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(s.modal()||this.bonding)return;const point=this.cameras.main.getWorldPoint(p.x,p.y);const item=this.points.find(t=>Math.hypot((t.hitX??t.x)-point.x,(t.hitY??t.y-30)-point.y)<(t.radius??65));const target=item?{x:item.x,y:item.y,run:item.run}:{x:Phaser.Math.Clamp(point.x,185,1015),y:Phaser.Math.Clamp(point.y,240,790)};this.route=findPath(this.player,target,this.blocks);if(this.route.length)this.target=target;else s.toast('Aproxime-se pelo corredor livre.');});
  this.events.once('shutdown',()=>{this.scale.off('resize',this.resize,this);this.art.destroy();this.bonding?.reject(new Error('Interação interrompida.'));this.bonding=null;});

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
 private leave(){if(this.bonding)return;this.player.setVelocity(0);this.target=null;this.route=[];this.scene.stop();this.scene.wake('Farm');this.services.exit();}
 interact(){if(this.services.modal()||this.bonding)return;const nearest=[...this.points].sort((a,b)=>Phaser.Math.Distance.Between(this.player.x,this.player.y,a.x,a.y)-Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y))[0];if(nearest&&Math.hypot(this.player.x-nearest.x,this.player.y-nearest.y)<110)nearest.run();else this.services.toast('Aproxime-se de um móvel, animal ou da saída.');}
 private finishBond(error?:Error){const bond=this.bonding;this.bonding=null;this.barn?.endCare();this.gesture.clear();this.target=null;this.route=[];if(error)bond?.reject(error);else bond?.resolve();}
 update(time:number){if(!this.player)return;const s=this.services;let vx=0,vy=0;
  if(!s.modal()){const stick=s.stick();vx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown)+stick.x;vy=Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)+stick.y;
   if(this.bonding){vx=0;vy=0;}
   if((vx||vy)&&!this.bonding){this.target=null;this.route=[];}else if(this.target){const p=this.route[0]??this.target,dx=p.x-this.player.x,dy=p.y-this.player.y,d=Math.hypot(dx,dy);if(d<8){if(this.route.length>1)this.route.shift();else{const done=this.target;this.target=null;done.run?.();}}else{vx=dx/d;vy=dy/d;}}
  }
  const bond=this.bonding;if(bond&&bond.phase!=='arriving'){vx=0;vy=0;this.target=null;this.route=[];}
  const len=Math.hypot(vx,vy);this.player.setVelocity(len?vx/Math.max(1,len)*145:0,len?vy/Math.max(1,len)*145:0);if(len>.1)this.dir=Math.abs(vx)>Math.abs(vy)?vx<0?1:2:vy<0?3:0;
  const tool=bond?'hand':s.tool(),idle=len<=.1&&!bond&&!this.reduced.matches,base=tool==='hand'?'farmer-v2':`carry-${tool}`,key=this.art.key(`${base}${idle?'-idle':''}`,s.farm().avatar),frame=this.dir*4+(len>.1?Math.floor(time/140)%4:idlePhase(time,len>.1,!!bond,this.reduced.matches));this.actor.setTexture(key,frame).setOrigin(.5,tool==='hand'?62/64:100/112).setPosition(this.player.x,this.player.y-2).setDepth(this.player.y);
  this.barn?.update(time,s.farm(),s.now(),this.player);this.gesture.clear();
  const near=this.points.filter(p=>p.name).sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0];
  this.context.setVisible(!bond&&!s.modal()&&!!near&&Math.hypot(near.x-this.player.x,near.y-this.player.y)<72);if(near)this.context.setText(`${near.name} · E / Usar`).setPosition(this.player.x,this.player.y+9);
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
  if(this.barn&&!s.modal()&&this.animalSignature!==JSON.stringify(s.farm().animals.map(a=>[a.id,a.kind])))this.scene.restart({room:'barn'});
 }
}
