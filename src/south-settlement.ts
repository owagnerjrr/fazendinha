import type {Farm} from './farm.js';
import{BUILDINGS,parcels,type BuildingKind}from'./plots.js';
import{expansionProblem}from'./expansion-rules.js';

/** Additive, deterministic relocation: never recreates an existing building/animal. */
export function settleSouth(f:Farm,force=false){
 if(f.southSettled&&!force)return 0;
 let moved=0;
 const slot=(kind:BuildingKind,id?:string)=>{for(const p of parcels(f))for(const rotation of[0,1])for(let row=0;row<5;row++)for(let col=0;col<10;col++)if(!expansionProblem(f,kind,p.site,col,row,rotation,id))return{site:p.site,col,row,rotation,area:'expansion' as const};return null;};
 for(const b of f.buildings??[]){if(b.area==='expansion')continue;const at=slot(b.kind,b.id);if(at){Object.assign(b,at);moved++;}}
 for(const kind of Object.keys(BUILDINGS) as BuildingKind[]){let quantity=f.buildingStock?.[kind]??0;while(quantity>0){const at=slot(kind);if(!at)break;f.buildings??=[];let i=1;while(f.buildings.some(b=>b.id===`settled-${kind}-${i}`))i++;f.buildings.push({id:`settled-${kind}-${i}`,kind,...at});f.buildingStock![kind]=--quantity;moved++;}}
 f.southSettled=1;return moved;
}
