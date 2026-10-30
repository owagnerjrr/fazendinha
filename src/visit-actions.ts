import {CROPS,remaining,hasPests,type Farm,type Plot,type Crop} from './farm.js';
import {plantNeeds} from './plant-care.js';
export type VisitAction={type:'help'|'steal';mode:string;label:string;enabled:boolean;reason:string};
export function visitActions(p:Plot,crop:Crop,own:Pick<Farm,'seeds'|'socialRaids'>,host:{socialRaids:boolean;protected:boolean},now:number):VisitAction[]{
 const needs=plantNeeds(p,now),ready=!!p.crop&&remaining(p,now)===0;
 const water=!!p.crop&&(p.wateredAt===null||needs.water<100);
 return[
  {type:'help',mode:'hoe',label:'Carpir',enabled:!p.crop&&!p.tilled,reason:p.crop?'Este canteiro já tem uma planta.':'A terra já está preparada.'},
  {type:'help',mode:'plant',label:`Plantar ${CROPS[crop].name}`,enabled:!p.crop&&own.seeds[crop]>0,reason:p.crop?'Este canteiro está ocupado.':'Você precisa de uma semente sua.'},
  {type:'help',mode:'water',label:'Regar',enabled:water,reason:!p.crop?'Plante uma semente primeiro.':'A terra já está totalmente regada.'},
  {type:'help',mode:'clean',label:'Retirar pragas',enabled:hasPests(p,now),reason:'Não há pragas neste canteiro.'},
  {type:'steal',mode:'',label:'Pegar 1 produto',enabled:ready&&own.socialRaids&&host.socialRaids&&!host.protected&&!p.stolen&&!needs.sick&&!needs.dry&&!hasPests(p,now),reason:!own.socialRaids||!host.socialRaids?'Os dois amigos precisam ativar o roubo em Minha fazenda.':host.protected?'Esta fazenda está protegida.':p.stolen?'Esta colheita já foi beliscada.':!ready?'Espere a plantação amadurecer.':'A plantação precisa de cuidados.'},
 ];
}
