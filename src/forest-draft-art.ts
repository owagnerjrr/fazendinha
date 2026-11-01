/** Original woodland costume. Stowed equipment keeps hands free for farming. */
import type{HeadAttachment}from'./avatar-attachment';
const C={line:'#29302b',deep:'#244b32',green:'#3e8747',light:'#7eb55b',mint:'#a7ce7b',gold:'#deb25c',leather:'#795031',leatherLight:'#b17a45',cream:'#eee0ac',blue:'#315f9e',blueLight:'#629ac5',blueDark:'#273e68',silver:'#adc8c5',shine:'#e6efdc'};
type Source={pixels:Uint8ClampedArray;width:number;height:number};
export function drawForestDraft(c:CanvasRenderingContext2D,row:number,n:HeadAttachment,headTop:number,source?:Source){
 c.save();c.imageSmoothingEnabled=false;c.translate(n.x,n.y);
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
 const line=(x0:number,y0:number,x1:number,y1:number,color:string,size=1)=>{let x=x0,y=y0;const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;for(;;){r(x-Math.floor(size/2),y-Math.floor(size/2),size,size,color);if(x===x1&&y===y1)break;const e=2*err;if(e>=dy){err+=dy;x+=sx}if(e<=dx){err+=dx;y+=sy}}};
 const profile=row===1||row===2;
 // Green tunic, leather baldric and a split hem; original moving legs stay intact.
 r(-6,0,12,2,C.deep);r(-5,1,10,3,C.green);if(row===0){r(-2,0,4,2,C.cream);r(-1,2,2,2,C.deep);}
 const half=profile?5:7;r(-half,10,half*2,6,C.deep);r(-half+1,10,half*2-2,5,C.green);r(-half+2,11,2,3,C.light);r(-1,14,2,2,C.deep);
 if(row!==3)line(profile?-3:-5,1,profile?2:5,12,C.leather,2);else line(5,0,-4,12,C.leather,2);
 r(-half,11,half*2,2,C.leather);r(-2,11,4,3,C.line);r(-1,11,3,2,C.gold);r(0,12,1,1,C.leather);r(profile?3:5,11,3,4,C.leather);r(profile?3:5,11,3,1,C.leatherLight);
 // Slightly longer blond locks below the cap, attached to the moving neck.
 const lock=(x:number,y:number)=>{r(x,y,3,6,'#795532');r(x,y,2,5,'#d8ab5c');r(x,y,1,4,'#f2d68a');r(x+1,y+5,1,2,'#b17c3d');};
 if(row===0){lock(-9,-4);lock(7,-4);}
 else if(row===1){lock(4,-5);lock(7,-6);}
 else if(row===2){lock(-7,-5);lock(-10,-6);}
 else{lock(-7,-4);lock(-4,-3);lock(-1,-3);lock(2,-3);lock(5,-4);}
 // Pointed cap with an asymmetric soft fold. Keep the original face and blond hair visible.
 const y=Math.round(headTop-n.y),tail=row===2?-1:1;
 for(let i=0;i<11;i++)r(tail===1?7+i:-13-i,y+4+i,Math.max(2,7-Math.floor(i/2)),2,C.deep);
 for(let i=0;i<10;i++)r(tail===1?8+i:-12-i,y+5+i,Math.max(1,5-Math.floor(i/2)),1,C.green);
 r(-4,y-3,8,1,C.line);r(-7,y-2,14,2,C.line);r(-9,y,18,3,C.line);r(-11,y+3,22,5,C.line);r(-10,y+8,20,2,C.line);
 r(-4,y-2,8,1,C.light);r(-6,y-1,12,2,C.green);r(-8,y+1,16,3,C.green);r(-10,y+4,20,4,C.green);r(-7,y+1,4,2,C.light);r(-5,y,3,1,C.mint);r(-10,y+8,20,2,C.deep);r(-8,y+8,15,1,C.light);r(6,y+8,2,2,C.gold);
 const shield=(x:number,y:number,back=false,edge=false)=>{c.save();c.translate(Math.round(x),Math.round(y));if(edge){r(-2,-8,4,16,C.line);r(-1,-7,2,13,C.gold);r(0,-6,1,11,C.blue);c.restore();return;}
  r(-5,-8,10,1,C.line);r(-7,-7,14,8,C.line);r(-6,1,12,3,C.line);r(-4,4,8,3,C.line);r(-2,7,4,2,C.line);
  r(-5,-7,10,1,C.gold);r(-6,-6,12,7,C.gold);r(-5,1,10,2,C.gold);r(-3,3,6,3,C.gold);r(-1,6,2,2,C.gold);
  const fill=back?C.leather:C.blue;r(-4,-6,8,1,fill);r(-5,-5,10,6,fill);r(-4,1,8,1,fill);r(-2,2,4,3,fill);
  if(back){r(-3,-4,1,7,C.leatherLight);r(2,-4,1,7,C.line);r(-3,-1,6,2,C.line);r(-1,-2,2,4,C.leatherLight);}else{r(-4,-5,2,5,C.blueLight);r(3,-4,1,5,C.blueDark);line(0,3,0,-4,C.cream);r(-2,-3,2,2,C.mint);r(1,-1,2,2,C.gold);r(-1,-4,2,2,C.mint);r(-2,2,1,1,C.silver);}
  c.restore();};
 // Stowed in every pose: back-facing shield, sheathed blade and shoulder hilt.
 // Front/profile equipment sits behind the actual body, leaving moving hands free.
 c.save();if(row!==3)c.globalCompositeOperation='destination-over';
 const backSide=row===2?-1:1;
 line(-backSide*5,15,backSide*7,-5,C.line,4);
 line(-backSide*5,15,backSide*7,-5,C.leather,2);
 line(-backSide*4,14,backSide*7,-4,C.leatherLight);
 line(backSide*4,-3,backSide*10,-7,C.line,3);
 line(backSide*4,-3,backSide*10,-7,C.gold);
 line(backSide*7,-6,backSide*10,-11,C.line,3);
 line(backSide*7,-6,backSide*10,-11,C.blueDark);
 r(backSide*10-1,-12,3,2,C.gold);
 if(row===3)shield(0,6,false);
 else if(profile)shield(backSide*7,6,false,true);
 else shield(5,6,false);
 c.restore();
 c.restore();
}
