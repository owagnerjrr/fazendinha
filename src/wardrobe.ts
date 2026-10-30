import {OUTFITS,type OutfitId} from './store-catalog.js';import type {Avatar} from './content.js';import type {Farm} from './farm.js';import {settleCoinDebt} from './wallet.js';
export type Wardrobe={owned:OutfitId[];equipped:OutfitId|null};
export function wardrobeOf(f:Pick<Farm,'wardrobe'>):Wardrobe{const owned=[...new Set((f.wardrobe?.owned??[]).filter(id=>Object.hasOwn(OUTFITS,id)))];return{owned,equipped:owned.includes(f.wardrobe?.equipped as OutfitId)?f.wardrobe!.equipped:null};}
export function appearanceOf(f:Pick<Farm,'avatar'|'wardrobe'>):Avatar{return{style:f.avatar.style,skin:f.avatar.skin,hair:f.avatar.hair,shirt:f.avatar.shirt,outfit:wardrobeOf(f).equipped??undefined};}
export function applyWardrobe(f:Farm,c:any){const fail=(message:string)=>({ok:false,message});const w=wardrobeOf(f);
 if(c.type==='equip-outfit'){if(c.outfit!==null&&(!Object.hasOwn(OUTFITS,c.outfit)||!w.owned.includes(c.outfit)))return fail('Adquira essa roupa antes de equipar.');f.wardrobe={...w,equipped:c.outfit};return{ok:true,message:c.outfit?'Roupa equipada!':'Roupa original equipada.'};}
 if(!Object.hasOwn(OUTFITS,c.outfit))return fail('Escolha uma roupa válida.');const id=c.outfit as OutfitId;
 if(w.owned.includes(id))return{ok:true,message:'Você já adquiriu esta roupa.'};settleCoinDebt(f);if(f.coins<OUTFITS[id].price)return fail('Moedas insuficientes.');f.coins-=OUTFITS[id].price;f.wardrobe={owned:[...w.owned,id],equipped:w.equipped};return{ok:true,message:'Roupa adquirida! Ela já está no seu guarda-roupa.'};
}
