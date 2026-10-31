import type { Farm } from './farm.js';
export function requiresNewClient(farm:Farm,version:string|null|undefined):boolean {
 if(version==='13')return false;
 if(farm.livingSince!=null)return true;
 if(version==='12')return false;
 if(farm.calendar?.sleepAt!==undefined||farm.home?.sleep?.targetMinute!==undefined)return true;
 if(version==='11')return false;
 if(farm.animals.some(a=>a.petMode))return true;
 if(version==='10')return false;
 if(farm.animals.some(a=>a.kind==='cat')||farm.houseDesign||farm.fertilizers||farm.fertilizerDebt)return true;
 if(version==='9')return false;
 if(version==='8')return !!farm.wardrobe?.equipped;
 if(version==='7')return true;
 if(version==='6')return true;
 if(farm.fishing)return true;
 if(version==='5')return false;
 if(farm.careVersion||farm.buildings?.some(b=>['coop','pasture'].includes(b.kind))||farm.animals.some(a=>a.housing&&a.housing!=='barn'))return true;
 if(version==='4')return false;
 if(farm.home||farm.calendar?.offsetMinutes)return true;
 if(version==='3')return false;
 if((farm.landParcels??[]).some(p=>p.site!=='west')||(farm.landParcels??[]).length>1||(farm.buildings??[]).length)return true;
 return version!=='2' && (!!farm.landOwned||farm.animals.some(a=>a.kind==='rooster'||a.kind==='chick'));
}
export const CLIENT_UPDATE_MESSAGE='Sua fazenda foi atualizada. Feche todas as abas ou o aplicativo e abra a versão mais recente.';
