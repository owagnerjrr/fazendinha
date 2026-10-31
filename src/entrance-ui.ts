import type Phaser from 'phaser';
import {doorwayAt,entranceUnlocked,type Entrance} from './entrances';
type State={inside:boolean;modal:boolean;working:boolean;lockedUntil:number};
export class EntranceControl {
 constructor(_scene:Phaser.Scene,private player:{x:number;y:number},private button:HTMLButtonElement,private open:(entrance:Entrance)=>void,private state:()=>State){}
 update(){const s=this.state(),e=doorwayAt(this.player);this.button.hidden=!e||s.inside||s.modal;this.button.disabled=!entranceUnlocked(performance.now(),s.lockedUntil,s.inside,s.modal,s.working);if(e){this.button.textContent='Entrar · '+e.name;this.button.setAttribute('aria-label','Entrar: '+e.name);}}
 enter(){const s=this.state();if(!entranceUnlocked(performance.now(),s.lockedUntil,s.inside,s.modal,s.working))return false;const e=doorwayAt(this.player);if(!e)return false;this.button.hidden=true;this.open(e);return true;}
}
