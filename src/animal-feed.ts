import type{Farm}from'./farm.js';
import type{Definition}from'./studio-schema.js';
import{rabbitDefinition}from'./rabbit-content.js';
export const FEEDS={dog:'cachorros',cat:'gatos',cow:'vacas',bull:'touros',goat:'cabras',pig:'porcos',horse:'cavalos',donkey:'burros',chicken:'galinhas',rooster:'galos',chick:'pintinhos',rabbit:'coelhos',created:'outras espécies'} as const;
export type FeedKind=keyof typeof FEEDS;
export const feedKind=(animal:{kind?:string},definition?:Definition):FeedKind=>definition?(rabbitDefinition(definition)?'rabbit':'created'):Object.hasOwn(FEEDS,animal.kind??'')?animal.kind as FeedKind:'created';
export const feedName=(kind:FeedKind)=>'Ração para '+FEEDS[kind];
export function availableFeed(f:Pick<Farm,'feed'|'feeds'>,kind:FeedKind){return(f.feeds?.[kind]??0)+f.feed;}
/** Existing universal portions remain valid. Specific stock is consumed first. */
export function consumeFeed(f:Pick<Farm,'feed'|'feeds'>,kind:FeedKind){if((f.feeds?.[kind]??0)>0){f.feeds![kind]=(f.feeds![kind]??0)-1;return true;}if(f.feed>0){f.feed--;return true;}return false;}
export function buyFeed(f:Farm,c:{kind?:unknown;quantity?:unknown}){const quantity=c.quantity??1;if(!Number.isSafeInteger(quantity)||Number(quantity)<1||Number(quantity)>20)return{ok:false,message:'Escolha de 1 a 20 pacotes.'};if(c.kind!==undefined&&(typeof c.kind!=='string'||!Object.hasOwn(FEEDS,c.kind)))return{ok:false,message:'Escolha uma ração válida.'};const n=Number(quantity),price=n*10;if(f.coins<price)return{ok:false,message:'Moedas insuficientes.'};f.coins-=price;if(c.kind===undefined)f.feed+=n*5;else{f.feeds??={};const kind=c.kind as FeedKind;f.feeds[kind]=(f.feeds[kind]??0)+n*5;}return{ok:true,message:`${c.kind===undefined?'Ração universal':feedName(c.kind as FeedKind)}: +${n*5} porções.`};}
