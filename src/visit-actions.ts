import{raidProtectionMessage,type RaidProtection}from'./raid-protection.js';
import {CROPS,remaining,hasPests,type Farm,type Plot,type Crop} from './farm.js';
import {plantNeeds} from './plant-care.js';
export type VisitAction={type:'help'|'steal';mode:string;label:string;enabled:boolean;reason:string};
export function visitActions(p:Plot,crop:Crop,own:Pick<Farm,'seeds'|'socialRaids'>,host:{socialRaids:boolean}&RaidProtection,now:number):VisitAction[]{
 const needs=plantNeeds(p,now),ready=!!p.crop&&remaining(p,now)===0;
 const water=!!p.crop&&(p.wateredAt===null||needs.water<100);
 return[
  {type:'help',mode:'hoe',label:'Carpir',enabled:!p.crop&&!p.tilled,reason:p.crop?'Este canteiro já tem uma planta.':'A terra já está preparada.'},
  {type:'help',mode:'plant',label:`Plantar ${CROPS[crop].name}`,enabled:!p.crop&&own.seeds[crop]>0,reason:p.crop?'Este canteiro está ocupado.':'Você precisa de uma semente sua.'},
  {type:'help',mode:'water',label:'Regar',enabled:water,reason:!p.crop?'Plante uma semente primeiro.':'A terra já está totalmente regada.'},
  {type:'help',mode:'clean',label:'Retirar pragas',enabled:hasPests(p,now),reason:'Não há pragas neste canteiro.'},
  {type:'steal',mode:'',label:'Pegar 1 produto',enabled:ready&&own.socialRaids&&host.socialRaids&&!host.protected&&!p.stolen&&!needs.sick&&!needs.dry&&!hasPests(p,now),reason:!own.socialRaids||!host.socialRaids?'Os dois amigos precisam ativar o roubo em Minha fazenda.':host.protected?raidProtectionMessage(host,now):p.stolen?'Esta colheita já foi beliscada.':!ready?'Espere a plantação amadurecer.':'A plantação precisa de cuidados.'},
 ];
}

/** Direct tool interaction uses the same permissions as the former action menu. */
export function visitToolAction(p:Plot,crop:Crop,own:Pick<Farm,'seeds'|'socialRaids'>,host:{socialRaids:boolean}&RaidProtection,now:number,tool:import('./farm.js').Tool):VisitAction|undefined{
 // Spray stock and suitability are checked on a clone before the animation and on the server.
 if(tool==='medicine'||tool==='fertilizer')return{type:'help',mode:tool,label:tool==='medicine'?'Aplicar defensivo':'Aplicar fertilizante',enabled:!!p.crop,reason:'Plante uma cultura primeiro.'};
 const mode=tool==='hoe'?'hoe':tool==='seed'?'plant':tool==='water'?'water':tool==='hand'?(hasPests(p,now)?'clean':''):undefined;
 return mode===undefined?undefined:visitActions(p,crop,own,host,now).find(a=>a.mode===mode);
}
