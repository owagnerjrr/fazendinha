import{petStroke}from'./pet-motion';
import type Phaser from'phaser';
import type{Point}from'./pathfinding';
export function drawCreatedCare(g:Phaser.GameObjects.Graphics,player:Point,animal:Point,mode:string,elapsed:number,height:number,skin=0xd8ad86,shirt=0x547044){
 const side=animal.x<player.x?-1:1,play=mode==='play',{shoulder,hand,elbow,visible}=petStroke(player,{x:animal.x-side*4,y:animal.y-height},side,elapsed);if(!visible)return;
 g.lineStyle(5,0x49382a).lineBetween(shoulder.x,shoulder.y,elbow.x,elbow.y).lineBetween(elbow.x,elbow.y,hand.x,hand.y).lineStyle(3,skin).lineBetween(shoulder.x,shoulder.y,elbow.x,elbow.y).lineBetween(elbow.x,elbow.y,hand.x,hand.y);
 g.lineStyle(3,shirt).lineBetween(shoulder.x,shoulder.y,elbow.x,elbow.y);
 if(play){const x=Math.round(hand.x),y=Math.round(hand.y);g.fillStyle(0x774a2d).fillRect(x-4,y-2,9,5).fillStyle(0xe7a04e).fillRect(x-3,y-1,7,3).fillStyle(0x6b964d).fillRect(x+3,y-4,2,3).fillRect(x+5,y-3,2,2);}
}
