import {dogProtects} from './content.js';import type {Farm} from './farm.js';
export const RAID_LIMIT=5,RAID_WINDOW_MS=3600000;
export type RaidProtection={protected:boolean;protectionReason?:'limit'|'cooldown'|'dog';protectedUntil?:number;raidsRemaining?:number;raidResetAt?:number};
export function raidWindow(events:number[],now:number){const recent=events.filter(at=>Number.isFinite(at)&&at>now-RAID_WINDOW_MS&&at<=now).sort((a,b)=>a-b);return{raidsRemaining:Math.max(0,RAID_LIMIT-recent.length),raidResetAt:recent.length?recent[0]+RAID_WINDOW_MS:undefined};}
/** Explicit consent overrides the dog. Quotas are per visitor/owner, never a global farm lock. */
export function raidProtection(f:Pick<Farm,'socialRaids'|'animals'>,now:number,events:number[]=[]):RaidProtection{
 const quota=raidWindow(events,now);if(quota.raidsRemaining===0)return{...quota,protected:true,protectionReason:'limit',protectedUntil:quota.raidResetAt};
 if(!f.socialRaids&&dogProtects(f.animals,now))return{...quota,protected:true,protectionReason:'dog'};
 return{...quota,protected:false};
}
export function raidProtectionMessage(p:RaidProtection,now:number){
 if(p.protectionReason==='limit'||p.protectionReason==='cooldown')return `Você já usou os 5 roubos desta fazenda nos últimos 60 minutos. Próxima vaga em ${Math.max(1,Math.ceil(((p.protectedUntil??p.raidResetAt??now)-now)/60000))} min.`;
 return p.protectionReason==='dog'?'O cachorro protege esta fazenda. O dono precisa ativar a brincadeira.':'Esta fazenda está protegida.';
}
