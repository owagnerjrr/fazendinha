import Phaser from 'phaser';
import {EXPANSION_SITES} from './expansion-rules';import {parcels} from './plots';import type {Farm} from './farm';
import{paintSouthNature,southNature}from'./south-nature';import{southWaterAt}from'./south-nature-layout';
/** Baked meadow artwork. Land IDs, saved plots and construction coordinates stay unchanged. */
export function expansionLandscape(scene:Phaser.Scene,farm:Farm,block:(x:number,y:number,w:number,h:number)=>void){
 const key='wj-expansion-ground-v2';if(!scene.textures.exists(key)){const cv=document.createElement('canvas');cv.width=1600;cv.height=1200;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;c.fillStyle='#79a34e';c.fillRect(0,0,1600,1200);let seed=731;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<1550;i++){const x=rand()*1600,y=rand()*1200;c.fillStyle=['#80a952','#749d47','#85ad55','#6f9747','#8bb15a'][i%5];c.beginPath();c.ellipse(x,y,8+rand()*40,5+rand()*15,0,0,Math.PI*2);c.fill();}
 for(let i=0;i<21000;i++){const x=Math.floor(rand()*800)*2,y=Math.floor(rand()*600)*2;c.fillStyle=['#91b556','#638b40','#9abc62','#709b44','#a4be70'][i%5];c.fillRect(x,y,i%7?2:4,2);if(i%9===0){c.fillStyle='#527b39';c.fillRect(x,y-3,2,5);c.fillStyle='#adc573';c.fillRect(x+2,y-1,2,3);}}
 const path=(x:number,y:number,w:number,h:number)=>{c.fillStyle='#557b3c';c.fillRect(x-5,y-5,w+10,h+10);c.fillStyle='#9d9759';c.fillRect(x-3,y-3,w+6,h+6);c.fillStyle='#c7a96c';c.fillRect(x,y,w,h);for(let i=0;i<w*h/48;i++){c.fillStyle=i%3?'#af8f57':'#e0bf7e';c.fillRect(Math.floor((x+rand()*w)/2)*2,Math.floor((y+rand()*h)/2)*2,2,2);}};
 path(725,175,50,205);path(120,345,1380,42);path(120,700,1380,40);for(const s of Object.values(EXPANSION_SITES)){path(s.x+182,385,36,315);path(s.x-40,385,25,315);path(s.x+385,385,25,315);}
 // Flowered verges frame the fields instead of occupying acquired building cells.
 for(let i=0;i<1050;i++){const x=110+rand()*1390,y=210+rand()*835;if(y>390&&y<680||Math.abs(x-750)<58&&y<395||southWaterAt(x,y,24)||x>268&&x<460&&y<260||y>340&&y<395||y>695&&y<752)continue;c.fillStyle='#426e3a';c.fillRect(Math.round(x),Math.round(y)-4,2,7);if(i%3===0){c.fillStyle=['#f5dfaa','#c8a4c8','#e9bd70','#e4eabf'][i%4];c.fillRect(Math.round(x)-2,Math.round(y)-6,6,3);c.fillRect(Math.round(x),Math.round(y)-8,2,7);}}
 for(const y of[331,757])for(let x=145;x<1480;x+=44){if(Math.abs(x-750)<55||southWaterAt(x,y,15))continue;c.fillStyle='#4c773c';c.fillRect(x,y,15,5);c.fillStyle='#a8bd67';c.fillRect(x+2,y-2,11,3);c.fillStyle=x%3?'#ead4a4':'#bfa5cc';c.fillRect(x+5,y-4,4,3);}
 // Low weathered corner markers and moss, keeping every access lane open.
 for(const s of Object.values(EXPANSION_SITES))for(const x of[s.x-26,s.x+380]){c.fillStyle='#43593b';c.fillRect(x-5,405,12,11);c.fillStyle='#a4a17b';c.fillRect(x-4,403,10,8);c.fillStyle='#d1c596';c.fillRect(x-3,403,8,2);}
 paintSouthNature(c,rand);scene.textures.addCanvas(key,cv);}
 scene.add.image(0,0,key).setOrigin(0);
 const title=scene.add.text(750,205,'↑ FAZENDA',{fontFamily:'monospace',fontSize:'14px',color:'#fff1be',backgroundColor:'#42563a',padding:{x:14,y:8}}).setOrigin(.5).setDepth(2);title.setShadow(1,2,'#263928',0);
 for(const [site,s]of Object.entries(EXPANSION_SITES)){const owned=parcels(farm).some(p=>p.site===site),g=scene.add.graphics().setDepth(.5);g.fillStyle(owned?0x9c8b59:0x45633d,owned?.18:.18).fillRect(s.x-20,s.y-20,400,200);g.lineStyle(1,owned?0xcab67f:0x8aa25e,.65).strokeRect(s.x-21,s.y-21,402,202);scene.add.text(s.x+180,790,s.name+'\n'+(owned?'✓ Terreno liberado':'Terreno disponível na venda'),{fontFamily:'monospace',fontSize:'13px',align:'center',color:owned?'#fff3c6':'#cbd6a8',backgroundColor:'#3f583c',padding:{x:12,y:7}}).setOrigin(.5).setDepth(2);}
 const rng=new Phaser.Math.RandomDataGenerator(['wj-campos-sul']);for(let y=210;y<1100;y+=80)for(let x=90;x<1510;x+=75){if(y>285&&y<880||x>675&&x<825&&y<400||x>185&&x<545&&y<335)continue;const px=x+rng.between(-15,15),py=y+rng.between(-12,12);if(southWaterAt(px,py,65)||y>880&&y<1010&&x>230&&x<1440)continue;scene.add.image(px,py,`tree${(x+y)%3}`).setOrigin(.5,1).setScale(rng.realInRange(1,1.35)).setDepth(py);block(px,py-8,17,18);}
 for(const [x,y]of [[130,900],[1450,920],[540,940],[1000,960]]){scene.add.image(x,y,'pine').setOrigin(.5,1).setScale(1.3).setDepth(y);block(x,y-8,20,20);}
 for(const [i,x,y]of [[0,260,900],[1,310,930],[2,580,1020],[0,850,940],[2,910,970]] as const){scene.add.image(x,y,'tree'+i).setOrigin(.5,1).setScale(1.15).setDepth(y);block(x,y-8,17,18);}
 southNature(scene,block);
}
