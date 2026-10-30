import {settleCoinDebt} from './wallet.js';
import {safeRiverPosition} from './river-boundary.js';
import {restoreFishing,sellFish,type FishingState} from './fishing.js';
import {completeCare} from './care-migration.js';
import {grownMs,plantNeeds,settlePlant,PLANT_CARE} from './plant-care.js';
import {LEGACY_CLOCK_START,type Calendar,type HomeState} from './world-time.js';
import { plotUsable, type LandParcel, type LandBuilding } from './plots.js';
import { ANIMALS, DEFAULT_AVATAR, validAvatar, type Avatar, type Animal, type AnimalProduct, type Decoration } from './content.js';
export const CROPS = {
  carrot: { name: 'Cenoura', icon: '🥕', seconds: 900, seedPrice: 8, sellPrice: 12, yield: 3 },
  lettuce: { name: 'Alface', icon: '🥬', seconds: 1200, seedPrice: 12, sellPrice: 18, yield: 3 },
  tomato: { name: 'Tomate', icon: '🍅', seconds: 3600, seedPrice: 18, sellPrice: 26, yield: 3 },
  strawberry: { name: 'Morango', icon: '🍓', seconds: 2700, seedPrice: 15, sellPrice: 23, yield: 3 },
  corn: { name: 'Milho', icon: '🌽', seconds: 4500, seedPrice: 20, sellPrice: 32, yield: 3 },
  tulip: { name: 'Tulipa', icon: '🌷', seconds: 1800, seedPrice: 14, sellPrice: 22, yield: 3 },
  sunflower: { name: 'Girassol', icon: '🌻', seconds: 5400, seedPrice: 24, sellPrice: 40, yield: 3 },
} as const;
export type Crop = keyof typeof CROPS;
export type Tool = 'hand' | 'hoe' | 'seed' | 'water' | 'rod';
export type Plot = { fertilized?:boolean;growthDurationMs?:number;tilledAt?:number;position?:{x:number;y:number}; id: number; tilled: boolean; crop: Crop | null; wateredAt: number | null; pestAt?:number|null; stolen?:number;care?:{startedAt:number;lastWateredAt:number|null;growthMs:number;checkpointAt:number;illnessAt:number|null} };
export type Farm = { version: 1; fertilizers?:number;fertilizerDebt?:number; houseDesign?:import('./home-design.js').HouseDesign; coinDebt?:number;wardrobe?:import('./wardrobe.js').Wardrobe; progressionVersion?:1; customPlots?:Plot[]; fishing?:FishingState; careVersion?:1;careStartedAt?:number;supplies?:{medicine:number;plantMedicine:number;bedding:number}; calendar?:Calendar;home?:HomeState; profileComplete?:boolean; playerName?:string; landOwned?:boolean; landParcels?:LandParcel[]; buildings?:LandBuilding[]; coins: number; seeds: Record<Crop, number>; inventory: Record<Crop, number>; plots: Plot[]; harvests: number; questClaimed: boolean; player: { x: number; y: number }; avatar:Avatar; animals:Animal[]; products:Record<AnimalProduct,number>; feed:number; decorations:Decoration[]; socialRaids:boolean;animalRaids?:boolean; raidProtectionUntil:number; visitLog:{name:string;action:string;at:number}[] };
export const LEGACY_GROWTH={carrot:45,lettuce:90,tomato:150,strawberry:120,corn:180,tulip:100,sunflower:200};
export const soilTime=(f:Pick<Farm,'calendar'>,now:number)=>now+(f.calendar?.offsetMinutes??0)*1000;
export const SOIL_AGE_MS=3*1440000;
export const allPlots=(f:Pick<Farm,'plots'|'customPlots'>)=>[...f.plots,...(f.customPlots??[])];
export const getPlot=(f:Pick<Farm,'plots'|'customPlots'>,id:number)=>id<60?f.plots[id]:f.customPlots?.find(p=>p.id===id);
export function ageSoil(p:Plot,now:number){if(p.tilled&&!p.crop&&p.tilledAt!=null&&now-p.tilledAt>=SOIL_AGE_MS){p.tilled=false;delete p.tilledAt;}}
const crops = Object.keys(CROPS) as Crop[];
export const SAVE_KEY = 'wj-fazendinha-v1';
export const makeFarm = (now=Date.now()): Farm => ({ version: 1, calendar:{startedAt:now,offsetMinutes:0}, landParcels:[],buildings:[],coins: 250, seeds: Object.fromEntries(crops.map(c=>[c,8])) as Record<Crop,number>, inventory: Object.fromEntries(crops.map(c=>[c,0])) as Record<Crop,number>, plots: Array.from({ length: 24 }, (_, id) => ({ id, tilled: false, crop: null, wateredAt: null })), harvests: 0, questClaimed: false, player: { x: 710, y: 650 }, avatar:{...DEFAULT_AVATAR}, animals:[{id:'starter-hen',kind:'chicken',fedAt:null,collectedAt:0}], products:{egg:0,milk:0,goatMilk:0},feed:5,decorations:[],socialRaids:false,raidProtectionUntil:0,visitLog:[] });
export function enableFarmCare(f:Farm,now=Date.now()){f.careVersion??=1;f.careStartedAt??=now;for(const p of allPlots(f))if(p.tilled&&!p.crop)p.tilledAt??=soilTime(f,now);completeCare(f,CROPS);return f;}
export function hasPests(plot:Plot,now=Date.now()) {return !!plot.crop&&plot.pestAt!=null&&now>=plot.pestAt;}
export function remaining(plot: Plot, now = Date.now()) {
  if (!plot.crop || plot.wateredAt === null) return null;
  return Math.max(0, (plot.growthDurationMs??LEGACY_GROWTH[plot.crop]*1000) - (plot.care?grownMs(plot,now):Math.max(0, now - plot.wateredAt)));
}
export function act(farm: Farm, id: number, tool: Tool, crop: Crop, now = Date.now()): { ok: boolean; message: string; harvest?: boolean } {
  const plot = getPlot(farm,id);if(plot)ageSoil(plot,soilTime(farm,now));
  if (!plot || !plotUsable(farm,id)) return { ok: false, message: 'Este canteiro não existe.' };
  if (tool === 'hoe') {
    if (plot.crop) return { ok: false, message: 'Já tem uma plantação aqui. Vamos cuidar dela!' };
    if (plot.tilled) return { ok: true, message: 'Você cuidou da terra já preparada.' };
    plot.tilled = true;plot.tilledAt=soilTime(farm,now);
    return { ok: true, message: 'Terra fofinha. Hora de plantar uma semente!' };
  }
  if (tool === 'seed') {
    if (plot.crop) return { ok: false, message: 'Este canteiro já está ocupado.' };
    if (!plot.tilled) return { ok: false, message: 'Prepare a terra com a enxada primeiro.' };
    if (farm.seeds[crop] < 1) return { ok: false, message: 'Sementes acabaram. Visite a venda ao norte.' };
    farm.seeds[crop]--;
    delete plot.fertilized;plot.crop = crop;plot.growthDurationMs=CROPS[crop].seconds*1000;plot.stolen=0;plot.pestAt=null;if(farm.careVersion)plot.care={startedAt:now,lastWateredAt:null,growthMs:0,checkpointAt:now,illnessAt:null};else delete plot.care;
    return { ok: true, message: `${CROPS[crop].name} plantada! Agora use o regador.` };
  }
  if (tool === 'water') {
    if (!plot.crop) return { ok: true, message: 'Você regou o chão.' };
    if(plot.care){const needs=plantNeeds(plot,now);if(needs.water>80)return {ok:true,message:'A terra ainda está úmida.'};settlePlant(plot,now);plot.care.lastWateredAt=now;plot.care.checkpointAt=now;if(plot.wateredAt===null){plot.wateredAt=now;plot.pestAt=(plot.id+farm.harvests)%3===1?now+Math.max(30000,CROPS[plot.crop].seconds*650):null;}return {ok:true,message:needs.sick?'Terra hidratada. A planta ainda precisa de defensivo orgânico.':'Terra hidratada! O crescimento continua sem reiniciar.'};}
    if (plot.wateredAt !== null) return { ok: true, message: 'Você regou novamente. A planta continua crescendo.' };
    plot.wateredAt = now;
    plot.pestAt=(plot.id+farm.harvests)%3===1 ? now+Math.max(30000,CROPS[plot.crop].seconds*650) : null;
    return { ok: true, message: `Regadinha! Pronta em ${CROPS[plot.crop].seconds} segundos.` };
  }
  if (!plot.crop) return { ok: false, message: plot.tilled ? 'Terra pronta. Escolha Plantar.' : 'Escolha a enxada para preparar este canteiro.' };
  if (plot.wateredAt === null) return { ok: false, message: 'Sua plantinha está com sede. Use o regador.' };
  const needs=plantNeeds(plot,now);if(needs.dry)return {ok:false,message:'A planta murchou por falta de água. Use o regador.'};if(needs.sick)return {ok:false,message:'Planta doente. Regue e aplique defensivo em Cuidados da fazenda.'};
  if(hasPests(plot,now)){settlePlant(plot,now);plot.pestAt=plot.care?now+PLANT_CARE.pestReturnMs:null;return {ok:true,message:'Pragas removidas! Sua plantação está saudável de novo.'};}
  const wait = remaining(plot, now)!;
  if (wait > 0) return { ok: false, message: `Quase lá: faltam ${Math.ceil(wait / 1000)} segundos.` };
  const harvested = plot.crop;
  const amount=Math.max(1,CROPS[harvested].yield-(plot.stolen??0));
  farm.inventory[harvested] += amount;
  farm.harvests++;
  delete plot.fertilized;plot.crop = null;plot.tilled=false;delete plot.tilledAt;delete plot.growthDurationMs;
  plot.wateredAt = null;plot.pestAt=null;plot.stolen=0;delete plot.care;
  let reward = '';
  if (!farm.questClaimed) { farm.questClaimed = true; farm.coins += 75; reward = ' Missão cumprida: +75 moedas!'; }
  return { ok: true, harvest: true, message: `+${amount} ${CROPS[harvested].name.toLowerCase()} no celeiro!${reward}` };
}
export function buySeeds(farm: Farm, crop: Crop, amount = 5) {
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 100) return false;
  const price = CROPS[crop].seedPrice * amount;
  if (farm.coins < price) return false;
  farm.coins -= price; farm.seeds[crop] += amount; return true;
}
export function sellAll(farm: Farm) {
  let total = 0;
  for (const crop of crops) { total += farm.inventory[crop] * CROPS[crop].sellPrice; farm.inventory[crop] = 0; }
  for(const product of ['egg','milk','goatMilk'] as AnimalProduct[]){const price=Object.values(ANIMALS).find(a=>a.product===product)!.sellPrice;total+=(farm.products?.[product]??0)*price;if(farm.products)farm.products[product]=0;}
  total+=sellFish(farm);farm.coins += total; return total;
}
export function restoreFarm(raw: string | null): Farm {
  if (!raw) return makeFarm();
  try {
    const data = JSON.parse(raw) as Farm;
    const count = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= 1e9;
    if (data.version !== 1 || !count(data.coins) || !count(data.harvests) || typeof data.questClaimed !== 'boolean' || !data.player || !Number.isFinite(data.player.x) || !Number.isFinite(data.player.y)) return makeFarm();
    for(const c of crops){if(!['carrot','lettuce','tomato'].includes(c)){data.seeds[c]??=0;data.inventory[c]??=0;}}
    if (!crops.every(c => count(data.seeds?.[c]) && count(data.inventory?.[c]))) return makeFarm();
    if (!Array.isArray(data.plots) || ![24,36,48,60].includes(data.plots.length) || (data.plots.length>24 && data.landOwned!==true) || !data.plots.every((p, id) => p.id === id && typeof p.tilled === 'boolean' && (p.crop === null || crops.includes(p.crop)) && (p.wateredAt === null || (Number.isFinite(p.wateredAt) && p.wateredAt >= 0)) && (p.crop !== null || p.wateredAt === null) && (!p.crop || p.tilled))) return makeFarm();
    data.player.x = Math.max(100, Math.min(1480, data.player.x)); data.player.y = Math.max(180, Math.min(1040, data.player.y));
    if(data.customPlots!==undefined&&(!Array.isArray(data.customPlots)||data.customPlots.length>80||!data.customPlots.every((p,i)=>p.id===60+i&&p.position&&Number.isFinite(p.position.x)&&Number.isFinite(p.position.y)&&typeof p.tilled==='boolean'&&(p.crop===null||crops.includes(p.crop))&&(p.wateredAt===null||Number.isFinite(p.wateredAt))&&(!p.crop||p.tilled))))delete data.customPlots;
    upgradeFarm(data);return data;
  } catch { return makeFarm(); }
}

export function upgradeFarm<T extends Farm>(data:T):T {
 settleCoinDebt(data);if('unlockedPlots' in data)(data as T & {unlockedPlots:number}).unlockedPlots=Math.max(24,Number((data as any).unlockedPlots)||0);data.player=safeRiverPosition(data.player);restoreFishing(data);data.calendar??={startedAt:LEGACY_CLOCK_START,offsetMinutes:0};
 data.landParcels??=data.landOwned?[{site:'west',startId:24}]:[];data.buildings??=[];
 data.avatar=validAvatar(data.avatar)?data.avatar:{...DEFAULT_AVATAR};data.animals??=[{id:'starter-hen',kind:'chicken',fedAt:null,collectedAt:0}];data.products??={egg:0,milk:0,goatMilk:0};data.feed??=5;data.decorations??=[];data.socialRaids??=false;data.raidProtectionUntil??=0;data.visitLog??=[];for(const c of crops){data.seeds[c]??=0;data.inventory[c]??=0;}completeCare(data,CROPS);return data;
}
