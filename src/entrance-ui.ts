import type Phaser from 'phaser';
import {nearestEntrance,entranceUnlocked,AutoEntrance,type Entrance} from './entrances';
type State={inside:boolean;modal:boolean;working:boolean;lockedUntil:number};
export class EntranceControl {
 private gate=new AutoEntrance();
 constructor(_scene:Phaser.Scene,private player:{x:number;y:number;body?:Phaser.Physics.Arcade.Body|Phaser.Physics.Arcade.StaticBody|null},private button:HTMLButtonElement,private open:(entrance:Entrance)=>void,private state:()=>State){}
 hold(){this.gate.hold(this.player);}
 update(){this.button.hidden=true;const s=this.state();if(s.modal){this.hold();return;}const v=this.player.body&&'velocity' in this.player.body?this.player.body.velocity:undefined;const e=this.gate.update(this.player,!!v&&v.y< -10&&Math.abs(v.y)>Math.abs(v.x),entranceUnlocked(performance.now(),s.lockedUntil,s.inside,s.modal,s.working));if(e)this.open(e);}
 enter(reach=85){const s=this.state();if(!entranceUnlocked(performance.now(),s.lockedUntil,s.inside,s.modal,s.working))return false;const near=nearestEntrance(this.player,reach);if(!near)return false;this.hold();this.button.hidden=true;this.open(near);return true;}
}
