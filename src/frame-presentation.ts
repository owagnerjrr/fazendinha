import{stableCameraScroll}from'./stable-camera-scroll';
import{PhysicsPose}from'./physics-pose';
import type Phaser from 'phaser';
type Point={x:number;y:number};
/** Draw after Arcade commits. Interpolate visual positions; leave collision bodies untouched. */
export function postPhysicsDraw(scene:Phaser.Scene,draw:(time:number,moving:boolean,position?:Point)=>void,roundPixels=false,source?:Phaser.Physics.Arcade.Sprite){
 const releaseCamera=stableCameraScroll(scene.cameras.main),world=source?scene.physics.world:undefined,pose=source?new PhysicsPose(source):undefined;
 const step=()=>{const body=source?.body as Phaser.Physics.Arcade.Body|undefined;if(body)pose?.step(body.prev,body.position);};world?.on('worldstep',step);
 let pending=false,time=0,moving=false,last=0;
 const render=()=>{if(!pending)return;pending=false;const dt=last?Math.min(100,Math.max(0,time-last)):1000/60;last=time;const cam=scene.cameras.main;cam.roundPixels=roundPixels;cam.setLerp(followLerp(.09,dt),followLerp(.09,dt));
  let position:Point|undefined;
  if(source&&pose&&world){const clock=world as Phaser.Physics.Arcade.World & {_elapsed:number;_frameTimeMS:number},body=source.body as Phaser.Physics.Arcade.Body;position=pose.sample(source,body.position,world.fixedStep?clock._elapsed/(clock._frameTimeMS*world.timeScale):1);}
  draw(time,moving,position);
 };
 scene.events.on('postupdate',render);scene.events.once('shutdown',()=>{scene.events.off('postupdate',render);world?.off('worldstep',step);releaseCamera();});
 return Object.assign((t:number,m:boolean)=>{time=t;moving=m;pending=true;},{position:pose?.position??{x:0,y:0}});
}
export function followLerp(base:number,delta:number){return 1-Math.pow(1-base,Math.max(0,delta)/(1000/60));}
