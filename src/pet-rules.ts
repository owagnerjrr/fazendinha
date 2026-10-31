import type{Animal}from'./content.js';
export const PET_MODES={barn:'Ficar no celeiro',house:'Ficar em casa',farm:'Ficar na fazenda',follow:'Acompanhar você'} as const;
export type PetMode=keyof typeof PET_MODES;export type PetRoom='farm'|'house'|'barn'|'visit';
export const isPet=(a:Pick<Animal,'kind'>)=>a.kind==='cat'||a.kind==='dog';
export const petMode=(a:Animal):PetMode=>a.petMode??(a.kind==='dog'?'follow':'barn');
export const petInRoom=(a:Animal,room:PetRoom)=>isPet(a)&&(petMode(a)==='follow'||petMode(a)===room);
export function setPetMode(animals:Animal[],id:unknown,mode:unknown){const a=animals.find(a=>a.id===id);if(!a||!isPet(a))return{ok:false,message:'Escolha um gato ou cachorro seu.'};if(typeof mode!=='string'||!Object.hasOwn(PET_MODES,mode))return{ok:false,message:'Escolha onde o animal deve ficar.'};a.petMode=mode as PetMode;return{ok:true,message:PET_MODES[a.petMode]};}
