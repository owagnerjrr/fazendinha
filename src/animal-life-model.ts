import type{AnimalKind}from'./content.js';
export type AnimalMess={id:string;kind:'poop'|'pee';room:'farm'|'barn'|'house'|'expansion';x:number;y:number;at:number};
export type AnimalLife={version:1;arrivedAt:number;bornAt?:number;adultAt:number;criticalMs:number;poopMs:number;peeMs:number;messes:AnimalMess[];lastExcretionAt?:number;deadAt?:number;riding?:boolean;customPregnancy?:{at:number;due:number;father:string;sex:'male'|'female'};births?:number;lastBirthAt?:number;pregnancy?:{at:number;due:number;father:string;kind:AnimalKind;sex:'male'|'female';breed?:DogBreed;color?:string}};
export const DOG_BREEDS={caramelo:{name:'Caramelo',extra:0},border:{name:'Border collie',extra:80},shepherd:{name:'Pastor-alemão',extra:100},husky:{name:'Husky',extra:120}} as const;export type DogBreed=keyof typeof DOG_BREEDS;
export const GROWTH_HOURS:Record<string,number>={chick:5/60,chicken:.5,rooster:.5,cat:2,dog:2,pig:4,goat:6,cow:6,bull:6,horse:8,donkey:8};export const DEATH_ACTIVE_MS=6*3600000;
export const alive=(a:{life?:AnimalLife})=>a.life?.deadAt==null;
export function newAnimalLife(kind:string,now:number,young:boolean):AnimalLife{return{version:1,arrivedAt:now,...(young?{bornAt:now}:{}),adultAt:young?now+(GROWTH_HOURS[kind]??4)*3600000:now,criticalMs:0,poopMs:0,peeMs:0,messes:[]};}
export function animalStage(a:{kind?:string;life?:AnimalLife},now:number){if(!a.life)return a.kind==='chick'?'Filhote':'Adulto';const start=a.life.bornAt;if(start==null||now>=a.life.adultAt)return'Adulto';return now-start<(a.life.adultAt-start)*.4?'Filhote':'Jovem';}
export const adult=(a:{kind?:string;life?:AnimalLife},now:number)=>alive(a)&&animalStage(a,now)==='Adulto';
export const animalScale=(a:{kind?:string;life?:AnimalLife},now:number)=>animalStage(a,now)==='Filhote'?.55:animalStage(a,now)==='Jovem'?.78:1;
export function animalPrice(base:number,stage:unknown,breed?:unknown){const extra=typeof breed==='string'&&Object.hasOwn(DOG_BREEDS,breed)?DOG_BREEDS[breed as DogBreed].extra:0;return Math.ceil((base+extra)*(stage==='young'?.6:1));}
export function reserveBirth(a:{incubationAt?:number|null;life?:AnimalLife}){return(a.incubationAt!=null?1:0)+(a.life?.pregnancy?1:0);}
export const sexOf=(a:{kind:string;sex?:'male'|'female'})=>a.kind==='bull'||a.kind==='rooster'?'male':a.kind==='cow'||a.kind==='chicken'?'female':a.sex;
