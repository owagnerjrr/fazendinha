import {barnMaterials} from './barn-materials';
import {outdoorBox} from './housing';
import Phaser from 'phaser';
import {LAND_SITES,BUILDINGS,type LandSite} from './plots';
import type {Farm} from './farm';
export class LandWorld{
 private labels:{outline:Phaser.GameObjects.Graphics;x:number;y:number;owned:boolean}[]=[];
 private signature='';private objects:Phaser.GameObjects.GameObject[]=[];private bodies:Phaser.GameObjects.Zone[]=[];
 constructor(private scene:Phaser.Scene,private obstacles:Phaser.Physics.Arcade.StaticGroup){buildingTextures(scene);barnMaterials(scene);coopTexture(scene);}
 update(f:Farm){const signature=JSON.stringify([f.landParcels,f.landOwned,f.buildings]);if(signature===this.signature)return false;this.signature=signature;for(const o of this.objects)o.destroy();for(const z of this.bodies)z.destroy();this.objects=[];this.bodies=[];this.labels=[];
 for(const [id,p] of Object.entries(LAND_SITES)){
  const owned=(f.landParcels??(f.landOwned?[{site:'west'}]:[])).some(v=>v.site===id),g=this.scene.add.graphics().setDepth(.8);this.objects.push(g);g.lineStyle(1,owned?0xd4ba7f:0x99b876,owned?.75:.4);g.strokeRect(p.x-21,p.y-21,162,122);if(owned){g.fillStyle(0xab8d52,.14);g.fillRect(p.x-20,p.y-20,160,120);}
  g.setVisible(owned);this.labels.push({outline:g,x:p.x+60,y:p.y+40,owned});
 }
 for(const b of f.buildings??[]){if(['coop','pasture'].includes(b.kind)){this.habitat(b);continue;}const p=LAND_SITES[b.site],x=p.x+b.col*40+20,y=p.y+b.row*40+58;this.objects.push(this.scene.add.ellipse(x,y-3,76,21,0x243525,.3).setDepth(y-.3));this.objects.push(this.scene.add.image(x,y,`land-${b.kind}`).setOrigin(.5,1).setDepth(y));
  const z=this.scene.add.zone(x,y-20,66,36);this.obstacles.add(z);(z.body as Phaser.Physics.Arcade.StaticBody).setSize(66,36);this.bodies.push(z);
 }
 return true;}
 hints(player:{x:number;y:number},enabled:boolean){let closest:typeof this.labels[number]|undefined,best=125;for(const l of this.labels){l.outline.setVisible(l.owned);const distance=Math.hypot(player.x-l.x,player.y-l.y);if(enabled&&distance<best){best=distance;closest=l;}}if(closest){closest.outline.setVisible(true);}}
 buildingAt(f:Farm,p:{x:number;y:number}){return f.buildings?.find(b=>{if(['coop','pasture'].includes(b.kind)){const q=outdoorBox(b);return p.x>q.x&&p.x<q.x+q.width&&p.y>q.y-30&&p.y<q.y+q.height;}const s=LAND_SITES[b.site],x=s.x+b.col*40+20,y=s.y+b.row*40+58;return Math.abs(p.x-x)<42&&p.y<y+8&&p.y>y-94;});}
 access(b:NonNullable<Farm['buildings']>[number]){if(['coop','pasture'].includes(b.kind)){const q=outdoorBox(b);return{x:q.x+q.width/2,y:q.y+q.height+20};}const s=LAND_SITES[b.site];return{x:s.x+b.col*40+20,y:s.y+b.row*40+85};}
 private habitat(b:NonNullable<Farm['buildings']>[number]){const q=outdoorBox(b),{x,y,width:w,height:h}=q;
 const g=this.scene.add.graphics().setDepth(y+1);this.objects.push(g);g.fillStyle(0x829e5a,.55).fillRect(x,y,w,h);for(let i=0;i<90;i++)g.fillStyle([0xaac17a,0x69894d,0xc8bf80][i%3],.65).fillRect(x+5+(i*23)%(w-10),y+5+(i*17)%(h-10),i%4?3:5,1);
 const board=(px:number,py:number,bw:number,bh:number,depth:number,angle=0)=>{const o=this.scene.add.tileSprite(px,py,bw,bh,'barn-board').setRotation(angle).setDepth(depth);this.objects.push(o);};
 for(const [fy,depth] of [[y+8,y+30],[y+h,y+h+5]]){for(const railY of [fy-7,fy-20])board(x+w/2,railY,w+6,5,depth);for(let px=x;px<=x+w+4;px+=30){const post=this.scene.add.image(Math.min(px,x+w),fy+5,'barn-post').setOrigin(.5,1).setDisplaySize(11,31).setDepth(depth+1);this.objects.push(post);}}
 for(const px of [x,x+w])board(px,y+h/2,Math.max(1,h-4),5,y+h+5,Math.PI/2);
 const gx=x+w/2;for(const py of [y+h-27,y+h-3])board(gx,py,29,5,y+h+8);for(const px of [gx-14,gx+14])board(px,y+h-15,29,4,y+h+8,Math.PI/2);board(gx,y+h-15,35,4,y+h+9,Math.PI/4);
 const prop=(px:number,py:number,key:string,pw:number,ph:number,depth=py)=>{const image=this.scene.add.image(px,py,key).setOrigin(.5,1).setDisplaySize(pw,ph).setDepth(depth);this.objects.push(image);};
 if(b.kind==='coop'){prop(x+w-25,y+24,'farm-coop',65,61,y+26);for(let i=0;i<3;i++)prop(x+17+i*27,y+31,'barn-nest',26,19,y+32);}
 else{prop(x+40,y+30,'barn-trough',64,19,y+31);prop(x+w-31,y+31,'barn-water',42,19,y+32);prop(x+24,y+54,'barn-hay-pile',35,21,y+55);}
 const zone=this.scene.add.zone(x+w/2,y+h/2,w,h);this.obstacles.add(zone);(zone.body as Phaser.Physics.Arcade.StaticBody).setSize(w,h);this.bodies.push(zone);
 }
}
function buildingTextures(scene:Phaser.Scene){for(const kind of Object.keys(BUILDINGS)){
 if(['coop','pasture'].includes(kind))continue;const key=`land-${kind}`;if(scene.textures.exists(key))continue;const canvas=document.createElement('canvas');canvas.width=90;canvas.height=105;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 r('#3c3024',7,95,76,6);r('#b28d54',8,88,74,9);r('#d3b274',9,88,72,2);
 if(kind==='shed'){r('#493c2a',10,29,70,60);r('#926b3e',12,30,66,57);for(let x=14;x<78;x+=9){r('#ad844b',x,32,6,53);r('#c19a5e',x,32,1,53);}r('#3e3026',30,51,28,38);r('#74512f',32,53,24,34);r('#b68f51',34,55,20,2);r('#d8c071',51,68,2,3);r('#454a38',62,43,12,17);r('#a1b8a1',64,45,8,12);r('#e8c88b',67,45,1,12);}
 else{for(const x of [11,72]){r('#44372a',x,34,7,55);r('#bd965b',x+1,35,4,52);r('#e2bd7f',x+1,35,1,49);}r('#6e5132',16,72,57,8);r('#be9a5e',16,70,57,3);for(const x of [21,65])r('#5b422b',x,78,4,10);r('#66814e',20,58,50,13);r('#a9ba7a',20,58,50,3);}
 c.fillStyle='#343d34';c.beginPath();c.moveTo(2,36);c.lineTo(45,2);c.lineTo(88,36);c.closePath();c.fill();for(let y=10;y<35;y+=5){const w=(y-2)*2.45;r(y%2?'#596e61':'#65806d',45-w/2,y,w,4);r('#8eab87',45-w/2,y,w,1);}r('#b99a62',2,35,86,5);r('#e0bd7b',3,35,84,2);scene.textures.addCanvas(key,canvas);
}}

