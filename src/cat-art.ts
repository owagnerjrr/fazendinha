import type Phaser from 'phaser';
import type {Animal} from './content';
const coats={black:['#252833','#424657','#f0c5aa'],white:['#e9e6db','#bcb8b5','#e4a3a2'],ginger:['#ce8043','#934e2e','#f3c497'],gray:['#7f8d99','#4f5b6b','#e6b7b0'],calico:['#ede5d1','#493c38','#d18a45']} as const;
export const catTexture=(color:Animal['color']='black')=>`cat-${color}`;
/** Original eight-frame cat art. Limbs lift independently; the torso keeps its shape. */
export function catArt(scene:Phaser.Scene){for(const [color,palette]of Object.entries(coats)){
 const key=catTexture(color as Animal['color']);if(scene.textures.exists(key))continue;
 const cv=document.createElement('canvas');cv.width=36*8;cv.height=36;const c=cv.getContext('2d')!;c.imageSmoothingEnabled=false;
 for(let f=0;f<8;f++){const ox=f*36,phase=f*Math.PI/4,bob=f===2||f===6?-1:0;
  const r=(fill:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=fill;c.fillRect(ox+x,y,w,h);};
  const [fur,shade,accent]=palette,outline='#20252b';
  // Curled tail, back, chest and four alternating paws.
  r(outline,3,12+bob,4,14);r(fur,4,11+bob,2,13);r(fur,2,9+bob,3,6);
  r(outline,7,16+bob,21,13);r(fur,8,16+bob,19,11);r(shade,8,24+bob,18,4);r(fur,10,14+bob,13,5);
  for(let leg=0;leg<4;leg++){const wave=Math.sin(phase+(leg%2)*Math.PI),x=[9,12,22,25][leg]+Math.round(wave*2),lift=wave>0?2:0;r(outline,x,25+bob,4,8-lift);r(leg%2?shade:fur,x+1,25+bob,2,7-lift);r(accent,x,31-lift,4,2);}
  r(outline,22,5+bob,4,9);r(outline,29,6+bob,4,9);r(fur,23,7+bob,2,6);r(accent,23,8+bob,1,3);r(fur,30,8+bob,2,5);
  r(outline,20,12+bob,15,12);r(fur,21,12+bob,13,11);r(shade,21,20+bob,12,3);r(fur,23,11+bob,9,4);
  if(color==='calico'){r(accent,9,17+bob,7,5);r(shade,28,12+bob,5,5);}if(color==='ginger'||color==='gray'){r(shade,11,15+bob,2,4);r(shade,17,15+bob,2,4);}
  r('#bfd971',24,16+bob,3,2);r('#bfd971',30,16+bob,3,2);r('#17272b',25,16+bob,1,2);r('#17272b',31,16+bob,1,2);r('#eeaeaa',28,19+bob,2,1);r('#e6ddca',21,20+bob,4,1);r('#e6ddca',32,20+bob,3,1);
 }
 const tex=scene.textures.addCanvas(key,cv)!;for(let i=0;i<8;i++)tex.add(i,0,i*36,0,36,36);
 if(color==='black'&&!scene.textures.exists('life-cat')){const base=document.createElement('canvas');base.width=36;base.height=36;base.getContext('2d')!.drawImage(cv,0,0,36,36,0,0,36,36);scene.textures.addCanvas('life-cat',base);}
}}
