import type Phaser from'phaser';
import type{Obstacle}from'./pathfinding';
type Ctx=CanvasRenderingContext2D;
export const SOUTH_GARDEN_OBSTACLES:Obstacle[]=[{x:392,y:878,width:82,height:31},{x:389,y:919,width:88,height:10},{x:690,y:845,width:9,height:17},{x:793,y:845,width:9,height:17},{x:684,y:971,width:122,height:12}];
/** Keep tall forest silhouettes off the new public recantos; no purchased cells are involved. */
export function southGardenClear(x:number,y:number){return x>330&&x<930&&y>820;}
export const gardenButterfly=(i:number,t:number)=>({x:650+(i%3)*78+Math.sin(t/2700+i)*17,y:877+Math.floor(i/3)*60+Math.cos(t/2100+i*2)*10,wing:1+Math.abs(Math.sin(t/130+i))*3});
export function paintSouthGarden(c:Ctx,random:()=>number){
 const r=(col:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
 const path=(x:number,y:number,w:number,h:number)=>{r('#66864a',x-4,y-4,w+8,h+8);r('#b8a371',x-2,y-2,w+4,h+4);r('#d1b781',x,y,w,h);for(let i=0;i<w*h/28;i++)r(i%3?'#b59b69':'#ead29c',x+random()*w,y+random()*h,2,1);};
 path(728,818,36,185);path(418,822,24,108);path(430,952,310,24);
 // A soft gravel clearing, stone edging and four flower beds around the central walk.
 c.fillStyle='#a99f74';c.beginPath();c.ellipse(746,925,132,78,0,0,Math.PI*2);c.fill();c.fillStyle='#cfbb8b';c.beginPath();c.ellipse(746,924,126,73,0,0,Math.PI*2);c.fill();
 for(let i=0;i<400;i++){const x=620+random()*252,y=850+random()*146;if(((x-746)/124)**2+((y-924)/70)**2<1)r(i%3?'#b6a275':'#e0cba0',x,y,2,1);}
 path(730,842,32,151);
 const bed=(x:number,y:number,color:string)=>{r('#5c6845',x-3,y-2,58,29);r('#af9f72',x-2,y-3,56,28);r('#6d6745',x,y,52,22);for(let i=0;i<15;i++){const px=x+4+(i%5)*10,py=y+4+Math.floor(i/5)*7;r('#335e35',px,py-6,2,9);r('#759b50',px-3,py-2,4,2);r('#47783e',px+2,py,4,2);r(color,px-2,py-7,6,3);r('#f3dd98',px,py-7,2,2);}r('#d2bf91',x-2,y+23,56,2);};
 bed(652,883,'#e3b0c8');bed(788,883,'#bfa8db');bed(652,932,'#ebbc6a');bed(788,932,'#e6e6bf');
 // Low hedges and a split wooden border; openings remain aligned to the paths.
 for(let x=625;x<875;x+=18){if(x>720&&x<775)continue;r('#375b36',x,1004,16,10);r('#628a43',x-2,1001,19,8);r('#97af5d',x,999,14,4);if(x%3===0)r('#edc6c5',x+5,1000,3,3);}
 for(const [x,y]of [[365,945],[500,945],[630,857],[860,857]]){r('#3e4e34',x-7,y+3,16,5);r('#866440',x-6,y-10,13,14);r('#c29a61',x-8,y-13,17,5);for(let i=0;i<5;i++){r('#49753b',x-7+i*3,y-17,2,5);r(i%2?'#e8c98f':'#d8a9c3',x-8+i*3,y-21-(i%2)*2,5,5);}}
}
function drawPicnic(c:Ctx){
 const r=(col:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 r('#2b3f2c44',6,68,102,10);for(const x of[15,85]){r('#493d2c',x,30,7,39);r('#af8951',x+1,31,3,36);}r('#5f4930',10,20,96,27);r('#bf965b',11,20,94,23);for(let y=23;y<43;y+=6){r('#dbb474',12,y,92,1);r('#876239',13,y+4,90,1);}r('#443a2b',7,62,101,10);r('#b58c55',8,61,99,7);r('#dfb97c',9,61,97,2);for(const x of[16,93])r('#695033',x,70,5,8);
 // Checkered cloth, a woven basket and a little jug; all decorative.
 r('#e4d9b7',31,20,53,27);for(let y=20;y<46;y+=5)for(let x=31;x<83;x+=5)if(((x-31)/5+(y-20)/5)%2===0)r('#b87367',x,y,5,5);r('#c6b78e',31,45,53,3);
 r('#604a32',43,13,22,14);r('#b08a4d',44,14,20,12);for(let x=45;x<64;x+=4)r('#d4aa63',x,15,2,10);r('#6d5132',45,9,3,8);r('#6d5132',60,9,3,8);r('#ac854b',47,7,14,3);r('#e9c57f',48,8,12,1);
 r('#5b6c50',72,12,9,14);r('#b5c7a0',73,13,7,11);r('#ebdfb8',73,12,7,3);r('#789472',78,15,6,6);r('#f0dfa8',21,16,9,6);r('#af7747',21,21,9,2);r('#bd6e54',23,14,5,4);
}
function drawArch(c:Ctx){const r=(col:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};for(const x of[9,112]){r('#51432c',x,22,8,43);r('#bb985c',x+1,22,5,42);r('#dfbd7c',x+1,23,1,39);}for(const y of[10,17,24]){r('#50462d',4,y,123,5);r('#b69660',5,y,121,3);}for(let x=14;x<125;x+=14){r('#665337',x,5,4,25);r('#d5b47b',x,5,2,22);}for(let i=0;i<28;i++){const x=4+(i*17)%122,y=3+(i%3)*7;r('#35603b',x,y,10,6);r('#73944a',x+2,y,6,3);if(i%2===0){r(i%3?'#dfadc4':'#e5d5b1',x+2,y-2,5,4);r('#f4df9f',x+4,y-1,1,1);}}for(const x of[10,115])for(let y=23;y<54;y+=9){r('#426b39',x-2,y,10,5);r('#8ba657',x,y,5,2);}}
function drawBench(c:Ctx){const r=(col:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};for(const x of[8,112]){r('#51402d',x,10,6,30);r('#b68b52',x+1,10,3,29);}for(const y of[4,12,27]){r('#56432e',4,y,120,7);r('#b89159',5,y,118,5);r('#dabe87',6,y,115,1);}r('#8d6c44',4,34,120,3);}
export function southGardenProps(scene:Phaser.Scene){for(const spec of[{key:'south-picnic',x:378,y:851,w:116,h:81,draw:drawPicnic},{key:'south-flower-arch',x:681,y:797,w:132,h:69,draw:drawArch},{key:'south-garden-bench',x:681,y:947,w:132,h:42,draw:drawBench}]){if(!scene.textures.exists(spec.key)){const cv=document.createElement('canvas');cv.width=spec.w;cv.height=spec.h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;spec.draw(c);scene.textures.addCanvas(spec.key,cv);}scene.add.image(spec.x,spec.y,spec.key).setOrigin(0).setDepth(spec.y+spec.h-4);}}
