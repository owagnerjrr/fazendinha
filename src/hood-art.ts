// Original pixel-art night hood: pointed ears, rose lining and a diamond badge.
export function drawNightHood(c:CanvasRenderingContext2D,direction:string,skin:string,hair:string){
 const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const poly=(color:string,points:number[][])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 poly('#211e2b',[[3,2],[15,10],[25,10],[37,2],[34,22],[6,22]]);
 poly('#bd719b',[[6,6],[13,11],[8,16]]);poly('#bd719b',[[34,6],[27,11],[32,16]]);
 poly('#211e2b',[[13,9],[27,9],[33,13],[36,20],[35,28],[29,34],[11,34],[5,28],[4,20],[7,13]]);
 poly('#393445',[[13,12],[27,12],[31,16],[33,22],[31,29],[27,32],[13,32],[8,28],[7,21],[10,16]]);r('#51465c',13,12,14,2);
 if(direction==='up'){r('#51465c',10,18,20,2);r('#a2648a',16,30,8,3);return;}
 r('#211e2b',9,20,22,13);r(skin,11,21,18,11);r(skin,9,23,22,6);
 r(hair,11,20,18,3);r(hair,direction==='left'?24:11,22,4,4);
 if(direction==='down'){r('#211e2b',13,25,3,4);r('#211e2b',24,25,3,4);r('#fff0d6',13,25,1,1);r('#fff0d6',24,25,1,1);r('#b17573',18,30,4,1);}
 else{const x=direction==='left'?12:25;r('#211e2b',x,25,3,4);r('#fff0d6',x,25,1,1);r('#b17573',direction==='left'?10:28,30,3,1);}
 poly('#f1a4c9',[[20,12],[24,16],[20,20],[16,16]]);r('#ffe4ed',19,14,2,2);r('#bd719b',8,32,5,2);r('#bd719b',27,32,5,2);
}
