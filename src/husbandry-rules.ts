import {ANIMALS,type Animal} from './content.js';import {animalNeeds,productionAt,ANIMAL_CARE} from './animal-needs.js';
import {plantNeeds,settlePlant,PLANT_CARE} from './plant-care.js';import {housingProblem} from './housing.js';import {plotUsable} from './plots.js';import type {Farm} from './farm.js';
export const SUPPLIES={medicine:{name:'Remédio veterinário',price:30,amount:3},plantMedicine:{name:'Defensivo orgânico',price:18,amount:3},bedding:{name:'Palha limpa',price:10,amount:5}} as const;
export const HUSBANDRY_COMMANDS=['buy-supply','clean-animal','treat-animal','move-animal','cure-plant','feed-animal','water-animal','collect-animal','start-incubation','hatch-chick','mature-chick'] as const;
function settledAnimal(a:Animal,now:number):Animal{const next={...a,care:a.care?{...a.care}:undefined};if(next.care)next.care.illnessAt=animalNeeds(a,now).illnessAt;next.pendingAt=productionAt(a,now,ANIMALS[a.kind].seconds);return next;}
export function applyHusbandry(f:Farm,c:any,now:number){
 const fail=(message:string)=>({ok:false,message});if(!f.supplies)return fail('Atualize a fazenda para habilitar os cuidados.');
 if(c.type==='buy-supply'){
  if(!Object.hasOwn(SUPPLIES,c.kind))return fail('Escolha um suprimento válido.');const kind=c.kind as keyof typeof SUPPLIES,amount=c.quantity??1;
  if(!Number.isSafeInteger(amount)||amount<1||amount>20)return fail('Compre de 1 a 20 pacotes.');const item=SUPPLIES[kind],price=item.price*amount;
  if(f.coins<price)return fail('Moedas insuficientes.');f.coins-=price;f.supplies[kind]+=item.amount*amount;return{ok:true,message:`${item.name}: +${item.amount*amount} unidades.`};
 }
 if(c.type==='cure-plant'){
  if(!Number.isInteger(c.plot)||!plotUsable(f,c.plot)||(c.plot<24&&(f as Farm&{unlockedPlots?:number}).unlockedPlots!==undefined&&c.plot>=(f as any).unlockedPlots))return fail('Canteiro inválido.');
  const p=f.plots[c.plot],needs=plantNeeds(p,now);if(!p.crop||!p.care||!needs.sick)return fail('Esta planta não está doente.');if(needs.dry)return fail('Regue a planta antes de aplicar o defensivo.');if(f.supplies.plantMedicine<1)return fail('Compre defensivo orgânico na venda.');
  settlePlant(p,now);p.care.illnessAt=null;p.care.checkpointAt=now;p.pestAt=now+PLANT_CARE.pestReturnMs;f.supplies.plantMedicine--;return{ok:true,message:'Planta tratada! O crescimento foi retomado.'};
 }
 const original=f.animals.find(a=>a.id===c.id);if(!original)return fail('Animal não encontrado.');const a=settledAnimal(original,now),needs=animalNeeds(a,now),house=a.housing??'barn';
 const commit=(message:string)=>{Object.assign(original,a);return{ok:true,message};};
 if(c.type==='feed-animal'){
  if(needs.food>ANIMAL_CARE.refillAt)return fail('O comedouro ainda está abastecido.');if(f.feed<1)return fail('Compre ração na venda.');
  f.feed--;a.fedAt=now;return commit('Comedouro abastecido. A ração dura até 24 horas.');
 }
 if(c.type==='water-animal'){
  if(needs.water>ANIMAL_CARE.refillAt)return fail('O bebedouro ainda tem água fresca.');a.wateredAt=now;return commit('Bebedouro abastecido com água fresca por até 24 horas.');
 }
 if(c.type==='clean-animal'){
  if(needs.clean>ANIMAL_CARE.refillAt)return fail('A cama do animal ainda está limpa.');if(f.supplies.bedding<1)return fail('Compre palha limpa na venda.');
  f.supplies.bedding--;a.care!.cleanedAt=now;return commit('Instalação limpa e palha trocada.');
 }
 if(c.type==='treat-animal'){
  if(!needs.sick)return fail('Este animal não precisa de remédio.');if(needs.food<=0||needs.water<=0||needs.clean<=0)return fail('Ofereça ração, água e uma cama limpa antes do remédio.');if(f.supplies.medicine<1)return fail('Compre remédio veterinário na venda.');
  f.supplies.medicine--;a.care!.illnessAt=null;a.care!.recoveredAt=now;return commit('Animal tratado! A recuperação permite retomar a produção.');
 }
 if(c.type==='move-animal'){
  if(c.housing===house)return fail('O animal já está neste local.');const error=housingProblem(f,a.kind,c.housing,a.id,1+(a.incubationAt!=null?1:0));if(error)return fail(error);
  a.housing=c.housing;return commit('Animal transferido com seus cuidados e produção preservados.');
 }
 const cared=needs.food>0&&needs.water>0&&needs.clean>0&&!needs.sick;
 if(c.type==='start-incubation'){
  if(a.kind!=='chicken'||a.incubationAt!=null)return fail('Escolha uma galinha que não esteja chocando.');
  if(!cared||!f.animals.some(r=>r.kind==='rooster'&&(r.housing??'barn')===house&&(()=>{const n=animalNeeds(r,now);return n.food>0&&n.water>0&&!n.sick;})()))return fail('A galinha e um galo saudáveis precisam de ração, água e estar na mesma instalação.');
  const space=housingProblem(f,'chick',house,undefined,1);if(space)return fail(space);
  if(f.products.egg>0)f.products.egg--;else if(a.pendingAt!=null){a.pendingAt=null;a.collectedAt=now;}else return fail('Colete um ovo ou espere surgir um ovo no ninho.');
  a.incubationAt=now;return commit('Ovo reservado e choco iniciado. O pintinho nasce após 2 minutos reais se a mãe estiver saudável.');
 }
 if(c.type==='hatch-chick'){
  if(a.kind!=='chicken'||a.incubationAt==null)return fail('Não há ovo em incubação.');if(now-a.incubationAt<120000)return fail('O ovo ainda está chocando.');if(!cared)return fail('Cuide da mãe antes da eclosão.');
  // The reserved egg already occupies this slot; validate its conversion without counting twice.
  const space=housingProblem(f,'chick',house,a.id,2);if(space)return fail(space);
  const sex=f.animals.filter(a=>a.bornAt!=null).length%4===3?'male':'female';a.incubationAt=null;a.collectedAt=now;
  f.animals.push({id:`chick-${now}-${f.animals.length}`,kind:'chick',sex,housing:house,fedAt:null,wateredAt:null,collectedAt:now,bornAt:now,care:{startedAt:now,cleanedAt:now,illnessAt:null}});return commit('O ovo eclodiu: nasceu um pintinho! Ofereça água e ração.');
 }
 if(c.type==='mature-chick'){
  if(a.kind!=='chick'||a.bornAt==null)return fail('Este animal não é um pintinho.');if(now-a.bornAt<300000||!cared)return fail('O pintinho precisa de 5 minutos reais e estar bem cuidado.');a.kind=a.sex==='male'?'rooster':'chicken';a.collectedAt=now;a.pendingAt=null;return commit(a.kind==='rooster'?'Seu pintinho cresceu e virou um galo!':'Seu pintinho cresceu e virou uma galinha!');
 }
 if(c.type==='collect-animal'){
  const item=ANIMALS[a.kind];if(!item.product||a.pendingAt==null)return fail('Ainda não há produto. Verifique ração, água, saúde e o tempo de produção.');
  f.products[item.product]++;a.collectedAt=now;a.pendingAt=null;return commit(`+1 ${item.productName.toLowerCase()} no celeiro.`);
 }
 return fail('Cuidado desconhecido.');
}
