import Phaser from 'phaser';
import {LAND_SITES,BUILDINGS,type LandSite} from './plots';
import type {Farm} from './farm';
export class LandWorld{
 private signature='';private objects:Phaser.GameObjects.GameObject[]=[];private bodies:Phaser.GameObjects.Zone[]=[];
 constructor(private scene:Phaser.Scene,private obstacles:Phaser.Physics.Arcade.StaticGroup){buildingTextures(scene);}
 update(f:Farm){const signature=JSON.stringify([f.landParcels,f.landOwned,f.buildings]);if(signature===this.signature)return false;this.signature=signature;for(const o of this.objects)o.destroy();for(const z of this.bodies)z.destroy();this.objects=[];this.bodies=[];
 for(const [id,p] of Object.entries(LAND_SITES)){
  const owned=(f.landParcels??(f.landOwned?[{site:'west'}]:[])).some(v=>v.site===id),g=this.scene.add.graphics().setDepth(.8);this.objects.push(g);g.lineStyle(1,owned?0xd4ba7f:0x99b876,owned?.75:.4);g.strokeRect(p.x-21,p.y-21,162,122);if(owned){g.fillStyle(0xab8d52,.14);g.fillRect(p.x-20,p.y-20,160,120);}
  const label=this.scene.add.text(p.x+60,p.y-37,owned?p.name:'Terreno disponível · venda',{fontFamily:'monospace',fontSize:'9px',color:'#f4e5ba',backgroundColor:'#354f35dd',padding:{x:4,y:3}}).setOrigin(.5).setDepth(3);this.objects.push(label);
 }
 for(const b of f.buildings??[]){const p=LAND_SITES[b.site],x=p.x+b.col*40+20,y=p.y+b.row*40+58;this.objects.push(this.scene.add.ellipse(x,y-3,76,21,0x243525,.3).setDepth(y-.3));this.objects.push(this.scene.add.image(x,y,`land-${b.kind}`).setOrigin(.5,1).setDepth(y));
  const z=this.scene.add.zone(x,y-20,66,36);this.obstacles.add(z);(z.body as Phaser.Physics.Arcade.StaticBody).setSize(66,36);this.bodies.push(z);
 }
 return true;}
 buildingAt(f:Farm,p:{x:number;y:number}){return f.buildings?.find(b=>{const s=LAND_SITES[b.site],x=s.x+b.col*40+20,y=s.y+b.row*40+58;return Math.abs(p.x-x)<42&&p.y<y+8&&p.y>y-94;});}
 access(b:NonNullable<Farm['buildings']>[number]){const s=LAND_SITES[b.site];return{x:s.x+b.col*40+20,y:s.y+b.row*40+85};}
}
function buildingTextures(scene:Phaser.Scene){for(const kind of Object.keys(BUILDINGS)){
 const key=`land-${kind}`;if(scene.textures.exists(key))continue;const canvas=document.createElement('canvas');canvas.width=90;canvas.height=105;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 r('#3c3024',7,95,76,6);r('#b28d54',8,88,74,9);r('#d3b274',9,88,72,2);
 if(kind==='shed'){r('#493c2a',10,29,70,60);r('#926b3e',12,30,66,57);for(let x=14;x<78;x+=9){r('#ad844b',x,32,6,53);r('#c19a5e',x,32,1,53);}r('#3e3026',30,51,28,38);r('#74512f',32,53,24,34);r('#b68f51',34,55,20,2);r('#d8c071',51,68,2,3);r('#454a38',62,43,12,17);r('#a1b8a1',64,45,8,12);r('#e8c88b',67,45,1,12);}
 else{for(const x of [11,72]){r('#44372a',x,34,7,55);r('#bd965b',x+1,35,4,52);r('#e2bd7f',x+1,35,1,49);}r('#6e5132',16,72,57,8);r('#be9a5e',16,70,57,3);for(const x of [21,65])r('#5b422b',x,78,4,10);r('#66814e',20,58,50,13);r('#a9ba7a',20,58,50,3);}
 c.fillStyle='#343d34';c.beginPath();c.moveTo(2,36);c.lineTo(45,2);c.lineTo(88,36);c.closePath();c.fill();for(let y=10;y<35;y+=5){const w=(y-2)*2.45;r(y%2?'#596e61':'#65806d',45-w/2,y,w,4);r('#8eab87',45-w/2,y,w,1);}r('#b99a62',2,35,86,5);r('#e0bd7b',3,35,84,2);scene.textures.addCanvas(key,canvas);
}}
