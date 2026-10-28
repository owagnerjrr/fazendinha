import type {Animal} from './content.js';
export const ANIMAL_CARE={foodMs:86400000,waterMs:86400000,cleanMs:172800000,illnessNeglectMs:129600000,illnessDirtMs:259200000,refillAt:70} as const;
const pct=(at:number|null|undefined,now:number,duration:number)=>at==null?0:Math.max(0,Math.min(100,100*(1-Math.max(0,now-at)/duration)));
export function animalNeeds(a:Animal,now:number){
 const care=a.care,start=care?.startedAt??now,water=a.wateredAt===undefined?a.fedAt:a.wateredAt;
 const hunger= pct(a.fedAt,now,ANIMAL_CARE.foodMs),thirst=pct(water,now,ANIMAL_CARE.waterMs),clean=pct(care?.cleanedAt??start,now,ANIMAL_CARE.cleanMs);
 const neglect=Math.min(Math.max(start,a.fedAt??start)+ANIMAL_CARE.illnessNeglectMs,Math.max(start,water??start)+ANIMAL_CARE.illnessNeglectMs,(care?.cleanedAt??start)+ANIMAL_CARE.illnessDirtMs);
 const illnessAt=care?.illnessAt??(care&&now>=neglect?neglect:null);
 return{food:Math.round(hunger),water:Math.round(thirst),clean:Math.round(clean),illnessAt,sick:illnessAt!=null,health:illnessAt!=null?35:Math.round(55+(hunger+thirst+clean)*.15)};
}
/** One visible pending product per animal; prior production is not lost when a need expires. */
export function productionAt(a:Animal,now:number,seconds:number):number|null{
 if(a.pendingAt!=null)return a.pendingAt<=now?a.pendingAt:null;
 if(!seconds||a.fedAt==null||a.incubationAt!=null)return null;
 const water=a.wateredAt===undefined?a.fedAt:a.wateredAt;if(water==null)return null;
 const start=Math.max(a.collectedAt,a.fedAt,water,a.care?.recoveredAt??0),end=Math.min(a.fedAt+ANIMAL_CARE.foodMs,water+ANIMAL_CARE.waterMs,a.care?a.care.cleanedAt+ANIMAL_CARE.cleanMs:Infinity,animalNeeds(a,now).illnessAt??Infinity),ready=start+seconds*1000;
 return ready<=end&&now>=ready?ready:null;
}
