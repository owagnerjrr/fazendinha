import {soilTime,allPlots,type Farm,type Plot} from './farm.js';
import {DECOR_SLOTS} from './content.js';
import {plotPosition,reservedLandPoint} from './plots.js';
export function groundPosition(p:{x:number;y:number}){return{x:Math.round(p.x/40)*40,y:Math.round(p.y/40)*40};}
export function groundAllowed(f:Farm,p:{x:number;y:number}){
 if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const q=groundPosition(p);if(q.x!==p.x||q.y!==p.y||reservedLandPoint(q.x,q.y))return false;
 const meadow=(q.x>=560&&q.x<=920&&q.y>=240&&q.y<=320)||(q.x>=560&&q.x<=920&&q.y>=360&&q.y<=560)||(q.x>=320&&q.x<=400&&q.y>=560&&q.y<=720)||(q.x>=800&&q.x<=960&&q.y>=720&&q.y<=840);
 if(!meadow)return false;if(f.decorations.some(d=>{const s=DECOR_SLOTS[d.slot];return s&&Math.abs(q.x-s.x)<45&&Math.abs(q.y-s.y)<45;}))return false;
 if([[877,260],[530,280],[535,860],[330,790],[940,940],[1150,540],[190,840]].some(([x,y])=>Math.abs(q.x-x)<45&&Math.abs(q.y-y)<40))return false;
 if(allPlots(f).some(plot=>{const pos=plotPosition(plot.id,f);return pos&&Math.abs(pos.x-q.x)<39&&Math.abs(pos.y-q.y)<39;}))return false;
 return true;
}
export function tillGround(f:Farm,p:{x:number;y:number},now:number){
 if(!groundAllowed(f,p))return{ok:false,message:'Escolha terra livre, longe de caminhos, árvores e construções.'};
 if(Math.hypot(f.player.x-p.x,f.player.y-p.y)>70)return{ok:false,message:'Aproxime-se da terra.'};
 if((f.customPlots?.length??0)>=80)return{ok:false,message:'Limite de 80 canteiros livres atingido.'};
 const online=f as Farm&{energy?:number};if(online.energy!=null&&online.energy<2)return{ok:false,message:'Energia insuficiente.'};
 const plot:Plot={id:60+(f.customPlots?.length??0),position:{...p},tilled:true,tilledAt:soilTime(f,now),crop:null,wateredAt:null};
 (f.customPlots??=[]).push(plot);if(online.energy!=null)online.energy-=2;
 return{ok:true,message:'Terra preparada.'};
}
