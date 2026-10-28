import type Phaser from 'phaser';
import { barnMaterials } from './barn-materials';
import type { Obstacle } from './pathfinding';
export const HOUSE_BOUNDS={x:270,y:220,width:660,height:500};
export const HOUSE_PROPS=[
 {kind:'bed',x:365,y:382,width:74,height:84,body:{x:332,y:329,width:66,height:49},access:{x:365,y:418},name:'Cama'},
 {kind:'wardrobe',x:839,y:350,width:66,height:90,body:{x:809,y:326,width:60,height:22},access:{x:839,y:382},name:'Guarda-roupa'},
 {kind:'tv',x:648,y:325,width:64,height:76,body:{x:619,y:308,width:58,height:15},access:{x:648,y:359},name:'TV'},
 {kind:'sofa',x:790,y:525,width:104,height:96,body:{x:746,y:503,width:88,height:20},access:{x:790,y:555},name:'Sofá'},
 {kind:'table',x:436,y:534,width:72,height:47,body:{x:403,y:509,width:66,height:22},access:{x:484,y:544},name:'Mesa'},
 {kind:'chair',x:436,y:581,width:30,height:39,body:{x:423,y:566,width:26,height:12},access:{x:478,y:580},name:'Cadeira'},
] as const;
export const HOUSE_DETAIL_BODIES:Obstacle[]=[{x:423,y:350,width:34,height:22}];
export const HOUSE_WALLS:Obstacle[]=[{x:258,y:154,width:16,height:580},{x:928,y:154,width:16,height:580},{x:270,y:154,width:660,height:70},{x:270,y:716,width:280,height:16},{x:650,y:716,width:280,height:16}];
/** Original furniture is drawn at world-pixel resolution; no copied reference assets. */
export function buildHouse(scene:Phaser.Scene,block:(x:number,y:number,w:number,h:number)=>void,interact:(kind:string)=>void){
 barnMaterials(scene);
 const create=(name:string,w:number,h:number,draw:(c:CanvasRenderingContext2D,r:(color:string,x:number,y:number,w:number,h:number)=>void)=>void)=>{
  const key=`house-${name}`;if(scene.textures.exists(key))return;const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;
  draw(c,(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);});scene.textures.addCanvas(key,cv);
 };
 const wood=(r:(color:string,x:number,y:number,w:number,h:number)=>void,x:number,y:number,w:number,h:number)=>{r('#3d3026',x,y,w,h);r('#84582f',x+1,y+1,w-2,h-2);r('#bf9659',x+2,y+1,w-4,2);r('#a07641',x+3,y+4,w-6,h-7);r('#5f4028',x+2,y+h-3,w-4,2);for(let i=0;i<Math.floor(w/8);i++)r('#946936',x+4+i*7,y+7+(i%3)*3,4,1);};
 create('floor',192,64,(_c,r)=>{r('#735536',0,0,192,64);for(let row=0;row<4;row++)for(let col=-1;col<3;col++){const x=col*96+(row%2)*48,y=row*16;r(['#a88857','#a18051','#ad8d5c'][(row+col+3)%3],x+1,y+1,94,15);r('#b39766',x+2,y+1,92,1);r('#8b6a43',x+1,y+15,94,1);for(let k=0;k<5;k++)r(k%2?'#9b7b4e':'#b09260',x+5+(k*19)%80,y+5+(k*3)%8,9+(k%3)*5,1);}});
 create('bed',56,84,(_c,r)=>{r('#352d27',3,79,52,4);wood(r,2,4,52,17);wood(r,1,0,6,81);wood(r,49,0,6,81);r('#d1b17a',7,16,42,53);r('#f0dfb4',8,17,40,51);r('#c4ac83',12,19,33,16);r('#fff0cd',13,18,30,13);r('#ddc79c',14,28,28,2);r('#31594e',7,36,42,36);r('#537b64',9,36,38,33);r('#739079',10,37,36,3);r('#3f6856',12,44,33,2);r('#839779',11,39,2,28);for(let y=44;y<68;y+=7)for(let x=16;x<45;x+=7)r('#69856c',x,y,2,2);wood(r,4,70,48,8);});
 create('wardrobe',54,78,(_c,r)=>{r('#332d25',3,74,50,3);wood(r,3,7,48,66);wood(r,0,4,54,8);r('#d0a56a',6,2,42,3);for(const x of [8,29]){wood(r,x,16,18,45);r('#6c482b',x+4,21,10,32);r('#93693a',x+5,22,8,30);}r('#dfbb6b',23,38,2,3);r('#dfbb6b',29,38,2,3);wood(r,8,63,39,8);r('#d8ad62',25,65,5,2);r('#4d3525',5,71,6,5);r('#4d3525',43,71,6,5);});
 create('tv',48,55,(_c,r)=>{r('#332e29',3,51,43,3);wood(r,3,28,42,23);wood(r,1,26,46,5);wood(r,5,1,38,27);r('#303c37',9,5,25,18);r('#50615a',10,6,23,15);r('#788071',12,7,8,2);r('#3c4b46',11,16,21,4);r('#d2b173',37,10,2,2);r('#d2b173',37,17,2,2);r('#5b3b27',23,34,2,13);r('#d1ab60',19,39,2,2);r('#d1ab60',28,39,2,2);});
 create('sofa',94,58,(_c,r)=>{r('#332f26',3,53,89,4);wood(r,6,44,82,11);r('#304b3d',7,3,80,47);r('#547a69',10,1,74,31);r('#426352',12,4,70,27);r('#88a18a',12,4,70,2);r('#344f3e',46,5,2,26);r('#638674',12,30,70,16);r('#9bb59b',13,30,68,3);r('#4e6948',13,43,68,4);r('#455e43',46,32,2,11);for(const x of [3,81]){wood(r,x,24,10,26);r('#6f8857',x,20,10,7);r('#a3ae7a',x+1,20,8,2);}r('#d9c28c',16,14,14,16);r('#a68759',17,16,2,12);r('#f0dfae',20,15,7,2);r('#3f3429',9,53,5,4);r('#3f3429',79,53,5,4);});
 create('table',72,47,(_c,r)=>{r('#342e24',4,41,64,4);for(const x of [8,59])wood(r,x,25,5,18);wood(r,1,5,70,25);r('#c29c61',4,6,64,17);for(const y of [11,18])r('#a37c48',5,y,62,1);r('#e0c58e',6,7,60,1);r('#617b53',23,11,25,9);r('#90a06d',24,11,23,2);r('#c4b389',29,11,13,6);r('#ece0ba',31,10,9,5);r('#7c6141',53,10,6,7);r('#d3b779',54,10,4,2);});
 create('chair',30,39,(_c,r)=>{r('#332c24',3,35,25,3);wood(r,3,1,24,19);r('#c9a269',7,4,16,3);r('#73502f',8,9,14,6);wood(r,3,20,24,9);r('#799062',6,20,18,5);for(const x of [4,22])wood(r,x,28,4,9);});
 const g=scene.add.graphics().setDepth(0);g.fillStyle(0x342e27);g.fillRect(258,154,686,580);g.fillStyle(0xc6b58b);g.fillRect(270,154,660,70);
 for(let i=0;i<120;i++){g.fillStyle(i%3?0xab9974:0xdfcda3,.45);g.fillRect(276+(i*53)%645,160+(i*17)%54,2+(i%3),1);}
 scene.add.tileSprite(270,224,660,492,'house-floor').setOrigin(0).setTint(0xffecd0).setDepth(.1);
 const trim=scene.add.graphics().setDepth(1);trim.fillStyle(0x4e3928);trim.fillRect(270,215,660,11);trim.fillRect(270,224,8,492);trim.fillRect(922,224,8,492);trim.fillRect(270,708,280,10);trim.fillRect(650,708,280,10);trim.fillStyle(0xba945a);trim.fillRect(278,217,644,2);trim.fillRect(550,708,100,18);trim.fillStyle(0xd3b77e);trim.fillRect(555,711,90,2);
 for(const x of [365,840])scene.add.image(x,211,'life-window').setOrigin(.5,1).setDisplaySize(47,57).setDepth(221);
 houseDetails(scene,block);
 const rug=scene.add.graphics().setDepth(2);rug.fillStyle(0x374c3d);rug.fillRect(707,432,167,142);rug.fillStyle(0x8c9b70);rug.fillRect(710,435,161,136);rug.fillStyle(0x5f785b);rug.fillRect(714,439,153,128);rug.lineStyle(1,0xa5ad7b,.8);rug.strokeRect(718,443,145,120);for(let x=715;x<870;x+=5){rug.fillStyle(0xc8bb89,.65);rug.fillRect(x,431,2,3);rug.fillRect(x,574,2,3);}
 const points=HOUSE_PROPS.map(p=>{const rich=['bed','sofa','wardrobe','tv'].includes(p.kind);scene.add.ellipse(p.x+2,p.y-3,p.width*.95,12,0x30291e,.24).setDepth(p.y-.2);scene.add.image(p.x,p.y,rich?`life-${p.kind}`:`house-${p.kind}`).setOrigin(.5,1).setDisplaySize(p.width,p.height).setDepth(p.y);block(p.body.x,p.body.y,p.body.width,p.body.height);return {...p.access,hitX:p.x,hitY:p.y-p.height/2,radius:Math.max(18,p.width*.45),name:p.name,run:()=>interact(p.kind)};});
 scene.add.image(543,260,'life-flowerPlanter').setOrigin(.5,1).setDisplaySize(36,39).setDepth(260);
 return points;
}

