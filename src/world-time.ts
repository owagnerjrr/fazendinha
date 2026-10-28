export type Calendar={startedAt:number;offsetMinutes:number};
export type HomeState={tvOn:boolean;sleep?:{startedAt:number;morning:number}};
export const GAME_MINUTE_MS=1000,DAY_MINUTES=1440,SEASON_DAYS=28,SLEEP_MS=6000;
export const SEASONS=['Primavera','Verão','Outono','Inverno'] as const;
// Stable fallback only for legacy saves lacking a calendar; server backfills their actual first opening.
export const LEGACY_CLOCK_START=Date.UTC(2026,9,28);
export function worldTime(calendar:Calendar|undefined,now:number){
 const c=calendar??{startedAt:LEGACY_CLOCK_START,offsetMinutes:0};
 const absolute=360+Math.floor(Math.max(0,now-c.startedAt)/GAME_MINUTE_MS)+c.offsetMinutes;
 const dayIndex=Math.floor(absolute/DAY_MINUTES),minuteOfDay=absolute%DAY_MINUTES,hour=Math.floor(minuteOfDay/60),minute=minuteOfDay%60;
 return {absolute,day:dayIndex+1,dayOfSeason:dayIndex%SEASON_DAYS+1,year:Math.floor(dayIndex/(SEASON_DAYS*4))+1,season:SEASONS[Math.floor(dayIndex/SEASON_DAYS)%4],hour,minute,minuteOfDay,period:hour<6?'Madrugada':hour<12?'Manhã':hour<18?'Tarde':'Noite',text:`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`};
}
export function nextMorning(absolute:number){const today=Math.floor(absolute/DAY_MINUTES)*DAY_MINUTES+360;return today>absolute?today:today+DAY_MINUTES;}
export function nightOpacity(minute:number){
 const stops=[[0,.48],[300,.45],[360,.24],[450,0],[1020,0],[1110,.23],[1230,.44],[1440,.48]];
 for(let i=1;i<stops.length;i++)if(minute<=stops[i][0]){const [a,x]=stops[i-1],[b,y]=stops[i];return (x+(y-x)*(minute-a)/(b-a))/3;}return .48/3;
}
export function applyHome(f:{calendar?:Calendar;home?:HomeState},c:{action?:unknown;on?:unknown},now:number){
 const fail=(message:string)=>({ok:false,message});
 if(!['tv','sleep','wake'].includes(String(c.action)))return fail('Ação da casa inválida.');
 if(c.action==='tv'&&typeof c.on!=='boolean')return fail('Escolha ligar ou desligar a TV.');
 if(c.action==='sleep'&&f.home?.sleep)return fail('Você já está descansando.');
 if(c.action==='wake'&&(!f.home?.sleep||now-f.home.sleep.startedAt<SLEEP_MS))return fail('Aguarde alguns segundos de descanso.');
 f.calendar??={startedAt:now,offsetMinutes:0};f.home??={tvOn:false};
 if(c.action==='tv'){f.home.tvOn=c.on as boolean;return {ok:true,message:f.home.tvOn?'TV ligada.':'TV desligada.'};}
 if(c.action==='sleep'){f.home.sleep={startedAt:now,morning:nextMorning(worldTime(f.calendar,now).absolute)};return {ok:true,message:'Boa noite! Descanse até a manhã.'};}
 const current=worldTime(f.calendar,now).absolute;f.calendar.offsetMinutes+=Math.max(0,f.home.sleep!.morning-current);delete f.home.sleep;
 return {ok:true,message:'Bom dia! Uma nova manhã no vale.'};
}
