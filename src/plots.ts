import{expansionCell,expansionPosition,buildingSize}from'./expansion-rules.js';
import type { Farm } from './farm.js';
export const ORIGINAL_PLOTS=24;
export const EXTRA_PLOTS=12;
export const LAND_PRICE=750;
export const LAND_SITES={
 west:{name:'Pomar ao lado da casa',description:'Perto da casa e do caminho.',x:230,y:550},
 north:{name:'Clareira do norte',description:'Acima da horta, perto da venda.',x:650,y:285},
 south:{name:'Campinho do sul',description:'Ao sul do celeiro, junto ao caminho.',x:875,y:930},
} as const;
export type LandSite=keyof typeof LAND_SITES;
export type LandParcel={site:LandSite;startId:number};
export const BUILDINGS={shed:{name:'Abrigo de ferramentas',price:250,width:2,height:2,description:'Um abrigo para acessar seus equipamentos.'},gazebo:{name:'Coreto de jardim',price:180,width:2,height:2,description:'Um cantinho com banco para decorar a fazenda.'},coop:{name:'Galinheiro externo',price:220,width:3,height:3,description:'Cercado com abrigo e ninhos. Até 6 aves, incluindo ovos em incubação.'},pasture:{name:'Piquete cercado',price:300,width:4,height:3,description:'Pasto com bebedouro e comedouro. Até 2 vacas ou cabras.'}} as const;
export type BuildingKind=keyof typeof BUILDINGS;
export type LandBuilding={area?:'farm'|'expansion';rotation?:number;id:string;kind:BuildingKind;site:LandSite;col:number;row:number};
type LandFarm=Pick<Farm,'landOwned'|'landParcels'|'buildings'|'customPlots'|'expansionPlots'>;
export function parcels(f:LandFarm):LandParcel[]{return f.landParcels??(f.landOwned?[{site:'west',startId:24}]:[]);}
export function plotPosition(id:number,farm?:LandFarm){
 if(!Number.isInteger(id)||id<0)return null;
 if(id>=1000)return expansionPosition(id);
 if(id>=60)return farm?.customPlots?.find(p=>p.id===id)?.position??null;
 if(id<ORIGINAL_PLOTS)return {x:634+(id%6)*40,y:434+Math.floor(id/6)*40};
 const parcel=farm?parcels(farm).find(p=>id>=p.startId&&id<p.startId+12):id<36?{site:'west' as const,startId:24}:null;
 if(!parcel)return null;const site=LAND_SITES[parcel.site],n=id-parcel.startId;
 return {x:site.x+(n%4)*40,y:site.y+Math.floor(n/4)*40};
}
export function buildingCovers(b:LandBuilding,col:number,row:number){const spec=buildingSize(b);return col>=b.col&&col<b.col+spec.width&&row>=b.row&&row<b.row+spec.height;}
export function plotUsable(f:Farm,id:number){
 if(!Number.isInteger(id)||id<0)return false;if(id>=1000){const c=expansionCell(id);return !!c&&!!f.expansionPlots?.some(p=>p.id===id)&&parcels(f).some(p=>p.site===c.site)&&!(f.buildings??[]).some(b=>b.area==='expansion'&&b.site===c.site&&buildingCovers(b,c.col,c.row));}if(id>=60)return !!f.customPlots?.find(p=>p.id===id);if(!f.plots[id])return false;if(id<24)return true;
 const p=parcels(f).find(p=>id>=p.startId&&id<p.startId+12);if(!p)return false;const n=id-p.startId;
 return !(f.buildings??[]).some(b=>b.area!=='expansion'&&b.site===p.site&&buildingCovers(b,n%4,Math.floor(n/4)));
}
export function buildProblem(f:Farm,kind:BuildingKind,site:LandSite,col:number,row:number):string|null{
 const p=parcels(f).find(p=>p.site===site),spec=BUILDINGS[kind];
 if(!p||!spec||!Number.isInteger(col)||!Number.isInteger(row)||col<0||row<0||col+spec.width>4||row+spec.height>3)return 'Escolha uma posição dentro de um terreno comprado.';
 for(let y=row;y<row+spec.height;y++)for(let x=col;x<col+spec.width;x++){
  if((f.buildings??[]).some(b=>b.area!=='expansion'&&b.site===site&&buildingCovers(b,x,y)))return 'Já existe uma construção neste espaço.';
  if(f.plots[p.startId+y*4+x]?.crop)return 'Colha as plantas deste espaço antes de construir.';
 }
 if((f.buildings??[]).some(b=>b.area!=='expansion'&&b.site===site))return 'Este terreno já tem uma construção. Os outros espaços ficam livres para plantar.';
 return null;
}
export function reservedLandPoint(x:number,y:number){return Object.values(LAND_SITES).some(s=>x>s.x-55&&x<s.x+175&&y>s.y-60&&y<s.y+120);}