/** Bedroom and living-room accents at the same pixel scale as the character. */
function houseDetails(scene:Phaser.Scene,block:(x:number,y:number,w:number,h:number)=>void){
 const g=scene.add.graphics().setDepth(1),r=(color:number,x:number,y:number,w:number,h:number)=>{g.fillStyle(color);g.fillRect(x,y,w,h);};
 // Wooden wainscot and plaster relief, rather than a blank wall.
 r(0x947044,278,187,644,28);for(let x=280;x<922;x+=25){r(0xb08b54,x,189,22,24);r(0xc4a36c,x+1,189,1,22);r(0x745336,x+21,191,1,21);}r(0xd4b77f,278,185,644,3);
 // Woven bedroom rug and a runner connecting the rooms.
 r(0x4c6263,307,320,179,113);r(0x879b8b,310,323,173,107);r(0x637d76,314,327,165,99);for(let x=316;x<479;x+=8){r(0xb7c0a0,x,324,3,2);r(0xb7c0a0,x,426,3,2);}for(let y=331;y<425;y+=6)for(let x=318;x<479;x+=9)r(0x748c7e,x,y,3,1);
 r(0x9d7650,553,514,60,145);r(0xc2a071,556,517,54,139);r(0x93784f,559,520,48,133);for(let y=525;y<650;y+=8){r(0xc7ac7a,564,y,38,1);}
 // Bedside cabinet with lamp, small book and warm pool of light.
 const lamp=scene.add.graphics().setDepth(375);lamp.fillStyle(0x30291e,.22).fillEllipse(441,374,41,10);lamp.fillStyle(0x65462c).fillRect(423,348,34,25);lamp.fillStyle(0xc3985d).fillRect(421,345,38,6);lamp.fillStyle(0xe0bd7e).fillRect(422,345,35,1);lamp.fillStyle(0x8e643c).fillRect(426,354,27,14);lamp.fillStyle(0xd5ae61).fillRect(438,359,4,2);lamp.fillStyle(0xb49253).fillRect(437,326,4,18);lamp.fillStyle(0xeee1a3).fillTriangle(426,329,450,329,445,313);lamp.fillStyle(0xd8be78).fillRect(425,329,27,3);lamp.fillStyle(0x799484).fillRect(446,342,8,3);for(const b of HOUSE_DETAIL_BODIES)block(b.x,b.y,b.width,b.height);
 const light=scene.add.graphics().setDepth(2);light.fillStyle(0xf3cc82,.075).fillEllipse(440,350,104,75);
 // Framed landscape and wall shelf with books, ceramic pot and trailing plant.
 const shelf=scene.add.graphics().setDepth(245);shelf.fillStyle(0x563a26).fillRect(480,200,73,42);shelf.fillStyle(0xc1a16a).fillRect(483,203,67,36);shelf.fillStyle(0x809e8f).fillRect(487,207,59,28);shelf.fillStyle(0xc9cf9e).fillCircle(532,215,5);shelf.fillStyle(0x527656).fillTriangle(487,234,517,213,546,234);shelf.fillStyle(0x759267).fillTriangle(503,234,531,221,546,234);
 shelf.fillStyle(0x65462d).fillRect(704,238,72,5);shelf.fillStyle(0xc19b5c).fillRect(702,236,76,3);for(const [i,color] of [0x6f8c82,0x9c6250,0xd1b06f,0x739364].entries()){shelf.fillStyle(color).fillRect(707+i*8,219-i%2*3,6,17+i%2*3);shelf.fillStyle(0xe1c790).fillRect(708+i*8,223,4,1);}shelf.fillStyle(0xa26c43).fillRect(749,225,16,10);shelf.fillStyle(0x517846).fillEllipse(756,218,23,15);shelf.fillStyle(0x8ca367).fillRect(752,211,4,6);
 // Window light is static and soft; it never hides sprites or interface.
 light.fillStyle(0xe8d7a1,.045).fillTriangle(340,226,390,226,470,487);light.fillTriangle(816,226,861,226,715,411);
}
