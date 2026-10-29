import type Phaser from 'phaser';
import type {BarnPen} from './barn-layout';

/** Original pixel art, generated once and shared by every stall. */
export function barnDetails(scene:Phaser.Scene){
 let seed=90717;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const make=(key:string,w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void)=>{if(scene.textures.exists(key))return;const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;draw(c);scene.textures.addCanvas(key,cv);};
 const r=(c:CanvasRenderingContext2D,col:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 const oval=(c:CanvasRenderingContext2D,col:string,x:number,y:number,rx:number,ry:number)=>{for(let j=-ry;j<=ry;j++){const span=Math.floor(rx*Math.sqrt(Math.max(0,1-j*j/(ry*ry))));r(c,col,x-span,y+j,span*2+1,1);}};
 const line=(c:CanvasRenderingContext2D,col:string,x:number,y:number,dx:number,dy:number)=>{const n=Math.max(Math.abs(dx),Math.abs(dy));for(let i=0;i<=n;i++)r(c,col,x+dx*i/n,y+dy*i/n,1,1);};
 make('barn-oak',192,96,c=>{r(c,'#473626',0,0,192,96);for(let row=0;row<4;row++)for(let col=-1;col<3;col++){const x=col*96+(row%2)*48,y=row*24;r(c,['#9e7545','#ac8250','#956b3e','#b18954'][row],x+1,y+1,94,22);r(c,'#c7a36b',x+2,y+1,92,2);r(c,'#795433',x+2,y+21,92,2);r(c,'#dcc08c',x+3,y+3,90,1);for(let n=0;n<25;n++)r(c,n%4?'#8d633b':'#bb925c',x+4+rand()*79,y+5+rand()*14,3+rand()*15,1);for(const nx of [x+6,x+88]){r(c,'#594730',nx,y+6,2,2);r(c,'#c1aa7d',nx,y+6,1,1);}if(col===1){oval(c,'#815b34',x+39,y+13,6,2);r(c,'#66462b',x+36,y+13,5,1);}}});
 make('barn-rail',192,18,c=>{r(c,'#422d20',0,2,192,16);r(c,'#8b5e35',1,2,190,13);r(c,'#d1aa6c',1,1,190,3);r(c,'#b88c50',1,5,190,4);r(c,'#614026',1,14,190,3);for(let i=0;i<68;i++)r(c,i%3?'#81552f':'#c1975a',rand()*192,6+rand()*7,2+rand()*16,1);oval(c,'#76502e',79,10,8,2);r(c,'#b0884d',73,9,13,1);for(const x of [7,183]){r(c,'#45483a',x,7,2,2);r(c,'#c1b98d',x,7,1,1);}});
 make('barn-earth',128,96,c=>{r(c,'#65523b',0,0,128,96);for(let i=0;i<850;i++){r(c,['#6b5940','#705c3f','#5b4b36','#7b6444'][i%4],rand()*128,rand()*96,1+rand()*3,1);}for(let i=0;i<45;i++)line(c,['#ae8f4b','#c7a967','#917741'][i%3],rand()*128,rand()*96,2+Math.floor(rand()*5),i%2?2:-2);});
 make('barn-straw-bed',148,72,c=>{oval(c,'#473a26',74,41,70,27);oval(c,'#987e47',74,38,66,25);for(let i=0;i<900;i++){const x=rand()*142+3,y=rand()*63+5,dx=(x-74)/70,dy=(y-38)/30;if(dx*dx+dy*dy>1)continue;const a=rand()*Math.PI;line(c,['#987a3d','#aa8b46','#b99b57','#cfb36a','#d8bd7d','#af8b41'][i%6],x,y,Math.round(Math.cos(a)*9),Math.round(Math.sin(a)*4));}});
 make('barn-feed-crate',62,49,c=>{oval(c,'#382e21',31,44,29,3);r(c,'#513620',2,12,58,29);r(c,'#b3864d',3,12,55,27);r(c,'#d3ad70',3,12,55,3);r(c,'#3e3021',8,17,45,16);for(let i=0;i<110;i++){const x=9+rand()*42,y=18+rand()*13;r(c,i%3?'#c29645':'#ead18b',x,y,2,1);}for(const y of [30,39]){r(c,'#926437',3,y,56,4);r(c,'#c99e5f',4,y,54,1);}for(const x of [3,54]){r(c,'#68452a',x,12,5,31);r(c,'#be965c',x,12,2,29);for(const y of [15,38])r(c,'#514a37',x+2,y,2,2);}});
 make('barn-feed-bin',51,60,c=>{oval(c,'#382e21',26,55,23,3);r(c,'#414f47',7,15,38,37);r(c,'#789180',9,15,33,35);r(c,'#a4b3a0',10,18,5,29);r(c,'#596d5d',39,17,5,34);oval(c,'#bdc5ac',26,15,21,6);oval(c,'#6e806d',26,14,17,4);r(c,'#d4c08c',19,27,15,17);r(c,'#74834f',23,30,7,10);r(c,'#c9c09a',24,32,5,1);r(c,'#384a40',10,49,32,4);});
 make('barn-tool-stand',76,73,c=>{oval(c,'#3f3023',38,67,35,3);r(c,'#65442b',5,8,66,58);r(c,'#aa7a42',7,8,62,54);r(c,'#c79c5c',7,8,62,3);for(let x=10;x<69;x+=12)r(c,'#906132',x,12,1,48);for(const x of [17,37,57]){r(c,'#513b26',x+1,17,3,46);r(c,'#c4a16b',x,14,2,46);r(c,'#e2c38c',x,14,1,43);r(c,'#535f55',x-5,48,12,12);r(c,'#94a494',x-4,49,10,3);}r(c,'#3c4b42',11,21,12,2);r(c,'#b6ac82',12,18,2,5);r(c,'#745032',4,61,68,6);r(c,'#ccaa6b',4,61,68,2);});
 make('barn-kennel',90,76,c=>{oval(c,'#382e21',45,68,42,5);r(c,'#70472d',13,24,65,42);r(c,'#b87f48',15,25,60,38);for(let y=31;y<61;y+=9){r(c,'#855832',17,y,56,1);r(c,'#d2a362',18,y+1,54,1);}r(c,'#382f23',31,37,29,28);r(c,'#2e2c22',35,33,20,32);r(c,'#877a46',33,59,26,6);for(let y=0;y<28;y++){const half=4+y*1.45;r(c,y%7===0?'#404e3c':y%7===1?'#8f9d63':'#647b4c',45-half,y+3,half*2,2);}r(c,'#aeba7e',42,3,6,3);r(c,'#a48c54',14,63,63,4);});
 make('barn-bowls',50,24,c=>{for(const x of [13,38]){oval(c,'#3b3024',x,19,12,3);oval(c,'#7f6f4b',x,14,11,6);oval(c,'#b9b28a',x,12,11,4);oval(c,x===13?'#d1ab58':'#6fada7',x,12,8,2);r(c,'#ebd59d',x-6,11,6,1);}});
 make('barn-hayloft',172,61,c=>{r(c,'#372b20',1,4,170,51);r(c,'#62442b',5,9,162,43);for(let n=0;n<4;n++){const x=10+n*39;r(c,'#8f6a32',x,14,35,34);r(c,'#c2a052',x,11,34,32);r(c,'#e3c67a',x,11,34,3);for(let i=0;i<70;i++)line(c,i%3?'#d2b061':'#9f7c36',x+rand()*31,16+rand()*23,3,2);for(const tx of [x+9,x+26]){r(c,'#756238',tx,13,2,30);r(c,'#d8c390',tx,13,1,29);}}r(c,'#68452a',2,43,168,10);r(c,'#c89c5a',2,43,168,3);for(const x of [4,161]){r(c,'#67442b',x,4,7,52);r(c,'#b78c52',x,4,2,51);}r(c,'#c8a46b',1,3,170,4);});
 make('barn-fork',30,71,c=>{r(c,'#49321f',15,18,3,49);r(c,'#c3a071',15,18,2,48);r(c,'#dcc295',15,18,1,45);r(c,'#596759',8,13,18,7);r(c,'#a3ad93',8,13,18,2);for(const x of [8,13,19,24]){r(c,'#64715f',x,3,2,13);r(c,'#bdc7ac',x,3,1,12);}});
 make('barn-horseshoe',18,21,c=>{for(const x of [3,12]){r(c,'#37443d',x,2,4,12);r(c,'#a8ae96',x,2,2,10);for(const y of [4,8])r(c,'#4f5948',x+1,y,1,1);}r(c,'#485344',4,13,11,4);r(c,'#9ca58c',5,13,9,2);});
 make('barn-beam',128,23,c=>{r(c,'#3c2b21',0,3,128,20);r(c,'#795132',1,2,126,17);r(c,'#b78951',1,1,126,4);r(c,'#d3ac73',1,1,126,1);r(c,'#95683c',1,7,126,6);for(let i=0;i<48;i++)r(c,i%3?'#68472e':'#ad8049',rand()*128,6+rand()*9,3+rand()*15,1);for(const x of [8,117]){r(c,'#44483c',x,4,4,12);r(c,'#999b7a',x,4,1,11);r(c,'#d7c59b',x+2,6,1,1);r(c,'#d7c59b',x+2,13,1,1);}});
 make('barn-gate-leaf',22,49,c=>{r(c,'#44301f',2,1,18,46);r(c,'#aa7943',4,2,15,43);r(c,'#d7b273',4,2,2,42);r(c,'#5a3d26',8,6,8,34);for(const y of [6,36]){r(c,'#bf9659',4,y,14,5);r(c,'#e6c68c',5,y,13,1);}for(let y=9;y<38;y++)r(c,'#b68c50',6+(y-9)*.3,y,3,2);for(const y of [9,36]){r(c,'#3f4840',2,y,6,4);r(c,'#b0b494',3,y,4,1);}r(c,'#c8b172',16,21,3,5);});
}

export function buildBarnShell(scene:Phaser.Scene){
 barnDetails(scene);
 scene.add.tileSprite(160,220,880,586,'barn-oak').setOrigin(0).setDepth(.5);
 const g=scene.add.graphics().setDepth(1);g.fillStyle(0x4a3527).fillRect(150,140,900,80);g.fillStyle(0xc8b88b).fillRect(164,143,872,64);g.fillStyle(0xd7c69a).fillRect(165,144,870,7);
 // Plaster flecks, carved skirting and joints lend the rear wall a different material.
 for(let i=0;i<100;i++){g.fillStyle(i%3?0xb5a477:0xe1d2aa,.6);g.fillRect(173+(i*83)%850,154+(i*17)%46,2+i%3,1);}
 g.fillStyle(0x443326,.35).fillRect(164,219,872,12);
 for(const x of [165,449,751,1035]){scene.add.tileSprite(x,183,83,17,'barn-beam').setRotation(Math.PI/2).setDepth(225);g.fillStyle(0x443326,.15).fillRect(x+11,145,10,75);}
 scene.add.tileSprite(600,214,880,18,'barn-beam').setDepth(226);
 for(const x of [155,1044])scene.add.tileSprite(x,514,596,18,'barn-beam').setRotation(Math.PI/2).setDepth(227);
 scene.add.tileSprite(340,808,370,18,'barn-beam').setDepth(820);scene.add.tileSprite(860,808,370,18,'barn-beam').setDepth(820);
 g.fillStyle(0x665039).fillRect(530,790,140,34);g.fillStyle(0xbd9b62).fillRect(536,791,128,27);g.fillStyle(0xe0c38a).fillRect(536,791,128,3);g.fillStyle(0x7d5b37).fillRect(536,812,128,5);
 for(const x of [325,880]){scene.add.image(x,205,'life-window').setOrigin(.5,1).setDisplaySize(53,61).setDepth(224);g.fillStyle(0x4a3624,.15).fillEllipse(x+10,218,86,12);}
 scene.add.image(600,164,'barn-horseshoe').setDepth(228);
 for(const x of [216,501,699,985]){scene.add.image(x,219,'barn-lantern').setOrigin(.5,1).setDepth(228);for(const [radius,alpha] of [[65,.035],[42,.045],[22,.06]])g.fillStyle(0xffcc78,alpha).fillEllipse(x,234,radius*2,radius*1.4);}
 // Light is drawn once onto the floor cache, never a full-screen dark overlay.
 const light=scene.add.graphics().setDepth(8);for(const x of [325,880]){light.fillStyle(0xffe4a3,.045).fillPoints([{x:x-22,y:224},{x:x+22,y:224},{x:x+137,y:493},{x:x-7,y:493}],true);light.fillStyle(0xffedba,.04).fillPoints([{x:x-15,y:224},{x:x-1,y:224},{x:x+91,y:493},{x:x+58,y:493}],true);}
}

export function decorateBarnPen(scene:Phaser.Scene,pen:BarnPen){
 const {x,y,width:w,height:h}=pen;
 const img=(px:number,py:number,key:string,scale=1)=>scene.add.image(!pen.kind&&pen.side==='right'?x+w-(px-x):px,py,key).setOrigin(.5,1).setScale(scale).setDepth(py);
 const floor=scene.add.graphics().setDepth(2.5);floor.fillStyle(0x392d20,.22).fillRect(x+5,y+7,w-10,14).fillRect(x+5,y+18,9,h-22);
 if(pen.kind){
  // Bedding lies beneath the movement cells, not in front of the animals.
  if(pen.kind!=='dog'){const bed=scene.add.image(x+w*.51,y+h*.67,'barn-straw-bed').setDisplaySize(w*.68,h*.54).setDepth(2.7);if(pen.id%2===0)bed.setFlipX(true);}
  if(pen.kind==='cow'||pen.kind==='goat'){img(x+w-67,y+35,'barn-bucket',.7);img(x+155,y+31,'barn-fork',.47);}
  if(pen.kind==='dog'){img(x+w-70,y+64,'barn-kennel',.8);img(x+59,y+39,'barn-bowls',.8);}
 }else{
  // Distinct storage compositions replace the repeated rows of identical bales.
  const variant=Math.floor(pen.id/2);
  if(variant===0){img(x+92,y+67,'barn-hayloft',.94);img(x+w-65,y+86,'barn-hay-pile',.83);img(x+175,y+94,'barn-fork',.87);}
  else if(variant===1){img(x+50,y+92,'barn-feed-bin');img(x+94,y+75,'barn-feed-bin',.85);img(x+w-72,y+92,'barn-feed-crate');img(x+w-106,y+77,'barn-sack',.85);img(x+148,y+94,'barn-sack');}
  else if(variant===2){img(x+82,y+89,'barn-hay-pile');img(x+199,y+83,'barn-hayloft',.84);img(x+w-38,y+94,'barn-bucket',.8);}
  else {img(x+64,y+91,'barn-tool-stand');img(x+139,y+89,'barn-barrel',.85);img(x+w-61,y+89,'barn-feed-crate');img(x+w-115,y+95,'barn-bucket',.9);}
  scene.add.image(x+w*.50,y+86,'barn-straw-bed').setDisplaySize(w*.65,35).setAlpha(.45).setDepth(2.6);
 }
}
