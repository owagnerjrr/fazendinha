import Phaser from 'phaser';
import {barnMaterials} from './barn-materials';
import { AvatarArt } from './avatar-art';
import { buildBarn, type RoomPoint } from './barn-art';
import type { Farm, Tool } from './farm';
import { findPath } from './pathfinding';
type Services={farm:()=>Farm;stick:()=>{x:number;y:number};modal:()=>boolean;tool:()=>Tool;now:()=>number;avatar:()=>void;animals:(id?:string)=>void;equipment:()=>void;toast:(s:string)=>void;open:(title:string,html:string)=>void;exit:()=>void};
export class InteriorScene extends Phaser.Scene {
 private room:'house'|'barn'='house';private overview=false;private player!:Phaser.Physics.Arcade.Sprite;private actor!:Phaser.GameObjects.Sprite;private art!:AvatarArt;private keys!:Record<string,Phaser.Input.Keyboard.Key>;private dir=0;private target:{x:number;y:number;run?:()=>void}|null=null;private route:{x:number;y:number}[]=[];private blocks:{x:number;y:number;width:number;height:number}[]=[];private points:RoomPoint[]=[];private barn?:ReturnType<typeof buildBarn>;private animalSignature='';
 constructor(private services:Services){super('Interior');}
 init(data:{room:'house'|'barn'}){this.room=data.room;this.overview=this.room==='barn';this.target=null;this.route=[];this.blocks=[];this.points=[];this.barn=undefined;this.animalSignature='';}
 create(){
  const s=this.services;this.art=new AvatarArt(this);this.cameras.main.setBackgroundColor('#20382f');
  const g=this.add.graphics();g.fillStyle(this.room==='house'?0x8d633d:0x746347);g.fillRect(160,210,880,610);
  for(let y=210;y<820;y+=30)for(let x=160;x<1040;x+=80){g.fillStyle(this.room==='house'?((x+y)%3?0xb28a52:0xa37a47):((x+y)%3?0x998457:0x8b764e));g.fillRect(x,y,Math.min(78,1040-x),28);g.lineStyle(1,0x5d4b35,.3);g.strokeRect(x,y,80,30);}
  if(this.room==='barn'){barnMaterials(this);this.add.tileSprite(160,220,880,586,'barn-floor').setOrigin(0).setDepth(.5);}

  g.fillStyle(0xc3b183);g.fillRect(150,140,900,80);g.fillStyle(0x624b36);g.fillRect(150,210,900,14);g.fillRect(150,140,14,680);g.fillRect(1036,140,14,680);g.fillRect(150,806,380,14);g.fillRect(670,806,380,14);g.fillStyle(0x9b7b4e);g.fillRect(530,790,140,35);
  if(this.room==='barn'){
   for(const x of [170,460,740,1030])this.add.tileSprite(x,180,84,15,'barn-board').setRotation(Math.PI/2).setDepth(225);
   this.add.tileSprite(600,213,900,15,'barn-board').setDepth(226);
   for(const x of [325,880])if(this.textures.exists('life-window'))this.add.image(x,204,'life-window').setOrigin(.5,1).setDisplaySize(54,60).setDepth(220);
   const light=this.add.graphics().setDepth(3);light.fillStyle(0xe2bf75,.055);light.fillTriangle(300,222,370,222,520,790);light.fillTriangle(850,222,910,222,745,790);
  }
  const group=this.physics.add.staticGroup();
  const block=(x:number,y:number,w:number,h:number)=>{const z=this.add.zone(x+w/2,y+h/2,w,h);group.add(z);(z.body as Phaser.Physics.Arcade.StaticBody).setSize(w,h);this.blocks.push({x,y,width:w,height:h});};
  block(145,130,20,690);block(1035,130,20,690);block(150,130,900,90);block(150,807,380,18);block(670,807,380,18);
  const label=(x:number,y:number,text:string)=>this.add.text(x,y,text,{fontFamily:'monospace',fontSize:'12px',color:'#fff1cf',backgroundColor:'#334a37e6',padding:{x:9,y:5}}).setOrigin(.5).setDepth(1500);
  const prop=(key:string,x:number,y:number,scale:number,area?:[number,number,number,number],run?:()=>void)=>{this.add.image(x,y,`life-${key}`).setOrigin(.5,1).setScale(scale).setDepth(y);if(area)block(...area);if(run)this.points.push({x,y:y+35,run});};
  if(this.room==='house'){
   label(600,165,'LAR, DOCE LAR');g.fillStyle(0x5c8166,.8);g.fillRoundedRect(465,450,310,180,12);g.lineStyle(5,0xc5b780);g.strokeRoundedRect(475,460,290,160,8);
   prop('window',335,205,1);prop('window',840,205,1);prop('bed',300,430,1.25,[220,300,150,130],()=>s.open('Um tempo para descansar','<p>Sua cama está sempre pronta. A energia continua se recuperando com o tempo, mesmo com o jogo fechado.</p>'));
   prop('tv',690,330,1,[640,280,100,45],()=>s.open('TV do vale','<p>☀ Hoje no Vale do Sossego: tempo bom para plantar flores e visitar os amigos!</p><p>As notícias da fazenda chegam por aqui. Por enquanto, a TV exibe este boletim do vale.</p>'));
   prop('sofa',700,570,1.5,[610,490,180,65],()=>s.toast('Um cantinho tranquilo para desacelerar.'));
   prop('wardrobe',910,430,1,[860,320,95,105],()=>s.avatar());label(910,300,'GUARDA-ROUPA');
   prop('flowerPlanter',390,260,.7);label(300,285,'CAMA');label(690,245,'TV');
  }else{
   this.barn=buildBarn(this,s.farm(),block,id=>s.animals(id),()=>s.equipment());this.points.push(...this.barn.points);this.animalSignature=JSON.stringify(s.farm().animals.map(a=>a.id));
  }
  label(600,840,'SAÍDA · VOLTAR À FAZENDA');this.points.push({x:600,y:790,run:()=>this.leave()});
  this.player=this.physics.add.sprite(600,735,'farmer-down-0').setVisible(false).setOrigin(.5,1).setCollideWorldBounds(true);this.player.body!.setSize(14,10).setOffset(17,52);this.physics.world.setBounds(165,220,870,600);this.physics.add.collider(this.player,group);
  this.actor=this.add.sprite(600,735,'farmer-down-0').setOrigin(.5,62/64).setScale(1.08);
  this.cameras.main.setBounds(0,0,1200,950);this.cameras.main.startFollow(this.player,true,.1,.1,0,30);this.resize();this.scale.on('resize',this.resize,this);
  this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard!.on('keydown-E',(e:KeyboardEvent)=>{if(!e.repeat)this.interact();});this.input.keyboard!.on('keydown-ESC',()=>{if(!s.modal())this.leave();});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(s.modal())return;const point=this.cameras.main.getWorldPoint(p.x,p.y);const item=this.points.find(t=>Math.hypot((t.hitX??t.x)-point.x,(t.hitY??t.y-30)-point.y)<(t.radius??65));const target=item?{x:item.x,y:item.y,run:item.run}:{x:Phaser.Math.Clamp(point.x,185,1015),y:Phaser.Math.Clamp(point.y,240,790)};this.route=findPath(this.player,target,this.blocks);if(this.route.length)this.target=target;else s.toast('Aproxime-se pelo corredor livre.');});
  this.events.once('shutdown',()=>this.scale.off('resize',this.resize,this));
  s.toast(this.room==='house'?'Sua casa: cama, sala, TV e guarda-roupa. Toque para explorar.':'Explore o celeiro. Aproxime-se de um animal ou do suporte de ferramentas.');
 }
 private resize(){const camera=this.cameras.main;if(this.scale.width>=900){camera.stopFollow();camera.removeBounds();camera.setZoom(Math.min(this.scale.width/1150,this.scale.height/850));camera.centerOn(600,470);}else if(this.overview){camera.stopFollow();camera.removeBounds();camera.setZoom(Math.min(this.scale.width/980,(this.scale.height-170)/800));camera.centerOn(600,470);}else{camera.setBounds(0,0,1200,950);camera.startFollow(this.player,true,.1,.1,0,30);camera.setZoom(1.05);}}
 toggleView(){this.overview=!this.overview;this.resize();return this.overview;}

 private leave(){this.player.setVelocity(0);this.target=null;this.route=[];this.scene.stop();this.scene.wake('Farm');this.services.exit();}
 interact(){if(this.services.modal())return;const nearest=[...this.points].sort((a,b)=>Phaser.Math.Distance.Between(this.player.x,this.player.y,a.x,a.y)-Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y))[0];if(nearest&&Math.hypot(this.player.x-nearest.x,this.player.y-nearest.y)<110)nearest.run();else this.services.toast('Aproxime-se de um móvel, animal ou da saída.');}
 update(time:number){if(!this.player)return;const s=this.services;let vx=0,vy=0;
  if(!s.modal()){const stick=s.stick();vx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown)+stick.x;vy=Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)+stick.y;
   if(vx||vy){this.target=null;this.route=[];}else if(this.target){const p=this.route[0]??this.target,dx=p.x-this.player.x,dy=p.y-this.player.y,d=Math.hypot(dx,dy);if(d<8){if(this.route.length>1)this.route.shift();else{const done=this.target;this.target=null;done.run?.();}}else{vx=dx/d;vy=dy/d;}}
  }
  const len=Math.hypot(vx,vy);this.player.setVelocity(len?vx/Math.max(1,len)*145:0,len?vy/Math.max(1,len)*145:0);if(len>.1)this.dir=Math.abs(vx)>Math.abs(vy)?vx<0?1:2:vy<0?3:0;
  const tool=s.tool(),base=tool==='hand'?'farmer-v2':`carry-${tool}`,key=this.art.key(base,s.farm().avatar),frame=this.dir*4+(len>.1?Math.floor(time/140)%4:0);this.actor.setTexture(key,frame).setOrigin(.5,tool==='hand'?62/64:100/112).setPosition(this.player.x,this.player.y-2).setDepth(this.player.y);
  this.barn?.update(time,s.farm(),s.now());
  if(this.barn&&!s.modal()&&this.animalSignature!==JSON.stringify(s.farm().animals.map(a=>a.id)))this.scene.restart({room:'barn'});
 }
}
