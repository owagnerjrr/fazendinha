import type Phaser from 'phaser';import {nightOpacity,worldTime,type Calendar} from './world-time';
export class TimeLighting{
 private shade:Phaser.GameObjects.Rectangle;
 constructor(private scene:Phaser.Scene,private interior=false){this.shade=scene.add.rectangle(0,0,1,1,0x16223d,1).setAlpha(0).setScrollFactor(0).setDepth(4000);}
 update(calendar:Calendar|undefined,now:number){const cam=this.scene.cameras.main,t=worldTime(calendar,now);this.shade.setPosition(cam.width/2,cam.height/2).setSize(cam.width/cam.zoom+4,cam.height/cam.zoom+4).setAlpha(nightOpacity(t.minuteOfDay)*(this.interior?.45:1));}
}
