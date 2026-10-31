import type{Animal}from'./content.js';import type{Farm}from'./farm.js';
export type PetSummon={until:number;room:'farm'|'house'|'barn';area:'farm'|'expansion'};
export function summoned(a:Animal,now=Date.now()){return !!a.summon&&a.summon.until>now;}
export function callPets(f:Farm,c:any,now:number){
 if(!['cat','dog'].includes(c.kind)||!['farm','house','barn'].includes(c.room)||!['farm','expansion'].includes(c.area)||c.area==='expansion'&&c.room==='house')return{ok:false,message:'Escolha um chamado e um ambiente válidos.'};
 if(c.area!==(f.playerArea??'farm'))return{ok:false,message:'Chame os animais no ambiente em que você está.'};const animals=f.animals.filter(a=>a.kind===c.kind);if(!animals.length)return{ok:false,message:c.kind==='dog'?'Você ainda não tem cachorro.':'Você ainda não tem gato.'};
 if(animals.some(a=>a.summon&&a.summon.until>now+55000))return{ok:false,message:'Aguarde o animal responder ao chamado.'};
 for(const a of animals){delete a.guestWalk;a.summon={until:now+60000,room:c.room,area:c.area};}
 return{ok:true,message:c.kind==='dog'?'Você assoviou. Seus cachorros estão vindo!':'Ps ps ps ps… Seus gatos estão vindo!'};
}
