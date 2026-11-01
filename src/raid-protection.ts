import {dogProtects} from './content.js';
import type {Farm} from './farm.js';

export type RaidProtection={protected:boolean;protectionReason?:'cooldown'|'dog';protectedUntil?:number};
/** Explicit participation overrides the dog, never friendship, daily limits or cooldown. */
export function raidProtection(f:Pick<Farm,'socialRaids'|'animals'|'raidProtectionUntil'>,now:number):RaidProtection{
 if(f.raidProtectionUntil>now)return{protected:true,protectionReason:'cooldown',protectedUntil:f.raidProtectionUntil};
 if(!f.socialRaids&&dogProtects(f.animals,now))return{protected:true,protectionReason:'dog'};
 return{protected:false};
}
export function raidProtectionMessage(p:RaidProtection,now:number){
 if(p.protectionReason==='cooldown')return `Pausa após o último roubo. Tente novamente em ${Math.max(1,Math.ceil(((p.protectedUntil??now)-now)/60000))} min.`;
 return p.protectionReason==='dog'?'O cachorro protege esta fazenda. O dono precisa ativar a brincadeira.':'Esta fazenda está protegida.';
}
