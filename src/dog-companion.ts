import Phaser from 'phaser';
import {dogArt,DOG_WALK_TEXTURE,DOG_REST_TEXTURE} from './dog-art';
import type {Farm} from './farm';
import {ANIMAL_SIZE} from './barn-layout';
import {dogFollowRoute,dogFacing,dogFrame,type DogFacing} from './dog-motion';
import type {Point,Obstacle} from './pathfinding';
type Dog={actor:Phaser.GameObjects.Image;sprite:Phaser.Physics.Arcade.Sprite;shadow:Phaser.GameObjects.Ellipse;name:Phaser.GameObjects.Text;route:Point[];nextRoute:number;stoppedAt:number;facing:DogFacing;last:Point;distance:number;stuck:number};
/** Owned visual companions. Feeding, water and protection stay authoritative on the server. */
export class DogCompanions {
 private dogs=new Map<string,Dog>();private obstacleCache:Obstacle[]|null=null;private obstacleCount=-1;private nextPlan=0;
 invalidateObstacles(){this.obstacleCache=null;}
 constructor(private scene:Phaser.Scene,private player:Phaser.Physics.Arcade.Sprite,private obstacles:Phaser.Physics.Arcade.StaticGroup,private otherAnimals:Phaser.GameObjects.Sprite[]){}
 update(farm:Farm){
  const owned=farm.animals.filter(a=>a.kind==='dog'),ids=new Set(owned.map(a=>a.id)),now=this.scene.time.now;
  for(const [id,dog] of this.dogs)if(!ids.has(id)){dog.sprite.destroy();dog.actor.destroy();dog.shadow.destroy();dog.name.destroy();this.dogs.delete(id);}
  if(!owned.length&&!this.dogs.size)return;dogArt(this.scene);
  const children=this.obstacles.getChildren();if(!this.obstacleCache||this.obstacleCount!==children.length){this.obstacleCount=children.length;this.obstacleCache=children.map(o=>{const b=(o as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody;return{x:b.x,y:b.y,width:b.width,height:b.height};});}const obstacles=this.obstacleCache;let planned=0;
  owned.forEach((animal,index)=>{
   let dog=this.dogs.get(animal.id);
   if(!dog){
    const route=dogFollowRoute(this.player,this.player,index,obstacles),spawn=route.at(-1);if(!spawn)return;
    const sprite=this.scene.physics.add.sprite(spawn.x,spawn.y,DOG_REST_TEXTURE,0).setOrigin(.5,1).setDisplaySize(ANIMAL_SIZE.dog.width,ANIMAL_SIZE.dog.height).setCollideWorldBounds(true).setVisible(false);
    (sprite.body as Phaser.Physics.Arcade.Body).setSize(30,12).setOffset(9,34);
    this.scene.physics.add.collider(sprite,this.obstacles);this.scene.physics.add.collider(sprite,this.player);
    for(const other of this.otherAnimals)this.scene.physics.add.collider(sprite,other);for(const other of this.dogs.values())this.scene.physics.add.collider(sprite,other.sprite);
    const actor=this.scene.add.image(spawn.x,spawn.y,DOG_REST_TEXTURE,0).setOrigin(.5,1).setDisplaySize(ANIMAL_SIZE.dog.width,ANIMAL_SIZE.dog.height);
    dog={actor,sprite,shadow:this.scene.add.ellipse(spawn.x,spawn.y-2,22,6,0x203726,.28),name:this.scene.add.text(spawn.x,spawn.y-37,'',{fontFamily:'monospace',fontSize:'9px',color:'#fff4d6',backgroundColor:'#334a37c9',padding:{x:3,y:2}}).setOrigin(.5),route:[],nextRoute:now+index*130,stoppedAt:now,facing:0,last:{...spawn},distance:0,stuck:0};this.dogs.set(animal.id,dog);
   }
   const dx=dog.sprite.x-dog.last.x,dy=dog.sprite.y-dog.last.y,moved=Math.hypot(dx,dy),distance=Math.hypot(this.player.x-dog.sprite.x,this.player.y-dog.sprite.y);
   if(moved>.04){dog.distance+=moved;dog.facing=dogFacing(dx,dy);dog.stoppedAt=now;dog.stuck=0;dog.actor.setTexture(DOG_WALK_TEXTURE,dogFrame(dog.facing,dog.distance));}
   else {dog.actor.setTexture(DOG_REST_TEXTURE,(now-dog.stoppedAt>10000?4:0)+dog.facing);if(dog.route.length)dog.stuck++;}
   dog.last={x:dog.sprite.x,y:dog.sprite.y};
   if(distance>90&&now>=dog.nextRoute&&planned<1&&now>=this.nextPlan){dog.route=dogFollowRoute(dog.sprite,this.player,index,obstacles);dog.nextRoute=now+1300+index*30;planned++;this.nextPlan=now+150;}
   if(dog.stuck>45){dog.route=[];dog.nextRoute=now+500;dog.stuck=0;}
   while(dog.route.length&&Math.hypot(dog.route[0].x-dog.sprite.x,dog.route[0].y-dog.sprite.y)<8)dog.route.shift();
   const target=dog.route[0];if(target){const vx=target.x-dog.sprite.x,vy=target.y-dog.sprite.y,len=Math.hypot(vx,vy),speed=distance>150?170:95;dog.sprite.setVelocity(vx/Math.max(1,len)*speed,vy/Math.max(1,len)*speed);}else dog.sprite.setVelocity(0);
   dog.actor.setPosition(Math.round(dog.sprite.x),Math.round(dog.sprite.y)).setDepth(dog.sprite.y).setAlpha(1).setBlendMode(Phaser.BlendModes.NORMAL).setDisplaySize(ANIMAL_SIZE.dog.width,ANIMAL_SIZE.dog.height);dog.shadow.setPosition(dog.sprite.x,dog.sprite.y-2).setDepth(dog.sprite.y-.2);dog.name.setText(animal.name??'').setPosition(dog.sprite.x,dog.sprite.y-35).setDepth(dog.sprite.y+1).setVisible(!!animal.name);
  });
 }
}
