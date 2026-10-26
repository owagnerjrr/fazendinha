import Phaser from 'phaser';
import { AvatarArt } from './avatar-art';
import { ANIMALS, animalReady, type Animal } from './content';
import type { Farm, Tool } from './farm';
import { findPath } from './pathfinding';
type Services={farm:()=>Farm;stick:()=>{x:number;y:number};modal:()=>boolean;tool:()=>Tool;now:()=>number;avatar:()=>void;animals:(id?:string)=>void;equipment:()=>void;toast:(s:string)=>void;open:(title:string,html:string)=>void;exit:()=>void};
export class InteriorScene extends Phaser.Scene {
 private room:'house'|'barn'='house';private player!:Phaser.Physics.Arcade.Sprite;private actor!:Phaser.GameObjects.Sprite;private art!:AvatarArt;private keys!:Record<string,Phaser.Input.Keyboard.Key>;private dir=0;private target:{x:number;y:number;run?:()=>void}|null=null;private route:{x:number;y:number}[]=[];private blocks:{x:number;y:number;width:number;height:number}[]=[];private points:{x:number;y:number;run:()=>void}[]=[];private animalSprites:{animal:Animal;sprite:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text;x:number;y:number}[]=[];
 constructor(private services:Services){super('Interior');}
 init(data:{room:'house'|'barn'}){this.room=data.room;this.target=null;this.route=[];this.blocks=[];this.points=[];this.animalSprites=[];}
 create(){
  const s=this.services;this.art=new AvatarArt(this);this.cameras.main.setBackgroundColor('#20382f');
  const g=this.add.graphics();g.fillStyle(this.room==='house'?0x8d633d:0x746347);g.fillRect(160,210,880,610);
  for(let y=210;y<820;y+=30)for(let x=160;x<1040;x+=80){g.fillStyle(this.room==='house'?((x+y)%3?0xb28a52:0xa37a47):((x+y)%3?0x998457:0x8b764e));g.fillRect(x+(y%60?0:20),y,78,28);g.lineStyle(1,0x5d4b35,.3);g.strokeRect(x,y,80,30);}
  g.fillStyle(0xc3b183);g.fillRect(150,140,900,80);g.fillStyle(0x624b36);g.fillRect(150,210,900,14);g.fillRect(150,140,14,680);g.fillRect(1036,140,14,680);g.fillRect(150,806,380,14);g.fillRect(670,806,380,14);g.fillStyle(0x9b7b4e);g.fillRect(530,790,140,35);
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
   label(600,165,'CELEIRO · ANIMAIS E EQUIPAMENTOS');prop('rack',600,330,1.25,[525,270,150,55],()=>s.equipment());label(600,240,'EQUIPAMENTOS');
   const slots=[{x:290,y:410},{x:425,y:410},{x:785,y:410},{x:920,y:410},{x:290,y:570},{x:425,y:570},{x:785,y:570},{x:920,y:570},{x:290,y:735},{x:425,y:735},{x:785,y:735},{x:920,y:735}];
   slots.forEach((p,i)=>{g.fillStyle(0xc3a567,.3);g.fillRoundedRect(p.x-58,p.y-85,116,110,8);g.lineStyle(4,0x665038);g.strokeRoundedRect(p.x-58,p.y-85,116,110,8);const a=s.farm().animals[i];
    if(a){const sprite=this.add.image(p.x,p.y,`life-${a.kind}`).setOrigin(.5,1).setScale(a.kind==='cow'?.8:.65).setDepth(p.y);const t=label(p.x,p.y-90,ANIMALS[a.kind].name);this.animalSprites.push({animal:a,sprite,label:t,...p});this.points.push({x:p.x,y:p.y+25,run:()=>s.animals(a.id)});}
    else {label(p.x,p.y-30,'BAIA LIVRE');}
   });
  }
  label(600,840,'SAÍDA · VOLTAR À FAZENDA');this.points.push({x:600,y:790,run:()=>this.leave()});
  this.player=this.physics.add.sprite(600,735,'farmer-down-0').setVisible(false).setOrigin(.5,1).setCollideWorldBounds(true);this.player.body!.setSize(14,10).setOffset(17,52);this.physics.world.setBounds(165,220,870,600);this.physics.add.collider(this.player,group);
  this.actor=this.add.sprite(600,735,'farmer-down-0').setOrigin(.5,62/64).setScale(1.08);
  this.cameras.main.setBounds(100,80,1000,840);this.cameras.main.startFollow(this.player,true,.1,.1,0,30);this.resize();this.scale.on('resize',this.resize,this);
  this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard!.on('keydown-E',()=>this.interact());this.input.keyboard!.on('keydown-ESC',()=>{if(!s.modal())this.leave();});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(s.modal())return;const point=this.cameras.main.getWorldPoint(p.x,p.y);const item=this.points.find(t=>Math.hypot(t.x-point.x,t.y-30-point.y)<85);const target=item?{x:item.x,y:item.y,run:item.run}:{x:Phaser.Math.Clamp(point.x,185,1015),y:Phaser.Math.Clamp(point.y,240,790)};this.route=findPath(this.player,target,this.blocks);if(this.route.length)this.target=target;else s.toast('Aproxime-se pelo corredor livre.');});
  this.events.once('shutdown',()=>this.scale.off('resize',this.resize,this));
  s.toast(this.room==='house'?'Sua casa: cama, sala, TV e guarda-roupa. Toque para explorar.':'Explore o celeiro. Aproxime-se de um animal ou do suporte de ferramentas.');
 }
 private resize(){this.cameras.main.setZoom(this.scale.width<600?1.05:1.1);}
 private leave(){this.player.setVelocity(0);this.target=null;this.route=[];this.scene.stop();this.scene.wake('Farm');this.services.exit();}
 interact(){if(this.services.modal())return;const nearest=[...this.points].sort((a,b)=>Phaser.Math.Distance.Between(this.player.x,this.player.y,a.x,a.y)-Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y))[0];if(nearest&&Math.hypot(this.player.x-nearest.x,this.player.y-nearest.y)<110)nearest.run();else this.services.toast('Aproxime-se de um móvel, animal ou da saída.');}
 update(time:number){if(!this.player)return;const s=this.services;let vx=0,vy=0;
  if(!s.modal()){const stick=s.stick();vx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown)+stick.x;vy=Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)+stick.y;
   if(vx||vy){this.target=null;this.route=[];}else if(this.target){const p=this.route[0]??this.target,dx=p.x-this.player.x,dy=p.y-this.player.y,d=Math.hypot(dx,dy);if(d<8){if(this.route.length>1)this.route.shift();else{const done=this.target;this.target=null;done.run?.();}}else{vx=dx/d;vy=dy/d;}}
  }
  const len=Math.hypot(vx,vy);this.player.setVelocity(len?vx/Math.max(1,len)*145:0,len?vy/Math.max(1,len)*145:0);if(len>.1)this.dir=Math.abs(vx)>Math.abs(vy)?vx<0?1:2:vy<0?3:0;
  const tool=s.tool(),base=tool==='hand'?'farmer-v2':`carry-${tool}`,key=this.art.key(base,s.farm().avatar),frame=this.dir*4+(len>.1?Math.floor(time/140)%4:0);this.actor.setTexture(key,frame).setOrigin(.5,tool==='hand'?62/64:100/112).setPosition(this.player.x,this.player.y-2).setDepth(this.player.y);
  for(const a of this.animalSprites){const owned=s.farm().animals.find(x=>x.id===a.animal.id);if(!owned)continue;const ready=animalReady(owned,s.now());a.label.setText(`${ANIMALS[owned.kind].name}${ready?' · COLHER':''}`);a.sprite.setPosition(a.x+Math.sin(time/1000+a.x)*3,a.y+Math.sin(time/700+a.x)*1.3).setDepth(a.y);}
 }
}
