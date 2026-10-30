// Original night hood, drawn at native pixel size around the farmer's own face.
export function drawNightHood(c:CanvasRenderingContext2D,direction:string){
 const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 // Stepped curves retain the same pixel density as the original face and body.
 const bands=[[7,13,14],[9,9,22],[11,7,26],[14,5,30],[18,4,32],[24,5,30],[30,7,26],[34,11,18]];
 for(let i=0;i<bands.length;i++){const [y,x,w]=bands[i];r('#231d2d',x,y,w,(bands[i+1]?.[0]??38)-y);}
 r('#403348',10,11,20,3);r('#54425c',12,10,14,2);r('#403348',6,17,3,12);r('#312638',31,16,3,15);
 // Curved, asymmetrical ears with rose lining and tiny tip pompons.
 for(const [x,y,w,h]of [[4,0,3,3],[5,3,4,4],[6,7,5,4],[8,11,5,4],[33,2,3,3],[31,5,4,4],[28,9,5,6]])r('#231d2d',x,y,w,h);
 r('#231d2d',5,5,5,4);r('#231d2d',7,9,7,6);r('#231d2d',30,7,5,4);r('#231d2d',27,11,7,5);
 r('#b775a1',7,6,2,5);r('#da9cbd',9,10,2,3);r('#b775a1',31,7,2,5);
 r('#4c3c54',3,0,3,2);r('#4c3c54',34,2,3,2);
 if(direction==='up'){r('#4c3c54',10,21,20,2);r('#b775a1',16,33,8,2);r('#edb8d2',19,32,2,4);return;}
 // Heart-shaped rose badge; the face itself is restored from the full sprite.
 r('#d98eb5',17,13,3,3);r('#d98eb5',21,13,3,3);r('#efa6ca',17,16,7,2);r('#d98eb5',19,18,3,2);r('#ffe0ef',18,14,1,1);
 r('#bd7b9f',7,32,4,3);r('#e5a4c4',8,32,2,1);r('#bd7b9f',29,32,4,3);r('#e5a4c4',30,32,2,1);
}
