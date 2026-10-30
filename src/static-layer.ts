import Phaser from 'phaser';
import {cacheFloorNodes,isStaticFloorNode} from './floor-cache';
/** Cache only visible static floor art. The same lifetime rules run on Canvas and WebGL. */
export function bakeFloor(scene:Phaser.Scene,box:{x:number;y:number;width:number;height:number}){
 const nodes=scene.children.list.filter((o):o is Phaser.GameObjects.Graphics|Phaser.GameObjects.Image|Phaser.GameObjects.TileSprite=>
  (o instanceof Phaser.GameObjects.Graphics||o instanceof Phaser.GameObjects.Image||o instanceof Phaser.GameObjects.TileSprite)&&isStaticFloorNode(o)).sort((a,b)=>a.depth-b.depth);
 if(!nodes.length)return 0;
 try{const floor=scene.add.renderTexture(box.x,box.y,box.width,box.height).setOrigin(0).setDepth(9);return cacheFloorNodes(nodes,box,floor);}catch{return 0;}
}
