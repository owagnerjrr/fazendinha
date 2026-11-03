import type Phaser from'phaser';
import type{Point}from'./pathfinding';
export function drawCreatedCare(g:Phaser.GameObjects.Graphics,player:Point,animal:Point,mode:string,elapsed:number,height:number,skin=0xd8ad86,shirt=0x547044){
 const side=animal.x<player.x?-1:1,play=mode==='play',shoulder={x:player.x+side*9,y:player.y-29},hand=play?{x:player.x+side*18,y:player.y-23+Math.sin(elapsed/220)*2}:{x:animal.x-side*4,y:animal.y-height+Math.sin(elapsed/160)},elbow={x:(shoulder.x+hand.x)/2,y:Math.max(shoulder.y,hand.y)+7};
 g.lineStyle(5,0x49382a).lineBetween(shoulder.x,shoulder.y,elbow.x,elbow.y).lineBetween(elbow.x,elbow.y,hand.x,hand.y).lineStyle(3,skin).lineBetween(shoulder.x,shoulder.y,elbow.x,elbow.y).lineBetween(elbow.x,elbow.y,hand.x,hand.y);
 g.lineStyle(3,shirt).lineBetween(shoulder.x,shoulder.y,elbow.x,elbow.y);
 if(play){const t=Math.min(1,elapsed/550),target={x:animal.x-side*12+Math.sin(elapsed/180)*3,y:animal.y-4},x=Math.round(hand.x+(target.x-hand.x)*t),y=Math.round(hand.y+(target.y-hand.y)*t-Math.sin(t*Math.PI)*17);g.fillStyle(0x774a2d).fillRect(x-4,y-2,9,5).fillStyle(0xe7a04e).fillRect(x-3,y-1,7,3).fillStyle(0x6b964d).fillRect(x+3,y-4,2,3).fillRect(x+5,y-3,2,2);}
}