function coopTexture(scene:Phaser.Scene){if(scene.textures.exists('farm-coop'))return;const cv=document.createElement('canvas');cv.width=70;cv.height=66;const c=cv.getContext('2d')!;const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 r('#3d3025',7,27,56,36);r('#a87b43',9,27,52,34);for(let x=10;x<61;x+=7){r('#c49a5b',x,30,5,28);r('#e0b875',x,31,1,24);r('#73502c',x+5,32,1,27);}r('#ead097',8,28,54,2);r('#63452d',5,59,60,5);r('#bc955a',6,59,58,2);
 r('#4b3c2c',24,40,23,21);r('#2b3028',27,42,17,18);r('#a17c3f',26,56,19,5);for(let i=0;i<10;i++)r(i%2?'#e0c377':'#bb9f59',27+i*2,56+i%3,2,1);
 r('#654c31',48,34,11,13);r('#94b7a5',50,36,7,9);r('#dfc692',53,36,1,9);r('#dfc692',50,40,7,1);
 for(let row=0;row<7;row++){const y=5+row*4,w=12+row*8,x=35-w/2;r('#3b493b',x-2,y,w+4,5);r(row%2?'#60795b':'#718865',x,y,w,3);r('#9eaa77',x,y,w,1);for(let px=x+6;px<x+w;px+=9)r('#485f48',px,y+1,1,2);}r('#58422d',3,32,64,4);r('#d1ad6d',3,32,64,2);r('#9b7b48',18,60,36,5);r('#dac18a',20,60,32,1);scene.textures.addCanvas('farm-coop',cv);}
