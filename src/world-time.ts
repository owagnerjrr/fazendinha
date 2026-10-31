import {dayLight} from './day-light.js';
export type Calendar={startedAt:number;offsetMinutes:number;sleepAt?:number};
export type HomeState={tvOn:boolean;lightsOn?:boolean;sleep?:{startedAt:number;morning:number;targetMinute?:number}};
export const GAME_MINUTE_MS=1000,DAY_MINUTES=1440,SEASON_DAYS=28,SLEEP_MS=6000;
export const SEASONS=['Primavera','Verão','Outono','Inverno'] as const;
// Stable fallback only for legacy saves lacking a calendar; server backfills their actual first opening.
export const LEGACY_CLOCK_START=Date.UTC(2026,9,28);
export function worldTime(calendar:Calendar|undefined,now:number){
 const c=calendar??{startedAt:LEGACY_CLOCK_START,offsetMinutes:0};
 const absolute=360+Math.floor(Math.max(0,Math.min(now,c.sleepAt??now)-c.startedAt)/GAME_MINUTE_MS)+c.offsetMinutes;
 const dayIndex=Math.floor(absolute/DAY_MINUTES),minuteOfDay=absolute%DAY_MINUTES,hour=Math.floor(minuteOfDay/60),minute=minuteOfDay%60;
 return {absolute,day:dayIndex+1,dayOfSeason:dayIndex%SEASON_DAYS+1,year:Math.floor(dayIndex/(SEASON_DAYS*4))+1,season:SEASONS[Math.floor(dayIndex/SEASON_DAYS)%4],hour,minute,minuteOfDay,period:hour<5?'Madrugada':hour<12?'Manhã':hour<17?'Tarde':hour<20?'Anoitecer':'Noite',text:`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`};
}
export function nextMorning(absolute:number){const today=Math.floor(absolute/DAY_MINUTES)*DAY_MINUTES+360;return today>absolute?today:today+DAY_MINUTES;}
export function nightOpacity(minute:number){return dayLight(minute).alpha;}
export function nextWakeTime(absolute:number,minute:number){const today=Math.floor(absolute/DAY_MINUTES)*DAY_MINUTES+minute;return today>absolute?today:today+DAY_MINUTES;}
export function applyHome(f:{calendar?:Calendar;home?:HomeState},c:{action?:unknown;on?:unknown;wakeAt?:unknown},now:number){
 const fail=(message:string)=>({ok:false,message});
 if(!['tv','lights','sleep','wake'].includes(String(c.action)))return fail('Ação da casa inválida.');
 if((c.action==='tv'||c.action==='lights')&&typeof c.on!=='boolean')return fail('Escolha ligar ou desligar a TV.');
 if(c.action==='sleep'&&c.wakeAt!==undefined&&(!Number.isInteger(c.wakeAt)||Number(c.wakeAt)<0||Number(c.wakeAt)>1439))return fail('Escolha uma hora e minuto válidos.');
 if(c.action==='sleep'&&f.home?.sleep)return fail('Você já está descansando.');
 if(c.action==='wake'&&(!f.home?.sleep||now-f.home.sleep.startedAt<SLEEP_MS))return fail('Aguarde alguns segundos de descanso.');
 f.calendar??={startedAt:now,offsetMinutes:0};f.home??={tvOn:false};
 if(c.action==='lights'){f.home.lightsOn=c.on as boolean;return{ok:true,message:c.on?'Luz ligada.':'Luz desligada.'};}
 if(c.action==='tv'){f.home.tvOn=c.on as boolean;return {ok:true,message:f.home.tvOn?'TV ligada.':'TV desligada.'};}
 if(c.action==='sleep'){f.home.tvOn=false;const absolute=worldTime(f.calendar,now).absolute;f.home.sleep={startedAt:now,morning:c.wakeAt===undefined?nextMorning(absolute):nextWakeTime(absolute,Number(c.wakeAt)),...(c.wakeAt===undefined?{}:{targetMinute:Number(c.wakeAt)})};if(c.wakeAt!==undefined)f.calendar.sleepAt=now;return {ok:true,message:c.wakeAt===undefined?'Boa noite! Descanse até a manhã.':'Bom descanso! Você acordará no horário escolhido.'};}
 if(f.home.sleep!.targetMinute!==undefined){const target=f.home.sleep!.morning;delete f.calendar.sleepAt;f.calendar.offsetMinutes+=target-worldTime(f.calendar,now).absolute;delete f.home.sleep;return{ok:true,message:'Você acordou no horário escolhido.'};}
 const current=worldTime(f.calendar,now).absolute;f.calendar.offsetMinutes+=Math.max(0,f.home.sleep!.morning-current);delete f.home.sleep;
 return {ok:true,message:'Bom dia! Uma nova manhã no vale.'};
}
