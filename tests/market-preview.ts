// Browser QA fixture. Same renderer and stock rules, no network or real accounts.
import '../src/style.css';import '../src/theme.css';
import {newOnlineFarm} from '../src/online-rules';import {mountMarket,type MarketView} from '../src/market-ui';
import {reserveLot,returnLot,transferLot} from '../src/market';import type {Listing,CloudFarm} from '../src/cloud';
let nextId=0;const fixtureId=()=>`00000000-0000-4000-8000-${String(++nextId).padStart(12,'0')}`;
const farm=newOnlineFarm(Date.now()),neighbor=newOnlineFarm(Date.now());
farm.products={egg:4,milk:2,goatMilk:3};farm.inventory.strawberry=6;
let listings:Listing[]=[
 {id:fixtureId(),crop:'milk',quantity:2,price:60,mine:false,name:'Sítio da Rosa',code:'FAKE000001'},
 {id:fixtureId(),crop:'carrot',quantity:3,price:30,mine:false,name:'Quintal do Bento',code:'FAKE000002'},
 {id:fixtureId(),crop:'goatMilk',quantity:2,price:999,mine:false,name:'Alto da Serra',code:'FAKE000003'},
];
const view:MarketView={filter:'all',item:'egg'};const root=document.getElementById('market-root')!;
const notify=(s:string)=>{document.getElementById('online-feedback')!.textContent=s;};
const cloud:Pick<CloudFarm,'command'|'refresh'>={
 refresh:async()=>{},
 command:async(input:unknown)=>{
  const c=input as Record<string,any>;let result;
  if(c.type==='list'){
   result=reserveLot(farm,c);if(result.ok)listings.unshift({id:fixtureId(),crop:c.crop,quantity:c.quantity,price:c.price,mine:true,name:'Minha fazenda de QA',code:'FAKE000004'});
  }else{
   const l=listings.find(l=>l.id===c.listing);if(!l)throw new Error('Oferta encerrada.');
   result=c.type==='cancel-listing'?returnLot(farm,l):transferLot(farm,neighbor,l);
   if(result.ok)listings=listings.filter(item=>item.id!==l.id);
  }
  if(!result.ok)throw new Error(result.message);
  return {farm,revision:0,now:Date.now(),message:result.message};
 }
};
async function render(message=''){mountMarket(root,listings,()=>farm,cloud,view,render,notify);if(message)notify(message);}
void render();
