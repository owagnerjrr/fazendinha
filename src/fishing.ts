import {DOCK,riverBank,riverWalkable} from './river-boundary.js';
import type {Farm} from './farm.js';
export const FISH={lambari:{name:'Lambari',price:8,weight:32,color:'#c6dfd1'},piaba:{name:'Piaba',price:6,weight:30,color:'#f2ca67'},mandi:{name:'Mandi',price:24,weight:18,color:'#b77b48'},pacu:{name:'Pacu',price:45,weight:8,color:'#8999ba'},tilapia:{name:'Tilápia',price:20,weight:12,color:'#7dc2b6'}} as const;
export type Fish=keyof typeof FISH;
export type FishingState={rod:boolean;fish:Record<Fish,number>;cast:null|{startedAt:number;biteAt:number;expiresAt:number;fish:Fish;target?:{x:number;y:number}}};
export const ROD_PRICE=120;
export const FISH_SPOT={x:1390,y:846};
export const nearFishing=(p:{x:number;y:number})=>riverWalkable(p)&&p.x>=DOCK.left+12&&p.x<=DOCK.right&&p.y>=DOCK.top&&p.y<=DOCK.bottom;
export function fishingTarget(p:{x:number;y:number},side:'north'|'east'|'south',power:number){const reach=70+Math.max(1,Math.min(3,power))*45;return{x:side==='east'?Math.min(1580,DOCK.right+reach):Math.max(riverBank(p.y)+70,p.x+45),y:side==='north'?DOCK.top-reach:side==='south'?DOCK.bottom+reach:p.y+4};}
export function validFishingTarget(p:{x:number;y:number},t:{x:number;y:number}){return !!t&&Number.isFinite(t.x)&&Number.isFinite(t.y)&&t.x>riverBank(t.y)+25&&!riverWalkable(t)&&Math.hypot(t.x-p.x,t.y-p.y)>=50&&Math.hypot(t.x-p.x,t.y-p.y)<=310&&t.x<=1590&&t.y>=180&&t.y<=1100;}
/** Clear both vegetation and trunks around the entire bridge approach. */
export const fishingClearance=(x:number,y:number)=>x>1130&&y>760&&y<1130;
export const FISHING_COMMANDS=['buy-rod','cast-line','reel-line','cancel-line'] as const;
export function newFishing():FishingState{return{rod:false,fish:{lambari:0,piaba:0,mandi:0,pacu:0,tilapia:0},cast:null};}
export function restoreFishing(f:Farm){if(!f.fishing)return;const s=f.fishing;for(const k of Object.keys(FISH) as Fish[])if(!Number.isSafeInteger(s.fish?.[k])||s.fish[k]<0||s.fish[k]>1e6){s.fish??=newFishing().fish;s.fish[k]=0;}s.rod=s.rod===true;const c=s.cast;if(c&&(!Object.hasOwn(FISH,c.fish)||!Number.isFinite(c.startedAt)||c.biteAt<c.startedAt||!Number.isFinite(c.biteAt)||!Number.isFinite(c.expiresAt)||c.expiresAt<c.biteAt))s.cast=null;if(s.cast?.target&&!validFishingTarget(f.player,s.cast.target))delete s.cast.target;}
export function applyFishing(f:Farm,c:{type:string;target?:{x:number;y:number}},now:number,random= Math.random):{ok:boolean;message:string;caught?:Fish}{
 const fail=(message:string)=>({ok:false,message});
 if(c.type==='buy-rod'){if(f.fishing?.rod)return fail('Você já tem uma vara.');if(f.coins<ROD_PRICE)return fail('Moedas insuficientes.');f.fishing??=newFishing();f.coins-=ROD_PRICE;f.fishing.rod=true;return{ok:true,message:'Vara de pescar guardada.'};}
 const s=f.fishing;if(!s?.rod)return fail('Você precisa de uma vara de pescar.');
 if(c.type==='cancel-line'){s.cast=null;return{ok:true,message:'Linha recolhida.'};}
 if(!nearFishing(f.player))return fail('Fora do ponto de pesca.');
 if(c.type==='cast-line'){
  if(s.cast&&now<=s.cast.expiresAt)return fail('A linha já está na água.');
  const target=c.target??fishingTarget(f.player,'east',1);if(!validFishingTarget(f.player,target))return fail('Lance a isca na água ao redor da ponte.');
  const entries=Object.entries(FISH) as [Fish,typeof FISH[Fish]][];let roll=Math.max(0,Math.min(.999999,random()))*100,fish:Fish='lambari';for(const [k,v] of entries){roll-=v.weight;if(roll<0){fish=k;break;}}
  const biteAt=now+3500+Math.floor(Math.max(0,Math.min(1,random()))*3500);s.cast={startedAt:now,biteAt,expiresAt:biteAt+6500,fish,target};return{ok:true,message:'Linha lançada.'};
 }
 if(c.type==='reel-line'){
  const cast=s.cast;if(!cast)return fail('Não há linha lançada.');if(now<cast.biteAt)return fail('Ainda não fisgou.');s.cast=null;
  if(now>cast.expiresAt)return{ok:true,message:'O peixe escapou.'};if(s.fish[cast.fish]>=1e6)return{ok:true,message:'Inventário de pesca cheio.'};s.fish[cast.fish]++;return{ok:true,message:`+1 ${FISH[cast.fish].name}`,caught:cast.fish};
 }
 return fail('Ação de pesca inválida.');
}
export function sellFish(f:Farm){let total=0;if(f.fishing)for(const k of Object.keys(FISH) as Fish[]){total+=f.fishing.fish[k]*FISH[k].price;f.fishing.fish[k]=0;}return total;}
