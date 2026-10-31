import type{Farm}from'./farm';import type{StudioEntry}from'./studio-runtime';
export const MARKET_KINDS:Record<string,string[]>={animals:['animal'],seeds:['crop'],care:['item'],decor:['building','cosmetic','model'],land:['building'],fishing:['item'],cosmetics:['cosmetic','model'],created:['animal','crop','item','cosmetic','model','building']};
export function marketEntries(catalog:StudioEntry[],farm:Farm,tab:string){return catalog.filter(e=>MARKET_KINDS[tab]?.includes(e.definition.kind)&&e.definition.data.shopOnly!==true&&(tab!=='cosmetics'||!farm.studio?.owned.some(a=>a.id===e.id)));}
