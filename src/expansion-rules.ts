import {BUILDINGS,parcels,type BuildingKind,type LandBuilding,type LandSite} from './plots.js';
import type {Farm,Plot} from './farm.js';

export const EXPANSION_SITES={west:{x:170,y:430,name:'Campo do pomar'},north:{x:630,y:430,name:'Campo da clareira'},south:{x:1090,y:430,name:'Campo do sul'}} as const;
export const EXPANSION_COMMANDS=['travel-area','prepare-expansion','buy-building','place-building','move-building'] as const;
export const expansionId=(site:LandSite,col:number,row:number)=>1000+Object.keys(EXPANSION_SITES).indexOf(site)*60+row*10+col;
export function expansionCell(id:number){const n=id-1000,index=Math.floor(n/60),site=Object.keys(EXPANSION_SITES)[index] as LandSite;return Number.isInteger(id)&&n>=0&&index<3?{site,col:n%10,row:Math.floor(n%60/10)}:null;}
export function expansionPosition(id:number){const cell=expansionCell(id);if(!cell)return null;const p=EXPANSION_SITES[cell.site];return{x:p.x+cell.col*40,y:p.y+cell.row*40};}
export function expansionCells(f:Farm):Plot[]{return parcels(f).flatMap(p=>Array.from({length:60},(_,i)=>({id:expansionId(p.site,i%10,Math.floor(i/10)),tilled:false,crop:null,wateredAt:null} as Plot))).filter(p=>{const c=expansionCell(p.id)!;return c.col!==5&&c.row!==5;}).map(p=>f.expansionPlots?.find(v=>v.id===p.id)??p);}
export function buildingSite(b:LandBuilding){return b.area==='expansion'?EXPANSION_SITES[b.site]:null;}
export function buildingSize(b:Pick<LandBuilding,'kind'|'rotation'>){const s=BUILDINGS[b.kind];return b.rotation?{width:s.height,height:s.width}:s;}
export function expansionProblem(f:Farm,kind:BuildingKind,site:LandSite,col:number,row:number,rotation=0,except?:string){
 if(!Object.hasOwn(BUILDINGS,kind)||!Object.hasOwn(EXPANSION_SITES,site)||!parcels(f).some(p=>p.site===site))return 'Este campo precisa de um terreno adquirido.';
 if(!Number.isInteger(col)||!Number.isInteger(row)||![0,1].includes(rotation))return 'Escolha uma posição e orientação válidas.';
 const size=buildingSize({kind,rotation});if(col<0||row<0||col+size.width>10||row+size.height>5)return 'A construção deve ficar inteira no campo liberado.';
 const origin=EXPANSION_SITES[site];if(f.playerArea==='expansion'&&f.player.x>origin.x+col*40-32&&f.player.x<origin.x+(col+size.width)*40-8&&f.player.y>origin.y+row*40-25&&f.player.y<origin.y+(row+size.height)*40+1)return 'Afaste o personagem da área antes de construir.';
 for(let y=row;y<row+size.height;y++)for(let x=col;x<col+size.width;x++){
  if(x===5)return 'Mantenha o caminho central livre.';
  if(f.expansionPlots?.some(p=>p.id===expansionId(site,x,y)&&p.crop))return 'Colha as plantas antes de ocupar este espaço.';
  if(f.buildings?.some(b=>b.id!==except&&b.area==='expansion'&&b.site===site&&x>=b.col&&x<b.col+buildingSize(b).width&&y>=b.row&&y<b.row+buildingSize(b).height))return 'Já existe uma estrutura neste espaço.';
 }
 return null;
}
export function applyExpansion(f:Farm,c:any){const fail=(message:string)=>({ok:false,message});
 if(c.type==='travel-area'){
  if(!['farm','expansion'].includes(c.area)||c.area===(f.playerArea??'farm'))return fail('Destino inválido.');
  const gate=f.playerArea==='expansion'?{x:750,y:240}:{x:750,y:1040};if(Math.hypot(f.player.x-gate.x,f.player.y-gate.y)>85)return fail('Aproxime-se da passagem ao sul da fazenda.');
  f.playerArea=c.area;f.player=c.area==='expansion'?{x:750,y:300}:{x:750,y:985};return{ok:true,message:c.area==='expansion'?'Bem-vindo aos seus campos do sul!':'De volta à fazenda.'};
 }
 if(c.type==='prepare-expansion'){
  const point=expansionPosition(c.plot);if(f.playerArea!=='expansion'||!point||Math.hypot(f.player.x-point.x,f.player.y-point.y)>70)return fail('Aproxime-se da terra nos campos do sul.');const cell=expansionCell(c.plot);if(!cell||cell.col===5||cell.row===5||!parcels(f).some(p=>p.site===cell.site))return fail('Escolha terra livre de um campo comprado.');
  if(f.buildings?.some(b=>b.area==='expansion'&&b.site===cell.site&&cell.col>=b.col&&cell.col<b.col+buildingSize(b).width&&cell.row>=b.row&&cell.row<b.row+buildingSize(b).height))return fail('Este espaço pertence a uma construção.');
  f.expansionPlots??=[];if(!f.expansionPlots.some(p=>p.id===c.plot))f.expansionPlots.push({id:c.plot,tilled:true,crop:null,wateredAt:null});return{ok:true,message:'Terra preparada. Escolha suas sementes!'};
 }
 if(c.type==='buy-building'){
  if(!Object.hasOwn(BUILDINGS,c.kind)||!parcels(f).length)return fail('Compre um terreno antes de adquirir uma estrutura.');const kind=c.kind as BuildingKind,spec=BUILDINGS[kind];if(f.coins<spec.price)return fail('Moedas insuficientes.');
  if((f.buildingStock?.[kind]??0)>=20)return fail('Posicione as estruturas guardadas antes de comprar mais.');f.coins-=spec.price;f.buildingStock??={};f.buildingStock[kind]=(f.buildingStock[kind]??0)+1;return{ok:true,message:'Compra feita! Estrutura guardada na bolsa para posicionar.'};
 }
 const existing=c.type==='move-building'?f.buildings?.find(b=>b.id===c.id):undefined,kind=existing?.kind??c.kind;
 if(c.type==='move-building'&&!existing)return fail('Estrutura não encontrada.');if(c.type==='place-building'&&!(f.buildingStock?.[kind as BuildingKind]))return fail('Você não possui esta estrutura na bolsa.');
 const error=expansionProblem(f,kind,c.site,c.col,c.row,c.rotation??0,existing?.id);if(error)return fail(error);
 if(existing)Object.assign(existing,{area:'expansion',site:c.site,col:c.col,row:c.row,rotation:c.rotation??0});else{f.buildingStock![kind as BuildingKind]!--;f.buildings??=[];let i=1;while(f.buildings.some(b=>b.id===`expansion-${kind}-${i}`))i++;f.buildings.push({id:`expansion-${kind}-${i}`,kind,area:'expansion',site:c.site,col:c.col,row:c.row,rotation:c.rotation??0});}
 return{ok:true,message:existing?'Estrutura reposicionada. Animais e estado preservados.':'Estrutura instalada!'};
}
