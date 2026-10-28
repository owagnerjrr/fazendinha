import type Phaser from 'phaser';
import {nearestEntrance,entranceUnlocked,type Entrance} from './entrances';
type State={inside:boolean;modal:boolean;working:boolean;lockedUntil:number};
/** Same contextual control in the farm and the isolated scene integration checks. */
export class EntranceControl {
 private next=0;private ring:Phaser.GameObjects.Ellipse;
 constructor(scene:Phaser.Scene,private player:{x:number;y:number},private button:HTMLButtonElement,private open:(entrance:Entrance)=>void,private state:()=>State){
  this.ring=scene.add.ellipse(0,0,56,20,0xe8ce8a,.15).setStrokeStyle(2,0xf1d68b,.85).setDepth(4).setVisible(false);
 }
 update(){const now=performance.now();if(now<this.next)return;this.next=now+100;const s=this.state(),near=nearestEntrance(this.player);this.button.hidden=!near||s.modal||s.inside;this.button.disabled=!entranceUnlocked(performance.now(),s.lockedUntil,s.inside,s.modal,s.working);if(near){const label=`Entrar: ${near.name}${innerWidth>=800?' · E':''}`;if(this.button.textContent!==label)this.button.textContent=label;}this.ring.setVisible(!!near&&!s.modal&&!s.inside);if(near)this.ring.setPosition(near.x,near.y+5);}
 enter(){const s=this.state();if(!entranceUnlocked(performance.now(),s.lockedUntil,s.inside,s.modal,s.working))return false;const near=nearestEntrance(this.player);if(!near)return false;this.button.hidden=true;this.open(near);return true;}
}
