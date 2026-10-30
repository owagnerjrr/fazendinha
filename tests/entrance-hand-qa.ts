/// <reference types="vite/client" />
import {makeFarm,SAVE_KEY,type Farm} from '../src/farm';import {splitLocalFarm,LAND_SAVE_KEY} from '../src/local-farm';import {PROFILE_DRAFT_KEY} from '../src/profile';
const places={house:{x:408,y:500},shop:{x:1030,y:440},barn:{x:1050,y:850},approach:{x:1050,y:950}};
for(const button of Array.from(document.querySelectorAll<HTMLButtonElement>('[data-place]')))button.onclick=()=>{
 if(!import.meta.env.DEV||!['terminal.local','localhost','127.0.0.1'].includes(location.hostname)||localStorage.getItem('wj-cloud-session'))throw Error('Somente prévia local sem conta.');
 const previous=localStorage.getItem(SAVE_KEY);if(previous&&!String((JSON.parse(previous) as Farm).playerName??'').startsWith('QA')){document.getElementById('result')!.textContent='Fazenda existente preservada. Cenário não preparado.';return;}
 const f=makeFarm();f.playerName='QA Mãos';f.profileComplete=true;f.player=places[button.dataset.place as keyof typeof places];const saved=splitLocalFarm(f);localStorage.setItem(SAVE_KEY,saved.core);if(saved.land)localStorage.setItem(LAND_SAVE_KEY,saved.land);else localStorage.removeItem(LAND_SAVE_KEY);localStorage.removeItem(PROFILE_DRAFT_KEY);location.href='/tests/mobile-preview.html';
};
