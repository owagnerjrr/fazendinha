import {getPlot,remaining,type Farm} from './farm.js';
import {settlePlant} from './plant-care.js';
export function applyFertilizer(f:Farm,c:any,now:number){
 const fail=(message:string)=>({ok:false,message});
 if(!Number.isInteger(c.plot))return fail('Escolha um canteiro.');
 const p=getPlot(f,c.plot);if(!p?.crop||p.wateredAt===null)return fail('Plante e regue antes de fertilizar.');
 if(p.fertilized)return fail('Esta plantação já recebeu fertilizante.');
 const left=remaining(p,now);if(!left)return fail('Esta plantação já está pronta.');
 if((f.fertilizers??0)<1||f.fertilizerDebt)return fail('Você não tem fertilizantes disponíveis.');
 settlePlant(p,now);
 if(p.care)p.care.growthMs+=Math.ceil(left/2);else p.wateredAt-=Math.ceil(left/2);
 p.fertilized=true;f.fertilizers!--;
 return{ok:true,message:'Fertilizada! O tempo restante caiu pela metade.'};
}
