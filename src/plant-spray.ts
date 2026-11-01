import{settleClimate}from'./climate';
import type{Farm,Tool}from'./farm';import{applyFertilizer}from'./fertilizer';import{applyHusbandry}from'./husbandry-rules';
export type SprayTool='fertilizer'|'medicine';
export const isSpray=(t:Tool):t is SprayTool=>t==='fertilizer'||t==='medicine';
export const sprayCommand=(t:SprayTool,plot:number)=>({type:t==='fertilizer'?'fertilize':'cure-plant',plot});
export const sprayStock=(f:Farm,t:SprayTool)=>t==='fertilizer'?f.fertilizerDebt?0:(f.fertilizers??0):f.supplies?.plantMedicine??0;
export function checkSpray(f:Farm,t:SprayTool,plot:number,now:number){const clone=structuredClone(f),c=sprayCommand(t,plot);settleClimate(clone,now);return t==='fertilizer'?applyFertilizer(clone,c,now):applyHusbandry(clone,c,now);}
