import { ANIMALS, DECOR, DECOR_SLOTS, animalReady, validAvatar, type AnimalKind, type DecorationKind } from './content.js';
import type { Farm } from './farm.js';
export const LIFE_COMMANDS=['avatar','buy-animal','buy-feed','feed-animal','water-animal','pet-animal','rename-animal','collect-animal','buy-decor','move-decor','raids-setting'] as const;
export function applyLife(f:Farm,c:any,now:number):{ok:boolean;message:string} {
 const fail=(message:string)=>({ok:false,message});
 if(c.type==='avatar'){if(!validAvatar(c.avatar))return fail('Escolha um avatar válido.');f.avatar={...c.avatar};return {ok:true,message:'Seu avatar foi atualizado!'};}
 if(c.type==='raids-setting'){if(typeof c.enabled!=='boolean')return fail('Opção inválida.');f.socialRaids=c.enabled;return {ok:true,message:c.enabled?'Brincadeira de roubo ativada com amigos participantes.':'Sua fazenda está fora da brincadeira de roubo.'};}
 if(c.type==='buy-animal'){
  if(!Object.hasOwn(ANIMALS,c.kind))return fail('Animal inválido.');const kind=c.kind as AnimalKind,item=ANIMALS[kind];
  if(f.animals.length>=12)return fail('Seu celeiro comporta 12 animais.');if(f.coins<item.price)return fail('Moedas insuficientes.');
  f.coins-=item.price;f.animals.push({id:`animal-${now}-${f.animals.length}`,kind,fedAt:null,wateredAt:null,pettedAt:null,collectedAt:now});return {ok:true,message:`${item.name} chegou ao seu celeiro. Alimente e ofereça água!`};
 }
 if(c.type==='buy-feed'){if(f.coins<10)return fail('Você precisa de 10 moedas.');f.coins-=10;f.feed+=5;return {ok:true,message:'+5 porções de ração.'};}
 if(['feed-animal','water-animal','pet-animal','rename-animal','collect-animal'].includes(c.type)){
  const a=f.animals.find(a=>a.id===c.id);if(!a)return fail('Animal não encontrado.');
  if(c.type==='rename-animal'){if(typeof c.name!=='string')return fail('Informe um nome válido.');const name=c.name.trim().replace(/\s+/g,' ');if(name.length<1||name.length>24||/[<>\u0000-\u001f\u007f]/.test(name))return fail('Use um nome de 1 a 24 caracteres, sem símbolos de controle.');a.name=name;return {ok:true,message:`Nome salvo: ${name}.`};}
  if(c.type==='water-animal'){if(a.wateredAt!==undefined&&a.wateredAt!==null&&now>=a.wateredAt&&now-a.wateredAt<86400000)return fail('Este animal já tem água por 24 horas.');a.wateredAt=now;return {ok:true,message:'Água fresca disponível por 24 horas!'};}
  if(c.type==='pet-animal'){a.pettedAt=now;return {ok:true,message:'Você fez carinho no animal!'};}
  if(c.type==='feed-animal'){
   if(a.fedAt!==null&&now-a.fedAt<86400000)return fail('Este animal já está alimentado pelas próximas 24 horas.');
   if(f.feed<1)return fail('Compre ração na venda.');f.feed--;a.fedAt=now;a.collectedAt=now;return {ok:true,message:'Animal alimentado! Garanta também água para ativar sua função.'};
  }
  if(!animalReady(a,now))return fail('Alimente, ofereça água e aguarde a produção.');const item=ANIMALS[a.kind];if(!item.product)return fail('O cachorro protege a plantação.');f.products[item.product]++;a.collectedAt=now;return {ok:true,message:`+1 ${item.productName.toLowerCase()} no celeiro!`};
 }
 if(c.type==='buy-decor'){
  if(!Object.hasOwn(DECOR,c.kind))return fail('Decoração inválida.');const item=DECOR[c.kind as DecorationKind];
  const slot=DECOR_SLOTS.findIndex((_,i)=>!f.decorations.some(d=>d.slot===i));if(slot<0)return fail('Os 8 espaços de decoração estão ocupados.');if(f.coins<item.price)return fail('Moedas insuficientes.');
  f.coins-=item.price;f.decorations.push({id:`decor-${now}-${slot}`,kind:c.kind,slot});return {ok:true,message:`${item.name} colocada no jardim!`};
 }
 if(c.type==='move-decor'){
  const d=f.decorations.find(d=>d.id===c.id);if(!d||!Number.isInteger(c.slot)||c.slot<0||c.slot>=DECOR_SLOTS.length)return fail('Espaço inválido.');if(f.decorations.some(x=>x.id!==d.id&&x.slot===c.slot))return fail('Este espaço já está ocupado.');d.slot=c.slot;return {ok:true,message:'Decoração reposicionada!'};
 }
 return fail('Ação desconhecida.');
}
