import{BED_ADVANCE_MS,BED_DEPART_MS,sleepReadyMs,sleepExitMs}from'./bed-rules';
import {worldTime} from './world-time';import type {Farm} from './farm';
export function clockText(f:Farm,now:number){const t=worldTime(f.calendar,now);return{...t,icon:t.period==='Noite'||t.period==='Madrugada'?'☾':'☀',date:`Dia ${t.dayOfSeason} · ${t.season} · Ano ${t.year}`};}
export function updateClock(root:HTMLElement,f:Farm,now:number){const t=clockText(f,now);root.querySelector('[data-clock-hour]')!.textContent=t.text;root.querySelector('[data-clock-period]')!.textContent=`${t.icon} ${t.period}`;root.querySelector('[data-clock-date]')!.textContent=t.date;}
export const CLOCK_HTML='<strong data-clock-hour>06:00</strong><span data-clock-period>☀ Manhã</span><small data-clock-date>Dia 1 · Primavera · Ano 1</small>';

export class AutoWake{
 private busy=false;private retryAt=0;
 update(f:Farm,now:number,command:(c:unknown)=>Promise<unknown>){
  if(this.busy||now<this.retryAt||!f.home?.sleep||(f.home.sleep.wakeStartedAt!==undefined?now-f.home.sleep.wakeStartedAt<sleepExitMs(f.home.sleep):now-f.home.sleep.startedAt<(f.home.sleep.sequence===1?sleepReadyMs(f.home.sleep):6000)))return;
  this.busy=true;void command({type:'home',action:f.home.sleep.wakeStartedAt!==undefined?'rise':'wake'}).catch(()=>{this.retryAt=now+5000;}).finally(()=>{this.busy=false;});
 }
}
