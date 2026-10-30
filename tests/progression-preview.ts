import '../src/style.css';import '../src/theme.css';import {setupOnlineUI} from '../src/online-ui';import {newOnlineFarm} from '../src/online-rules';import type {CloudFarm} from '../src/cloud';
const farm=newOnlineFarm(Date.now()),dialog=document.querySelector<HTMLDialogElement>('#panel')!;
const cloud={active:true,name:'QA',code:'QA12345678',request:async()=>({friends:[],blocked:[],market:[],referrals:{completed:3,pending:1,earned:3000,verificationPending:false}})} as unknown as CloudFarm;
const ui=setupOnlineUI(cloud,(title,html)=>{document.querySelector('#qa-title')!.textContent=title;document.querySelector('#qa-content')!.innerHTML=html;if(!dialog.open)dialog.showModal();},()=>dialog.close(),message=>console.info(message),()=>farm,()=>{});
document.querySelector<HTMLButtonElement>('#qa-close')!.onclick=()=>dialog.close();ui.progression();
