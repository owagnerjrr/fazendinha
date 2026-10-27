import Phaser from 'phaser';
import type { Farm } from './farm';
import { ANIMAL_SIZE } from './barn-layout';
import { findPath, type Point } from './pathfinding';

type Dog = { sprite: Phaser.Physics.Arcade.Image; shadow: Phaser.GameObjects.Ellipse; name: Phaser.GameObjects.Text; route: Point[]; nextRoute: number };
/** Visual companions represent owned dogs. Protection is still decided by server rules. */
export class DogCompanions {
  private dogs = new Map<string, Dog>();
  constructor(private scene: Phaser.Scene, private player: Phaser.Physics.Arcade.Sprite, private obstacles: Phaser.Physics.Arcade.StaticGroup) {}
  update(farm: Farm) {
    const owned = farm.animals.filter(a => a.kind === 'dog');
    const ids = new Set(owned.map(a => a.id));
    for (const [id, dog] of this.dogs) if (!ids.has(id)) {
      dog.sprite.destroy(); dog.shadow.destroy(); dog.name.destroy(); this.dogs.delete(id);
    }
    owned.forEach((animal, index) => {
      let dog = this.dogs.get(animal.id);
      if (!dog) {
        const sprite = this.scene.physics.add.image(this.player.x + 30, this.player.y + 20, 'life-dog').setOrigin(.5, 1).setDisplaySize(ANIMAL_SIZE.dog.width, ANIMAL_SIZE.dog.height).setCollideWorldBounds(true);
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        body.setSize(70, 25).setOffset(20, 90);
        this.scene.physics.add.collider(sprite, this.obstacles);
        dog = {sprite,shadow:this.scene.add.ellipse(sprite.x,sprite.y-2,22,6,0x203726,.28),name:this.scene.add.text(sprite.x,sprite.y-37,'',{fontFamily:'monospace',fontSize:'9px',color:'#fff4d6',backgroundColor:'#334a37c9',padding:{x:3,y:2}}).setOrigin(.5),route:[],nextRoute:0};
        this.dogs.set(animal.id,dog);
      }
      const angle = index * 2.1, tx=this.player.x+Math.cos(angle)*48, ty=this.player.y+Math.sin(angle)*35;
      const distanceToOwner=Math.hypot(tx-dog.sprite.x,ty-dog.sprite.y);
      if(distanceToOwner>55 && this.scene.time.now>=dog.nextRoute){
        const obstacles=this.obstacles.getChildren().map(o=>{const b=(o as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody;return {x:b.x,y:b.y,width:b.width,height:b.height};});
        dog.route=findPath(dog.sprite,{x:this.player.x,y:this.player.y},obstacles);dog.nextRoute=this.scene.time.now+1500;
      }
      while(dog.route.length && Math.hypot(dog.route[0].x-dog.sprite.x,dog.route[0].y-dog.sprite.y)<12)dog.route.shift();
      const next=dog.route[0]??{x:tx,y:ty},dx=next.x-dog.sprite.x,dy=next.y-dog.sprite.y,distance=Math.hypot(dx,dy);
      if(distanceToOwner>30 && distance>2){dog.sprite.setVelocity(dx/distance*85,dy/distance*85);dog.sprite.setFlipX(dx<0);} else {dog.sprite.setVelocity(0);dog.route=[];}
      dog.sprite.setDepth(dog.sprite.y);dog.shadow.setPosition(dog.sprite.x,dog.sprite.y-2).setDepth(dog.sprite.y-.2);
      dog.name.setText(animal.name??'').setPosition(dog.sprite.x,dog.sprite.y-35).setDepth(dog.sprite.y+1).setVisible(!!animal.name);
    });
  }
}
