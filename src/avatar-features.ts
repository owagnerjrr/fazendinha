import {HAIR_COLORS,SKIN_TONES,SHIRT_COLORS,type Avatar} from './content';
const shade=(hex:string,f:number)=>'#'+[1,3,5].map(i=>Math.round(Math.min(255,parseInt(hex.slice(i,i+2),16)*f)).toString(16).padStart(2,'0')).join('');
// Add details to the native anatomy rather than replacing the face or torso.
export function drawModelFeatures(c:CanvasRenderingContext2D,a:Avatar,row:number,cx:number,top:number){
 if(a.style!=='crop'&&a.style!=='short')return;
 const skin=SKIN_TONES[a.skin],hair=HAIR_COLORS[a.hair],shirt=SHIRT_COLORS[a.shirt],edge='#30252a';
 const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
 // These models have uncovered short hair, rather than the shared straw hat.
 const face=document.createElement('canvas');face.width=22;face.height=13;
 const transform=c.getTransform();face.getContext('2d')!.putImageData(c.getImageData(Math.round(cx)-11+transform.e,top+21+transform.f,22,13),0,0);
 c.clearRect(cx-25,Math.max(0,top-2),50,top+25-Math.max(0,top-2));
 if(row!==3)c.drawImage(face,cx-11,top+21);
 r(edge,cx-9,top+6,18,3);r(edge,cx-12,top+9,24,7);r(edge,cx-13,top+16,26,5);
 r(hair,cx-8,top+7,16,3);r(hair,cx-11,top+10,22,9);r(shade(hair,1.35),cx-7,top+9,14,2);
 if(row!==3){r(skin,cx-8,top+18,16,5);r(hair,cx-10,top+17,20,3);}
 if(a.style==='crop'){for(const [x,y]of [[-10,9],[-5,6],[1,6],[7,9]]){r(hair,cx+x,top+y,5,4);r(shade(hair,1.35),cx+x,top+y,2,1);}}
 if(row===0){
  // Short fringe, stronger brows and compact eyes retain the original rounded cheeks.
  for(const side of [-1,1]){const x=cx+side*5;r(skin,x-2,top+22,5,6);r(edge,x-2,top+21,5,1);r(edge,x-1,top+24,3,3);r('#f6ead3',x-1,top+24,1,1);}
  if(a.style==='crop'){for(const x of [-7,-3,1,5]){r(hair,cx+x,top+17,3,4);r(shade(hair,1.7),cx+x,top+17,2,1);r(shade(hair,1.5),cx+x,top+12,2,1);}}
  else{r(hair,cx-7,top+18,13,2);r(hair,cx-4,top+20,4,1);}
  // Open, straight shirt collar rather than the original narrow pinafore straps.
  r(shade(shirt,.85),cx-7,top+32,14,2);r('#e1d1ad',cx-3,top+31,2,3);r('#e1d1ad',cx+1,top+31,2,3);r(shade(shirt,.65),cx-1,top+34,2,4);
 }else if(row===3){
  // A short nape and a wider shoulder seam distinguish the back view.
  r(shade(skin,.8),cx-3,top+29,6,3);r(hair,cx-10,top+20,20,9);r(shade(shirt,.8),cx-7,top+33,14,1);
 }else{
  const side=row===1?-1:1;r(hair,cx-side*6,top+20,3,4);r(shade(shirt,.75),cx-4,top+33,8,2);
 }
}
