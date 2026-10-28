import {parcels} from './plots.js';
import { CROPS, restoreFarm, type Farm, type Plot } from './farm.js';
export const LAND_SAVE_KEY='wj-fazendinha-land-v1';
export function splitLocalFarm(farm:Farm){
 const core={...farm,plots:farm.plots.slice(0,24)};
 const land=farm.landOwned?JSON.stringify(farm.plots.slice(24)):null;
 if(farm.landOwned&&farm.plots.length!==24+parcels(farm).length*12)throw new Error('Dados do terreno incompletos.');
 return {core:JSON.stringify(core),land};
}
export function restoreLocalFarm(coreRaw:string|null,landRaw:string|null):Farm {
 const farm=restoreFarm(coreRaw);if(!farm.landOwned||farm.plots.length===24+parcels(farm).length*12)return farm;
 let plots:unknown;try{plots=JSON.parse(landRaw??'null');}catch{throw new Error('Não foi possível ler o terreno salvo.');}
 if(!Array.isArray(plots)||plots.length!==parcels(farm).length*12||!plots.every((p:Plot,i:number)=>p&&p.id===24+i&&typeof p.tilled==='boolean'&&(p.crop===null||Object.hasOwn(CROPS,p.crop))&&(p.wateredAt===null||(Number.isFinite(p.wateredAt)&&p.wateredAt>=0))&&(p.crop!==null||p.wateredAt===null)&&(!p.crop||p.tilled)))throw new Error('Os dados do terreno não estão disponíveis.');
 farm.plots.push(...plots);return farm;
}
