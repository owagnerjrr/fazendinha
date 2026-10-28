import {BUILDINGS,LAND_SITES,type LandBuilding} from './plots.js';import type {Farm} from './farm.js';import type {Animal,AnimalKind} from './content.js';
export function habitatCapacity(b:LandBuilding){return b.kind==='coop'?6:b.kind==='pasture'?2:0;}
export function habitatAccepts(kind:AnimalKind,b:LandBuilding){return b.kind==='coop'?['chicken','rooster','chick'].includes(kind):b.kind==='pasture'?['cow','goat'].includes(kind):false;}
export function housingCount(f:Farm,house='barn',except?:string){return f.animals.filter(a=>(a.housing??'barn')===house&&a.id!==except).reduce((n,a)=>n+1+(a.incubationAt!=null?1:0),0);}
export function housingProblem(f:Farm,kind:AnimalKind,house:unknown,except?:string,slots=1){
 if(typeof house!=='string')return 'Escolha uma instalação válida.';
 const b=f.buildings?.find(b=>b.id===house),cap=house==='barn'?12:b?habitatCapacity(b):0;
 if(!cap||house!=='barn'&&(!b||!habitatAccepts(kind,b)))return 'Esta instalação não é adequada para este animal.';
 return housingCount(f,house,except)+slots>cap?'A instalação está cheia, contando os ovos em incubação.':null;
}
export function housingName(f:Farm,a:Animal){const b=f.buildings?.find(b=>b.id===a.housing);return b?`${BUILDINGS[b.kind].name} · ${LAND_SITES[b.site].name}`:'Celeiro';}
export function outdoorBox(b:LandBuilding){const s=LAND_SITES[b.site],spec=BUILDINGS[b.kind];return{x:s.x+b.col*40-18,y:s.y+b.row*40-18,width:spec.width*40-4,height:spec.height*40-4};}
