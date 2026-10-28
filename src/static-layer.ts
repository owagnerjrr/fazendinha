import Phaser from 'phaser';
/** Floors, rugs and fixed light shapes become one cached GPU quad, once per room entry. */
export function bakeFloor(scene:Phaser.Scene,box:{x:number;y:number;width:number;height:number}){
 if(scene.game.renderer.type!==Phaser.WEBGL)return 0;
 const nodes=scene.children.list.filter(o=>('depth'in o)&&Number(o.depth)<10&&
  (o instanceof Phaser.GameObjects.Graphics||o instanceof Phaser.GameObjects.Image||o instanceof Phaser.GameObjects.TileSprite)).sort((a,b)=>Number((a as Phaser.GameObjects.Graphics).depth)-Number((b as Phaser.GameObjects.Graphics).depth));
 if(!nodes.length)return 0;
 const floor=scene.add.renderTexture(box.x,box.y,box.width,box.height).setOrigin(0).setDepth(9);
 floor.draw(nodes,-box.x,-box.y);for(const node of nodes)node.destroy();return nodes.length;
}
