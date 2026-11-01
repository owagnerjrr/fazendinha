import{createdLife}from'./created-animal-rules.js';
import{settleSouth}from'./south-settlement.js';import{callPets}from'./pet-call-rules.js';
import{applyExpansion,EXPANSION_COMMANDS}from'./expansion-rules.js';
import{availablePen,assignBarnPens}from'./barn-slots.js';
import{protectPlot}from'./climate.js';
import{livingCommand,settleVitals,boostVital}from'./living-animals.js';
import {setPetMode} from './pet-rules.js';
import {applyHouseDesign} from './home-design.js';
import {applyFertilizer} from './fertilizer.js';
import {applyWardrobe} from './wardrobe.js';
import {tillGround} from './ground-rules.js';
import {applyFishing,FISHING_COMMANDS} from './fishing.js';
import {applyHusbandry,HUSBANDRY_COMMANDS} from './husbandry-rules.js';
import {housingProblem} from './housing.js';
import {applyHome} from './world-time.js';
import { ANIMALS, DECOR, DECOR_SLOTS, animalReady, animalHydrated, validAvatar, type AnimalKind, type DecorationKind } from './content.js';
import { LAND_PRICE, ORIGINAL_PLOTS, EXTRA_PLOTS, LAND_SITES, BUILDINGS, parcels, buildProblem, type LandSite, type BuildingKind } from './plots.js';
import type { Farm } from './farm.js';
export const LIFE_COMMANDS=['call-pets','settle-south',...EXPANSION_COMMANDS,'protect-plot','feed-cat-fish','walk-animals','visitor-care-setting','pet-setting','buy-house-item','place-house-item','house-style','fertilize','buy-outfit','equip-outfit','till-ground',...FISHING_COMMANDS,...HUSBANDRY_COMMANDS,'home','avatar','buy-land','build-land','buy-animal','buy-feed','feed-animal','water-animal','pet-animal','play-animal','rename-animal','start-incubation','hatch-chick','mature-chick','collect-animal','buy-decor','move-decor','raids-setting','animal-raids-setting'] as const;
export function applyLife(f:Farm,c:any,now:number):{ok:boolean;message:string;caught?:import('./fishing.js').Fish} {
 const created=createdLife(f,c,now);if(created)return created;settleVitals(f,now);if(c.type==='call-pets')return callPets(f,c,now);if(c.type==='settle-south'){const n=settleSouth(f,true);return{ok:true,message:n?`${n} construções organizadas nos campos do sul.`:'Não há construções pendentes com espaço livre. Estoque e plantas foram preservados.'};}if((EXPANSION_COMMANDS as readonly string[]).includes(c.type))return applyExpansion(f,c);if(c.type==='protect-plot')return protectPlot(f,c);if(['feed-cat-fish','walk-animals','visitor-care-setting'].includes(c.type))return livingCommand(f,c,now);
 if(c.type==='pet-setting')return setPetMode(f.animals,c.id,c.mode);
 if(['buy-house-item','place-house-item','house-style'].includes(c.type))return applyHouseDesign(f,c);
 if(c.type==='fertilize')return applyFertilizer(f,c,now);
 if(c.type==='buy-outfit'||c.type==='equip-outfit')return applyWardrobe(f,c);
 if(c.type==='till-ground')return tillGround(f,c.position,now);
 if((FISHING_COMMANDS as readonly string[]).includes(c.type))return applyFishing(f,c,now);
 const fail=(message:string)=>({ok:false,message});
 if(f.careVersion&&(HUSBANDRY_COMMANDS as readonly string[]).includes(c.type))return applyHusbandry(f,c,now);
 if(c.type==='home')return applyHome(f,c,now);
 if(c.type==='avatar'){if(!validAvatar(c.avatar))return fail('Escolha um avatar válido.');if(f.studio)delete f.studio.model;f.avatar={style:c.avatar.style,skin:c.avatar.skin,hair:c.avatar.hair,shirt:c.avatar.shirt};return {ok:true,message:'Seu avatar foi atualizado!'};}
 if(c.type==='animal-raids-setting'){if(typeof c.enabled!=='boolean')return fail('Opção inválida.');f.animalRaids=c.enabled;return{ok:true,message:c.enabled?'Roubo de animais ativado entre amigos participantes.':'Seus animais estão fora da brincadeira.'};}
 if(c.type==='raids-setting'){if(typeof c.enabled!=='boolean')return fail('Opção inválida.');f.socialRaids=c.enabled;return {ok:true,message:c.enabled?'Brincadeira ativada entre amigos participantes, mesmo com cachorro. Limite diário e pausa após roubo continuam valendo.':'Sua fazenda está fora da brincadeira de roubo.'};}
 if(c.type==='buy-land'){
  const site=(c.site??'west') as LandSite;if(!Object.hasOwn(LAND_SITES,site))return fail('Escolha um terreno válido.');
  const owned=parcels(f);if(owned.some(p=>p.site===site))return fail('Este terreno já pertence à sua fazenda.');
  const online=f as Farm & {unlockedPlots?:number};if(online.unlockedPlots!==undefined&&online.unlockedPlots<24)return fail('Libere os 24 canteiros da horta inicial antes de comprar este terreno.');
  if(f.coins<LAND_PRICE)return fail(`Você precisa de ${LAND_PRICE} moedas para comprar o terreno.`);
  if(f.plots.length!==ORIGINAL_PLOTS+owned.length*EXTRA_PLOTS)return fail('Não foi possível conferir seus canteiros.');
  const startId=f.plots.length;f.coins-=LAND_PRICE;f.landOwned=true;f.landParcels=[...owned,{site,startId}];
  for(let i=0;i<EXTRA_PLOTS;i++)f.plots.push({id:startId+i,tilled:false,crop:null,wateredAt:null});
  return {ok:true,message:'Terreno adquirido no local escolhido! 12 espaços para plantar ou construir.'};
 }
 if(c.type==='build-land'){
  if(!Object.hasOwn(BUILDINGS,c.kind)||!Object.hasOwn(LAND_SITES,c.site))return fail('Construção ou terreno inválido.');
  const kind=c.kind as BuildingKind,site=c.site as LandSite,error=buildProblem(f,kind,site,c.col,c.row);if(error)return fail(error);
  if(f.coins<BUILDINGS[kind].price)return fail('Moedas insuficientes para construir.');
  f.coins-=BUILDINGS[kind].price;f.buildings??=[];f.buildings.push({id:`building-${site}`,kind,site,col:c.col,row:c.row});
  return {ok:true,message:`${BUILDINGS[kind].name} construído! Os demais espaços continuam disponíveis para plantar.`};
 }
 if(c.type==='buy-animal'){
  if(!Object.hasOwn(ANIMALS,c.kind))return fail('Animal inválido.');const kind=c.kind as AnimalKind,item=ANIMALS[kind];
  const housing=c.housing??'barn',space=housingProblem(f,kind,housing,undefined,1,c.pen);if(space)return fail(space);
  if(!f.careVersion&&f.animals.length+f.animals.filter(x=>x.incubationAt!=null).length>=40)return fail('Seu celeiro comporta 40 animais, incluindo ovos em incubação.');if(f.coins<item.price)return fail('Moedas insuficientes.');
  if(kind==='cat'&&c.color!==undefined&&!['black','white','ginger','gray','calico'].includes(c.color))return fail('Escolha uma cor válida.');
  f.coins-=item.price;f.animals.push({id:`animal-${now}-${f.animals.length}`,kind,...(housing==='barn'?{pen:c.pen??availablePen(f.animals)}:{}),...(kind==='dog'?{petMode:'barn' as const}:{}),...(kind==='cat'?{color:c.color??'black'}:{}),fedAt:null,wateredAt:null,pettedAt:null,collectedAt:now,productionVersion:1,...(f.careVersion?{housing,care:{startedAt:now,cleanedAt:now,illnessAt:null}}:{}),...(kind==='chick'?{bornAt:now}:{})});f.barnVersion=1;assignBarnPens(f);return {ok:true,message:`${item.name} entregue em ${housing==='barn'?'seu celeiro · Baia '+((f.animals.at(-1)!.pen??0)+1):'sua instalação'}. Alimente e ofereça água!`};
 }
 if(c.type==='buy-feed'){if(f.coins<10)return fail('Você precisa de 10 moedas.');f.coins-=10;f.feed+=5;return {ok:true,message:'+5 porções de ração.'};}
 if(['feed-animal','water-animal','pet-animal','play-animal','rename-animal','start-incubation','hatch-chick','mature-chick','collect-animal'].includes(c.type)){
  const a=f.animals.find(a=>a.id===c.id);if(!a)return fail('Animal não encontrado.');
  const cared=(a:Farm['animals'][number])=>a.fedAt!==null&&now>=a.fedAt&&now-a.fedAt<86400000&&animalHydrated(a,now);
  if(c.type==='start-incubation'){
   if(a.kind!=='chicken')return fail('Escolha uma galinha adulta.');if(a.incubationAt!=null)return fail('Esta galinha já está chocando um ovo.');
   if(!cared(a)||!f.animals.some(x=>x.kind==='rooster'&&cared(x)))return fail('Cuide da galinha e de um galo: ambos precisam de ração e água.');
   if(f.products.egg<1)return fail('É necessário ter um ovo no celeiro.');const space=housingProblem(f,'chick','barn',undefined,1,a.pen);if(space)return fail(space);if(f.animals.length+f.animals.filter(x=>x.incubationAt!=null).length>=40)return fail('Não há espaço para mais filhotes no celeiro.');
   f.products.egg--;a.incubationAt=now;return {ok:true,message:'Ovo reservado para incubação. Volte em 2 minutos.'};
  }
  if(c.type==='hatch-chick'){
   if(a.kind!=='chicken'||a.incubationAt==null)return fail('Não há ovo em incubação.');if(now-a.incubationAt<120000)return fail('O ovo ainda está em incubação.');const space=housingProblem(f,'chick','barn',a.id,2,a.pen);if(space)return fail(space);
   a.incubationAt=null;f.animals.push({id:`chick-${now}-${f.animals.length}`,kind:'chick',pen:a.pen,housing:'barn',fedAt:null,wateredAt:null,pettedAt:null,collectedAt:now,productionVersion:1,bornAt:now});return {ok:true,message:'Um pintinho nasceu! Alimente e ofereça água.'};
  }
  if(c.type==='mature-chick'){
   if(a.kind!=='chick'||a.bornAt==null)return fail('Este animal não é um pintinho.');if(now-a.bornAt<300000||!cared(a))return fail('O pintinho precisa de cinco minutos, ração e água para crescer.');a.kind='chicken';a.collectedAt=now;a.productionVersion=1;return {ok:true,message:'Seu pintinho cresceu e virou uma galinha!'};
  }
  if(c.type==='rename-animal'){if(typeof c.name!=='string')return fail('Informe um nome válido.');const name=c.name.trim().replace(/\s+/g,' ');if(name.length<1||name.length>24||/[<>\u0000-\u001f\u007f]/.test(name))return fail('Use um nome de 1 a 24 caracteres, sem símbolos de controle.');a.name=name;return {ok:true,message:`Nome salvo: ${name}.`};}
  if(c.type==='water-animal'){if(a.wateredAt!==undefined&&a.wateredAt!==null&&now>=a.wateredAt&&now-a.wateredAt<86400000)return fail('Este animal já tem água por 24 horas.');a.wateredAt=now;return {ok:true,message:'Água fresca disponível por 24 horas!'};}
  if(c.type==='pet-animal'||c.type==='play-animal'){
   boostVital(a,c.type,now);a.pettedAt=now;if(c.type==='play-animal')a.playedAt=now;
   return {ok:true,message:''};
  }
  if(c.type==='feed-animal'){
   if(a.fedAt!==null&&now-a.fedAt<86400000)return fail('Este animal já está alimentado pelas próximas 24 horas.');
   if(f.feed<1)return fail('Compre ração na venda.');f.feed--;a.fedAt=now;a.collectedAt=now;return {ok:true,message:'Animal alimentado! Garanta também água para ativar sua função.'};
  }
  if(!animalReady(a,now))return fail('Alimente, ofereça água e aguarde a produção.');const item=ANIMALS[a.kind];if(!item.product)return fail('O cachorro protege a plantação.');f.products[item.product]++;a.collectedAt=now;a.productionVersion=1;return {ok:true,message:`+1 ${item.productName.toLowerCase()} no celeiro!`};
 }
 if(c.type==='buy-decor'){
  if(!Object.hasOwn(DECOR,c.kind))return fail('Decoração inválida.');const item=DECOR[c.kind as DecorationKind];
  const slot=DECOR_SLOTS.findIndex((_,i)=>!f.decorations.some(d=>d.slot===i));if(slot<0)return fail('Os 8 espaços de decoração estão ocupados.');if(f.coins<item.price)return fail('Moedas insuficientes.');
  f.coins-=item.price;f.decorations.push({id:`decor-${now}-${slot}`,kind:c.kind,slot});return {ok:true,message:`${item.name} colocada no jardim!`};
 }
 if(c.type==='move-decor'){
  const d=f.decorations.find(d=>d.id===c.id);if(!d||!Number.isInteger(c.slot)||c.slot<0||c.slot>=DECOR_SLOTS.length)return fail('Espaço inválido.');if(f.decorations.some(x=>x.id!==d.id&&x.slot===c.slot))return fail('Este espaço já está ocupado.');d.slot=c.slot;return {ok:true,message:'Decoração reposicionada!'};
 }
 return fail('Ação desconhecida.');
}
