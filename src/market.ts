import { CROPS, type Crop, type Farm } from './farm.js';
import { ANIMALS, type AnimalProduct } from './content.js';

export type MarketItem = Crop | AnimalProduct;
export type MarketCategory = 'crop' | 'animal';
type ItemInfo = { name:string; icon:string; basePrice:number; category:MarketCategory };
export const MARKET_ITEMS:Record<MarketItem,ItemInfo> = {
  ...Object.fromEntries(Object.entries(CROPS).map(([id,c])=>[id,{name:c.name,icon:c.icon,basePrice:c.sellPrice,category:'crop'}])) as Record<Crop,ItemInfo>,
  egg:{name:'Ovo',icon:'🥚',basePrice:ANIMALS.chicken.sellPrice,category:'animal'},
  milk:{name:'Leite de vaca',icon:'🥛',basePrice:ANIMALS.cow.sellPrice,category:'animal'},
  goatMilk:{name:'Leite de cabra',icon:'🥛',basePrice:ANIMALS.goat.sellPrice,category:'animal'},
};
export const MARKET_IDS = Object.keys(MARKET_ITEMS) as MarketItem[];
export type MarketLot = { crop:MarketItem; quantity:number; price:number };
export function isMarketItem(item:unknown):item is MarketItem {return typeof item==='string'&&Object.hasOwn(MARKET_ITEMS,item);}
export function validLot(lot:unknown):lot is MarketLot {
  const l=lot as MarketLot;
  return !!l&&isMarketItem(l.crop)&&Number.isSafeInteger(l.quantity)&&l.quantity>=1&&l.quantity<=99&&Number.isSafeInteger(l.price)&&l.price>=1&&l.price<=9999;
}
export function marketStock(farm:Farm,item:MarketItem):number {
  return MARKET_ITEMS[item].category==='crop'?farm.inventory[item as Crop]:farm.products[item as AnimalProduct];
}
function changeStock(farm:Farm,item:MarketItem,delta:number) {
  if(MARKET_ITEMS[item].category==='crop')farm.inventory[item as Crop]+=delta;
  else farm.products[item as AnimalProduct]+=delta;
}
// Products leave the barn when listed. Only the server can return or transfer this reserve.
export function reserveLot(farm:Farm,lot:unknown) {
  if(!validLot(lot))return {ok:false,message:'Oferta inválida.'};
  if(marketStock(farm,lot.crop)<lot.quantity)return {ok:false,message:'Você não tem esta quantidade no celeiro.'};
  changeStock(farm,lot.crop,-lot.quantity);return {ok:true,message:'Produtos reservados.'};
}
export function returnLot(farm:Farm,lot:unknown) {
  if(!validLot(lot))return {ok:false,message:'Oferta inválida.'};
  changeStock(farm,lot.crop,lot.quantity);return {ok:true,message:'Produtos devolvidos ao celeiro.'};
}
export function transferLot(buyer:Farm,seller:Farm,lot:unknown) {
  if(!validLot(lot))return {ok:false,message:'Oferta inválida.'};
  if(buyer===seller)return {ok:false,message:'Você não pode comprar sua própria oferta.'};
  if(buyer.coins<lot.price)return {ok:false,message:'Moedas insuficientes.'};
  buyer.coins-=lot.price;seller.coins+=lot.price;changeStock(buyer,lot.crop,lot.quantity);
  return {ok:true,message:'Compra feita! Os produtos estão no seu celeiro.'};
}
