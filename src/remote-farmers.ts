import Phaser from 'phaser';
import {AvatarArt} from './avatar-art';
import type {Avatar} from './content';
type Player={code:string;name:string;avatar:Avatar;x:number;y:number;direction:number};
export class RemoteFarmers{
 private art:AvatarArt;private players=new Map<string,{data:Player;sprite:Phaser.GameObjects.Sprite;label:Phaser.GameObjects.Text;shadow:Phaser.GameObjects.Ellipse;last:number}>();
 constructor(private scene:Phaser.Scene){this.art=new AvatarArt(scene);scene.events.once('shutdown',()=>this.destroy());}
 accept(players:Player[]){const present=new Set(players.map(p=>p.code));for(const [key,p]of this.players)if(!present.has(key)){p.sprite.destroy();p.label.destroy();p.shadow.destroy();this.players.delete(key);}
  for(const data of players){let p=this.players.get(data.code);if(!p){p={data,sprite:this.scene.add.sprite(data.x,data.y,this.art.key('farmer-v2',data.avatar),0).setOrigin(.5,62/64).setScale(1.08),label:this.scene.add.text(data.x,data.y-70,data.name,{fontFamily:'sans-serif',fontSize:'11px',color:'#fffbea',backgroundColor:'#263e32cc',padding:{x:6,y:3}}).setOrigin(.5),shadow:this.scene.add.ellipse(data.x,data.y-3,24,8,0x20392b,.25),last:performance.now()};this.players.set(data.code,p);}p.data=data;p.last=performance.now();}
 }
 update(time:number){for(const p of this.players.values()){if(performance.now()-p.last>14000){p.sprite.setVisible(false);p.label.setVisible(false);p.shadow.setVisible(false);continue;}const d=Math.hypot(p.data.x-p.sprite.x,p.data.y-p.sprite.y),walking=d>2;if(d>220)p.sprite.setPosition(p.data.x,p.data.y);else p.sprite.setPosition(Phaser.Math.Linear(p.sprite.x,p.data.x,.16),Phaser.Math.Linear(p.sprite.y,p.data.y,.16));p.sprite.setVisible(true).setTexture(this.art.key('farmer-v2',p.data.avatar),p.data.direction*4+(walking?Math.floor(time/140)%4:0)).setDepth(p.sprite.y);p.label.setVisible(true).setPosition(p.sprite.x,p.sprite.y-72).setDepth(p.sprite.y+100);p.shadow.setVisible(true).setPosition(p.sprite.x,p.sprite.y-3).setDepth(p.sprite.y-.1);}}
 destroy(){for(const p of this.players.values()){p.sprite.destroy();p.label.destroy();p.shadow.destroy();}this.players.clear();this.art.destroy();}
}
