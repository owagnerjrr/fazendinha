import {referralCode,REFERRAL_WINDOW_MS} from './referrals';
const KEY='wj-invitation-v1';
export function invitation(){try{const url=new URL(location.href),incoming=referralCode(url.searchParams.get('ref'));if(incoming){const old=JSON.parse(sessionStorage.getItem(KEY)??'null');if(old?.code!==incoming)sessionStorage.setItem(KEY,JSON.stringify({code:incoming,at:Date.now()}));}const saved=JSON.parse(sessionStorage.getItem(KEY)??'null');return saved&&Date.now()-saved.at<=REFERRAL_WINDOW_MS?referralCode(saved.code):null;}catch{return null;}}
export function clearInvitation(){try{sessionStorage.removeItem(KEY);const url=new URL(location.href);url.searchParams.delete('ref');history.replaceState(null,'',url);}catch{}}
export function loginCallback(chooseCharacter:boolean){const url=new URL('/',location.origin);if(chooseCharacter)url.searchParams.set('setup','character');const code=invitation();if(code)url.searchParams.set('ref',code);return url.href;}
