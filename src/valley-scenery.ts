import type Phaser from 'phaser';
import {reservedLandPoint} from './plots';
import {riverWalkable,riverBank,DOCK} from './river-boundary';
import {lightEffects} from './display-settings';
/** Static original meadow dressing, baked once instead of hundreds of live objects. */
export function valleyScenery(scene:Phaser.Scene){
 const key='vale-meadow-details';if(!scene.textures.exists(key)){
  const cv=document.createElement('canvas');cv.width=1600;cv.height=1200;const c=cv.getContext('2d')!;let seed=719;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const clear=(x:number,y:number)=>!riverWalkable({x,y})||reservedLandPoint(x,y)||x>590&&x<890&&y>390&&y<630||x>330&&x<500&&y>290&&y<485||x>950&&x<1120&&y>280&&y<435||x>950&&x<1150&&y>660&&y<850||Math.abs(x-750)<32||Math.abs(y-650)<26||Math.abs(y-865)<24;
  for(let i=0;i<2100;i++){const x=Math.round(120+random()*1190),y=Math.round(220+random()*850);if(clear(x,y))continue;c.fillStyle=['#75974d70','#4b793e65','#b1c77965'][i%3];c.fillRect(x,y,1,3);c.fillRect(x-2,y-1,1,2);if(i%6===0){const colors=['#f4e1a8','#d6b6c3','#ebbe70','#e7edd3'],flower=colors[i%4];c.fillStyle='#476c3e';c.fillRect(x,y-3,1,4);c.fillStyle=flower;c.fillRect(x-2,y-5,5,2);c.fillRect(x-1,y-6,3,4);c.fillStyle='#c2a15b';c.fillRect(x,y-5,1,1);}}
  for(const [x,y]of [[350,465],[466,465],[976,421],[1091,421],[981,831],[1115,831]]){c.fillStyle='#2e482c20';c.beginPath();c.ellipse(x,y+2,18,5,0,0,Math.PI*2);c.fill();c.fillStyle='#8e6646';c.fillRect(x-9,y-14,18,15);c.fillStyle='#c29662';c.fillRect(x-11,y-16,22,4);for(let n=0;n<7;n++){c.fillStyle=n%2?'#f3d6ac':'#d49ea3';c.fillRect(x-10+n*3,y-25-(n%3)*3,5,5);c.fillStyle='#557c43';c.fillRect(x-8+n*3,y-20,2,5);}}
  // Pebbles, reeds and moss give the shoreline a natural edge while preserving collision bounds.
  for(let y=200;y<1100;y+=23){if(y>DOCK.top-18&&y<DOCK.bottom+18)continue;const x=riverBank(y)-2;c.fillStyle='#385f3e80';c.fillRect(x-10,y,12,4);c.fillStyle='#b1b896';c.fillRect(x-5,y-2,7,4);c.fillStyle='#d5d2ac';c.fillRect(x-4,y-3,4,1);if(y%3===0){c.fillStyle='#54783f';c.fillRect(x-16,y-8,2,12);c.fillRect(x-20,y-5,2,8);c.fillStyle='#d5bd83';c.fillRect(x-16,y-11,2,5);}}
  // Terrace timber has grain, small joinery and a shadow rather than a flat frame.
  c.fillStyle='#293b2525';c.fillRect(597,606,285,7);for(let x=599;x<875;x+=35){c.fillStyle='#796749';c.fillRect(x,600,33,5);c.fillStyle='#d1b883';c.fillRect(x,600,32,1);c.fillStyle='#4f4936';c.fillRect(x+3,602,1,1);c.fillRect(x+28,602,1,1);}
  scene.textures.addCanvas(key,cv);
 }
 scene.add.image(0,0,key).setOrigin(0).setDepth(.8);
 const sparkle=scene.add.graphics().setDepth(4);for(const [x,y]of [[258,350],[520,780],[925,580],[1005,905]]){sparkle.fillStyle(0xfbf2b6,.12).fillEllipse(x,y,46,10);}
 const water=scene.add.graphics().setDepth(.4),butterflies=scene.add.graphics().setDepth(1200),reduced=matchMedia('(prefers-reduced-motion: reduce)');let next=0;
 const update=(time:number)=>{if(time<next)return;next=time+80;water.clear();butterflies.clear();const view=scene.cameras.main.worldView;
  for(let i=0;i<27;i++){const y=180+i*36,x=riverBank(y)+28+(i%4)*32;if(y>DOCK.top-8&&y<DOCK.bottom+8||!view.contains(x,y))continue;const drift=reduced.matches?0:Math.sin(time/1900+i)*8;water.lineStyle(1,i%3?0xb1e3d6:0x98d9d4,.23+(Math.sin(time/1600+i)+1)*.07);water.lineBetween(x+drift,y,x+15+drift,y);water.lineBetween(x+6+drift,y+3,x+23+drift,y+3);water.fillStyle(0xd1f3d9,.2).fillRect(x+drift+9,y-1,3,1);}
  if(reduced.matches||lightEffects())return;
  for(let i=0;i<5;i++){const x=530+(i%3)*186+Math.sin(time/3600+i)*26,y=360+Math.floor(i/3)*360+Math.cos(time/2800+i*3)*14;if(!view.contains(x,y))continue;const wing=1+Math.abs(Math.sin(time/120+i))*3;butterflies.fillStyle([0xf3cc8a,0xd8bfdf,0xf3dfac][i%3],.9).fillEllipse(x-wing,y,wing*2,4).fillEllipse(x+wing,y,wing*2,4);butterflies.fillStyle(0x5a5840).fillRect(x,y-2,1,5);}
 };scene.events.on('update',update);scene.events.once('shutdown',()=>scene.events.off('update',update));
}
