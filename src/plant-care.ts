import type {Plot} from './farm.js';
export const PLANT_CARE={waterMs:600000,dryIllnessMs:1800000,pestIllnessMs:2700000,pestReturnMs:1200000} as const;
export function plantNeeds(p:Plot,now:number){
 const c=p.care;if(!p.crop)return{water:100,dry:false,sick:false,illnessAt:null};
 if(!c)return{water:p.wateredAt==null?0:100,dry:p.wateredAt==null,sick:false,illnessAt:null};
 const from=c.lastWateredAt??c.startedAt,water=c.lastWateredAt==null?0:Math.max(0,Math.min(100,100*(1-(now-c.lastWateredAt)/PLANT_CARE.waterMs)));
 const due=Math.min(from+PLANT_CARE.dryIllnessMs,p.pestAt==null?Infinity:Math.max(p.pestAt,c.startedAt)+PLANT_CARE.pestIllnessMs),illnessAt=c.illnessAt??(now>=due?due:null);
 return{water:Math.round(water),dry:water<=0,sick:illnessAt!=null,illnessAt};
}
export function grownMs(p:Plot,now:number){
 const c=p.care;if(!c)return 0;
 const until=Math.min(now,c.lastWateredAt==null?c.checkpointAt:c.lastWateredAt+PLANT_CARE.waterMs,plantNeeds(p,now).illnessAt??Infinity);
 return c.growthMs+Math.max(0,until-c.checkpointAt);
}
export function settlePlant(p:Plot,now:number){if(!p.care)return;const growth=grownMs(p,now),illness=plantNeeds(p,now).illnessAt;p.care.growthMs=growth;p.care.checkpointAt=now;p.care.illnessAt=illness;}
