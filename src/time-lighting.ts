import{SOUTH_LIGHTS}from'./south-nature-layout';
import type Phaser from'phaser';import{worldTime,type Calendar}from'./world-time';import{dayLight}from'./day-light';
const GLOW='time-light-glow';
/** Rasterize the five soft rings once, rather than triangulating every lamp every frame. */
export class TimeLighting{
 private next=0;private shade:Phaser.GameObjects.Rectangle;private glows:Phaser.GameObjects.Image[]=[];
 constructor(private scene:Phaser.Scene,private interior=false,private room='farm',private lamp?:()=>{x:number;y:number}){
  this.shade=scene.add.rectangle(0,0,1,1,0x16223d,1).setAlpha(0).setScrollFactor(0).setDepth(4000);
  if(!scene.textures.exists(GLOW)){const t=scene.textures.createCanvas(GLOW,96,72)!;const c=t.getContext();c.globalCompositeOperation='lighter';c.fillStyle='#ffc975';c.globalAlpha=.035;for(let i=5;i>0;i--){c.beginPath();c.ellipse(48,36,i*8.5,i*6,0,0,Math.PI*2);c.fill();}t.refresh();}
 }
 update(calendar:Calendar|undefined,now:number,lightsOn?:boolean){if(now<this.next)return;this.next=now+100;const cam=this.scene.cameras.main,p=dayLight(worldTime(calendar,now).minuteOfDay),alpha=this.interior?(lightsOn===true?p.alpha*.2:lightsOn===false?Math.max(.2,p.alpha*.8):p.alpha*.55):p.alpha;this.shade.setPosition(cam.width/2,cam.height/2).setSize(cam.width/cam.zoom+4,cam.height/cam.zoom+4).setFillStyle(p.color).setAlpha(Math.min(.78,alpha*(calendar?.lightScale??1)));
  const sources=this.interior?(this.room==='house'?(lightsOn===false?[]:[this.lamp?.()??{x:303,y:670},{x:335,y:230},{x:845,y:230}]):[{x:216,y:215},{x:501,y:215},{x:699,y:215},{x:985,y:215}]):this.room==='expansion'?SOUTH_LIGHTS:[{x:396,y:360},{x:1030,y:326},{x:1050,y:718},{x:1120,y:948}];
  for(let i=0;i<Math.max(sources.length,this.glows.length);i++){const source=sources[i];if(!source){this.glows[i].setVisible(false);continue;}const glow=this.glows[i]??(this.glows[i]=this.scene.add.image(0,0,GLOW).setDepth(4001).setBlendMode(1));glow.setVisible(p.lamps>0).setPosition(source.x,source.y+9).setAlpha(p.lamps*(this.interior?1:5/7));}
 }
}
