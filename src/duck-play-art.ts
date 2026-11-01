import type{Avatar}from'./content';import{SKIN_TONES}from'./content';import{outfitSleeveColor}from'./outfit-art';
/** Replace the active arm, rather than drawing a second limb over the resting one. */
export function duckPalm(row:number,phase:number){const flip=row===2?-1:1,profile=row===1||row===2,shoulder=profile?24+flip*7:32,top=profile?35:36;return{x:profile?shoulder-flip*[0,6,12,8][phase]:shoulder+[3,4,7,5][phase],y:top+[13,4,5,9][phase]};}
export function drawDuckArm(c:CanvasRenderingContext2D,a:Avatar,row:number,phase:number){if(row===3)return;const flip=row===2?-1:1,profile=row===1||row===2,shoulder=profile?24+flip*7:32,top=profile?35:36;
 c.clearRect(profile?(flip===1?30:7):32,top,profile?11:10,16);
 const sleeve=outfitSleeveColor(a),skin=a.outfit==='forest'?'#795031':a.outfit==='nebula'?'#a266b4':SKIN_TONES[a.skin],outline='#493d32';
 const elbowX=profile?shoulder+flip*(phase===2?-1:1):shoulder+2,elbowY=top+(phase===0?8:6),handX=duckPalm(row,phase).x,handY=duckPalm(row,phase).y;
 const stroke=(color:string,width:number,x:number,y:number,xx:number,yy:number)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='square';c.beginPath();c.moveTo(Math.round(x),Math.round(y));c.lineTo(Math.round(xx),Math.round(yy));c.stroke();};
 stroke(outline,6,shoulder,top+2,elbowX,elbowY);stroke(sleeve,4,shoulder,top+2,elbowX,elbowY);stroke(outline,5,elbowX,elbowY,handX,handY);stroke(skin,3,elbowX,elbowY,handX,handY);c.fillStyle=skin;c.fillRect(Math.round(handX)-1,Math.round(handY)-1,3,3);
}
export function duckActing(elapsed:number){const t=Math.max(0,elapsed);return{frame:t<300?0:t<650?1:t<950?2:t<1400?3:Math.floor((t-1400)/1100)%3===1?1:0,flight:Math.max(0,Math.min(1,(t-650)/750)),landed:t>=1400};}
