/// <reference types="vite/client" />
import {makeFarm,SAVE_KEY} from '../src/farm';import {splitLocalFarm,LAND_SAVE_KEY} from '../src/local-farm';import {PROFILE_DRAFT_KEY} from '../src/profile';
document.getElementById('prepare')!.onclick=()=>{
 if(!import.meta.env.DEV||!['terminal.local','localhost','127.0.0.1'].includes(location.hostname))throw Error('Somente prévia local.');
 if(localStorage.getItem(SAVE_KEY)||localStorage.getItem('wj-cloud-session')){document.getElementById('result')!.textContent='Já existe um save ou sessão nesta prévia; nenhum dado foi alterado.';return;}
 const f=makeFarm();f.playerName='QA Desempenho';f.profileComplete=true;f.player={x:710,y:650};const parts=splitLocalFarm(f);
 localStorage.setItem(SAVE_KEY,parts.core);if(parts.land)localStorage.setItem(LAND_SAVE_KEY,parts.land);localStorage.removeItem(PROFILE_DRAFT_KEY);location.href='/';
};
