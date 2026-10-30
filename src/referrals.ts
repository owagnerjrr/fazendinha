export const REFERRAL_REWARD=1000;
export const REFERRAL_WINDOW_MS=24*60*60*1000;
export const referralCode=(value:unknown)=>typeof value==='string'&&/^[A-Z0-9]{10}$/.test(value)?value:null;
export function canonicalEmail(email:string){const [local,host]=email.trim().toLowerCase().split('@');if(!local||!host)return '';return ['gmail.com','googlemail.com'].includes(host)?`${local.split('+')[0].replaceAll('.','')}@gmail.com`:`${local}@${host}`;}
export function referralEligible(createdAt:number,farmCreatedAt:number,now:number){return Number.isFinite(createdAt)&&createdAt<=now&&now-createdAt<=REFERRAL_WINDOW_MS&&farmCreatedAt-createdAt<=REFERRAL_WINDOW_MS&&farmCreatedAt>=createdAt-60000;}
