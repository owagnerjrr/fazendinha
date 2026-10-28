/** Raise head/shoulders by whole pixels, stretch only the shirt, and keep legs/feet fixed. */
export function idlePixels(source:Uint8ClampedArray,w:number,h:number,upperEnd:number,legs:number,rise:number){
 const out=new Uint8ClampedArray(source.length);
 for(let y=0;y<h;y++){
  const sy=y>=legs?y:y<upperEnd-rise?y+rise:upperEnd+Math.floor((y-upperEnd+rise)*(legs-upperEnd)/(legs-upperEnd+rise));
  out.set(source.subarray(sy*w*4,(sy+1)*w*4),y*w*4);
 }
 return out;
}
