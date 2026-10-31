import{nativeSkin}from'./avatar-attachment';
import Phaser from'phaser';import type{SprayTool}from'./plant-spray';
/** Small pump bottle anchored to the native hand; no watering-can sprite underneath. */
export class SprayerVisual{
 private hands:{x:number;y:number}[][]=[];private g:Phaser.GameObjects.Graphics;tip={x:0,y:0};
 constructor(scene:Phaser.Scene){this.g=scene.add.graphics();const cv=document.createElement('canvas');cv.width=192;cv.height=256;const c=cv.getContext('2d')!;c.drawImage(scene.textures.get('farmer-v2').getSourceImage() as HTMLImageElement,0,0);const d=c.getImageData(0,0,192,256).data;for(let dir=0;dir<4;dir++){this.hands[dir]=[];for(let frame=0;frame<4;frame++){const points:{x:number;y:number}[]=[];for(let y=39;y<50;y++)for(let x=dir===2?5:25;x<(dir===2?24:42);x++){const i=((dir*64+y)*192+frame*48+x)*4;if(d[i+3]>180&&nativeSkin(d[i],d[i+1],d[i+2]))points.push({x,y});}const low=Math.max(0,...points.map(p=>p.y)),palm=points.filter(p=>p.y>=low-2);this.hands[dir][frame]=palm.length?{x:palm.reduce((n,p)=>n+p.x,0)/palm.length,y:palm.reduce((n,p)=>n+p.y,0)/palm.length}:{x:dir===2?14:34,y:46};}}}
 update(actor:Phaser.GameObjects.Sprite,dir:number,kind?:SprayTool,elapsed?:number){const g=this.g;g.clear();if(!kind)return;const side=dir===1?-1:1,hand=this.hands[dir][(Number(actor.frame.name)||0)%4],p={x:Math.round(actor.x+(hand.x-24)*actor.scaleX),y:Math.round(actor.y+(hand.y-62)*actor.scaleY+5)},pump=elapsed!==undefined&&elapsed>260&&elapsed<850?Math.floor(elapsed/130)%2:0,fill=kind==='fertilizer'?0xcda255:0x83ac72;
 g.setDepth(actor.depth+(dir===3?-1:1)).fillStyle(0x344735).fillRect(p.x-4,p.y-7,8,12).fillRect(p.x-2,p.y-11,5,4).fillRect(p.x-1,p.y-12+pump,side===1?8:3,3);if(side<0)g.fillRect(p.x-8,p.y-12+pump,8,3);
 g.fillStyle(fill).fillRect(p.x-3,p.y-6,6,10).fillStyle(0xe6e7ba).fillRect(p.x-2,p.y-3,4,4).fillStyle(0xe9dfa6).fillRect(p.x-2,p.y-6,1,9).fillStyle(0x597655).fillRect(p.x-1,p.y-2,2,2);this.tip={x:p.x+side*8,y:p.y-11+pump};
 }
}
