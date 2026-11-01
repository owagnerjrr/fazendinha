import type{Farm}from'./farm.js';import{settleClimate}from'./climate.js';import{applyHusbandry}from'./husbandry-rules.js';import{applyFertilizer}from'./fertilizer.js';
/** Caller enforces accepted friendship and nearby presence, as for other plot help. Commit only after success. */
export function applyGuestPlotProduct(host:Farm,visitor:Farm,plot:number,kind:'medicine'|'fertilizer',now:number){
 const copy=structuredClone(host);copy.supplies=structuredClone(visitor.supplies);copy.fertilizers=visitor.fertilizers;copy.fertilizerDebt=visitor.fertilizerDebt;settleClimate(copy,now);
 const result=kind==='medicine'?applyHusbandry(copy,{type:'cure-plant',plot},now):applyFertilizer(copy,{type:'fertilize',plot},now);
 if(!result.ok)return result;
 host.plots=copy.plots;host.customPlots=copy.customPlots;host.expansionPlots=copy.expansionPlots;host.climateAt=copy.climateAt;
 if(kind==='medicine')visitor.supplies=copy.supplies;else visitor.fertilizers=copy.fertilizers;
 return{ok:true,message:result.message+' Produto usado da sua bolsa.'};
}
