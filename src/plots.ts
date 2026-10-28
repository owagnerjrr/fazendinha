export const ORIGINAL_PLOTS=24;
export const EXTRA_PLOTS=12;
export const LAND_PRICE=750;
export function plotPosition(id:number){
 if(!Number.isInteger(id)||id<0||id>=ORIGINAL_PLOTS+EXTRA_PLOTS)return null;
 if(id<ORIGINAL_PLOTS)return {x:634+(id%6)*40,y:434+Math.floor(id/6)*40};
 const n=id-ORIGINAL_PLOTS;return {x:230+(n%4)*40,y:550+Math.floor(n/4)*40};
}
