import {ANIMAL_CARE,animalNeeds,productionAt} from './animal-needs.js';
export const SKIN_TONES=['#f3c99a','#dca06b','#bb794b','#925431','#683b29','#452a24'] as const;
export const HAIR_COLORS=['#241c1b','#503426','#88502e','#c28b46','#6b5278'] as const;
export const SHIRT_COLORS=['#4d8461','#476e9b','#a55257','#b58b40','#70568a','#dfc8a1'] as const;
export type Avatar={style:'classic'|'crop'|'puffs'|'short'|'braids';skin:number;hair:number;shirt:number};
export const DEFAULT_AVATAR:Avatar={style:'classic',skin:0,hair:1,shirt:0};
export const AVATAR_STYLES={classic:'Original com chapéu',crop:'Crespo curto',puffs:'Afro com dois coques',short:'Liso curto',braids:'Tranças'} as const;
export const ANIMALS={
 rooster:{name:'Galo',icon:'🐓',price:130,product:null,productName:'Reprodução',sellPrice:0,seconds:0},
 chick:{name:'Pintinho',icon:'🐤',price:45,product:null,productName:'Crescimento',sellPrice:0,seconds:0},
 chicken:{name:'Galinha',icon:'🐔',price:90,product:'egg',productName:'Ovo',sellPrice:12,seconds:90},
 cow:{name:'Vaca',icon:'🐄',price:350,product:'milk',productName:'Leite',sellPrice:35,seconds:180},
 goat:{name:'Bode / cabra',icon:'🐐',price:230,product:'goatMilk',productName:'Leite de cabra',sellPrice:26,seconds:150},
 dog:{name:'Cachorro',icon:'🐕',price:180,product:null,productName:'Proteção',sellPrice:0,seconds:0}
} as const;
export type AnimalKind=keyof typeof ANIMALS;
export type AnimalProduct='egg'|'milk'|'goatMilk';
export type Animal={id:string;kind:AnimalKind;fedAt:number|null;collectedAt:number;name?:string;wateredAt?:number|null;pettedAt?:number|null;playedAt?:number|null;bornAt?:number;incubationAt?:number|null;housing?:string;sex?:'female'|'male';pendingAt?:number|null;care?:{startedAt:number;cleanedAt:number;illnessAt:number|null;recoveredAt?:number}};
export const DECOR={
 cocoaTree:{name:'Árvore do Cacau Encantado',price:120,texture:'cocoaTree',description:'Cacau, flores rosadas e uma história só nossa.'},
 flowerPlanter:{name:'Jardineira florida',price:45,texture:'flowerPlanter',description:'Flores para dar cor aos caminhos.'},
 sunflowerPot:{name:'Canteiro de girassóis',price:65,texture:'sunflower',description:'Um pedacinho de sol no jardim.'}
} as const;
export type DecorationKind=keyof typeof DECOR;
export type Decoration={id:string;kind:DecorationKind;slot:number};
export const DECOR_SLOTS=[{x:562,y:405},{x:925,y:590},{x:920,y:710},{x:388,y:550},{x:1170,y:865},{x:585,y:925},{x:970,y:480},{x:405,y:970}];
export function validAvatar(a:unknown):a is Avatar {const v=a as Avatar;return !!v&&Object.hasOwn(AVATAR_STYLES,v.style)&&Number.isInteger(v.skin)&&v.skin>=0&&v.skin<SKIN_TONES.length&&Number.isInteger(v.hair)&&v.hair>=0&&v.hair<HAIR_COLORS.length&&Number.isInteger(v.shirt)&&v.shirt>=0&&v.shirt<SHIRT_COLORS.length;}
export function animalHydrated(a:Animal,now:number){const at=a.wateredAt===undefined?a.fedAt:a.wateredAt;return at!==null&&now>=at&&now-at<(a.care?ANIMAL_CARE.waterMs:86400000);}
export function dogProtects(animals:Animal[],now:number){return animals.some(a=>a.kind==='dog'&&a.fedAt!==null&&now>=a.fedAt&&now-a.fedAt<(a.care?ANIMAL_CARE.foodMs:86400000)&&animalHydrated(a,now)&&!animalNeeds(a,now).sick);}
export function animalReady(a:Animal,now:number){const c=ANIMALS[a.kind];if(a.care)return !!c.product&&productionAt(a,now,c.seconds)!==null;return !!c.product&&a.fedAt!==null&&now>=a.fedAt&&now-a.fedAt<(a.care?ANIMAL_CARE.foodMs:86400000)&&animalHydrated(a,now)&&now-Math.max(a.collectedAt,a.fedAt)>=c.seconds*1000;}
