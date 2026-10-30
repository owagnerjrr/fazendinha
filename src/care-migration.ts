import {ANIMALS} from './content.js';
import type {Farm} from './farm.js';
export function completeCare(f:Farm,durations:Record<string,{seconds:number}>){
 if(f.careVersion!==1||f.careStartedAt==null)return;const start=f.careStartedAt;
 f.supplies??={medicine:1,plantMedicine:2,bedding:3};
 for(const a of f.animals)if(!a.care){const water=a.wateredAt===undefined?a.fedAt:a.wateredAt,seconds=ANIMALS[a.kind].seconds;if(seconds&&a.incubationAt==null&&a.fedAt!=null&&start>=a.fedAt&&start-a.fedAt<86400000&&water!=null&&start>=water&&start-water<86400000&&start-Math.max(a.collectedAt,a.fedAt)>=seconds*1000)a.pendingAt??=Math.max(a.collectedAt,a.fedAt)+seconds*1000;if(a.wateredAt===undefined)a.wateredAt=a.fedAt;a.care={startedAt:start,cleanedAt:start,illnessAt:null};}
 for(const p of [...f.plots,...(f.customPlots??[])])if(p.crop&&!p.care)p.care={startedAt:start,lastWateredAt:p.wateredAt==null?null:start,growthMs:p.wateredAt==null?0:Math.min(p.growthDurationMs??({carrot:45,lettuce:90,tomato:150,strawberry:120,corn:180,tulip:100,sunflower:200}[p.crop]*1000),Math.max(0,start-p.wateredAt)),checkpointAt:start,illnessAt:null};
}
