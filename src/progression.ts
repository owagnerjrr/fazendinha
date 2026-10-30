import type {Farm,Crop} from './farm.js';
export const levelOf=(xp:number)=>1+Math.floor(Math.sqrt(Math.max(0,Number.isFinite(xp)?xp:0)/20));
export const CROP_LEVEL:Record<Crop,number>={carrot:1,lettuce:2,strawberry:3,tulip:3,tomato:4,corn:5,sunflower:6};
export const UNLOCKS=[
 {level:1,label:'24 canteiros · cenoura · ferramentas básicas'},
 {level:2,label:'Alface'},
 {level:3,label:'Morango e tulipa · galinhas e pintinhos'},
 {level:4,label:'Tomate · pesca · galo · cachorro'},
 {level:5,label:'Milho · vaca e cabra · decoração'},
 {level:6,label:'Girassol · terrenos · construções · cultivo nas clareiras'},
] as const;
export function requiredLevel(c:any):number {
 if(c?.type==='work'&&Number.isInteger(c.plot)&&c.plot>=0&&c.plot<24)return 1;
 if(c?.type==='buy'||c?.type==='work'&&c.tool==='seed'||c?.type==='help'&&c.mode==='plant')return Object.hasOwn(CROP_LEVEL,c.crop)?CROP_LEVEL[c.crop as Crop]:1;
 if(c?.type==='buy-animal')return ({chicken:3,chick:3,rooster:4,dog:4,cow:5,goat:5} as Record<string,number>)[c.kind]??1;
 if(['buy-rod','cast-line'].includes(c?.type))return 4;
 if(c?.type==='buy-decor')return 5;
 if(['buy-land','build-land','till-ground'].includes(c?.type))return 6;
 return 1;
}
/** Legacy farms retain their belongings and access; no retroactive reset. */
export function progressionProblem(f:Farm&{xp?:number},c:unknown){const level=requiredLevel(c);return f.progressionVersion===1&&levelOf(f.xp??0)<level?`Disponível no nível ${level}.`:null;}
