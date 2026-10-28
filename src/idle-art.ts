/** One-pixel upper-body breathing. The feet and collision anchor stay unchanged. */
export function breathingPixels(source:Uint8ClampedArray,width:number,height:number,feet:number,phase:number){
 const out=source.slice(),lift=phase===1||phase===2?1:0;if(!lift)return out;
 for(let y=0;y<feet-1;y++)out.set(source.subarray((y+1)*width*4,(y+2)*width*4),y*width*4);
 return out;
}
export function idlePhase(time:number,moving:boolean,acting:boolean,reduced:boolean){return moving||acting||reduced?0:Math.floor(time/700)%4;}
