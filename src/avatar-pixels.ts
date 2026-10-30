// Keep sprite edges opaque and discard isolated export specks, preserving tools.
export function cleanAvatarPixels(data:Uint8ClampedArray,w:number,h:number){
 for(let i=3;i<data.length;i+=4)data[i]=data[i]>=180?255:0;
 const seen=new Uint8Array(w*h);
 for(let p=0;p<w*h;p++){if(seen[p]||!data[p*4+3])continue;const cells=[p];seen[p]=1;
  for(let j=0;j<cells.length;j++){const q=cells[j],x=q%w,y=Math.floor(q/w);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy,n=ny*w+nx;if(nx>=0&&nx<w&&ny>=0&&ny<h&&!seen[n]&&data[n*4+3]){seen[n]=1;cells.push(n);}}}
  if(cells.length<8)for(const q of cells)data[q*4+3]=0;
 }
 return data;
}
