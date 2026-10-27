import { DEFAULT_AVATAR, validAvatar, type Avatar } from './content.js';
import type { Farm } from './farm.js';
export const PROFILE_DRAFT_KEY='wj-profile-draft-v1';
export type ProfileDraft={version:1;name:string;avatar:Avatar;step:1|2|3};
export const CHARACTER_PRESETS:{id:string;name:string;description:string;avatar:Avatar}[]=[
 {id:'lia',name:'Lia',description:'Menina · afro com coques',avatar:{style:'puffs',skin:4,hair:0,shirt:2}},
 {id:'caio',name:'Caio',description:'Menino · cabelo crespo',avatar:{style:'crop',skin:5,hair:0,shirt:1}},
 {id:'rosa',name:'Rosa',description:'Menina · tranças',avatar:{style:'braids',skin:3,hair:1,shirt:4}},
 {id:'leo',name:'Léo',description:'Menino · cabelo curto',avatar:{style:'short',skin:1,hair:1,shirt:3}},
 {id:'ana',name:'Ana',description:'Menina · chapéu de palha',avatar:{...DEFAULT_AVATAR}},
 {id:'rui',name:'Rui',description:'Menino · cabelo curto',avatar:{style:'crop',skin:2,hair:2,shirt:5}},
];
export function normalizePlayerName(value:unknown):string|null {
 if(typeof value!=='string'||/[\u0000-\u001f\u007f]/.test(value))return null;
 const name=value.normalize('NFKC').trim().replace(/\s+/g,' ');
 return /^[\p{L}\p{N}][\p{L}\p{N} .'-]{0,23}$/u.test(name)?name:null;
}
export function readProfileDraft(raw:string|null):ProfileDraft {
 const empty:ProfileDraft={version:1,name:'',avatar:{...CHARACTER_PRESETS[0].avatar},step:1};
 try{const d=JSON.parse(raw??'null');if(!d||d.version!==1)return empty;
 const name=normalizePlayerName(d.name)??'';return {version:1,name,avatar:validAvatar(d.avatar)?{...d.avatar}:empty.avatar,step:name&&[1,2,3].includes(d.step)?d.step:1};
 }catch{return empty;}
}
export const needsInitialProfile=(farm:Farm)=>farm.profileComplete===false;
export function initializeProfile(farm:Farm,input:{name?:unknown;avatar?:unknown}) {
 if(!needsInitialProfile(farm))return {ok:false,existing:true,message:'Esta conta já tem uma fazenda. Seu progresso foi preservado.'};
 const name=normalizePlayerName(input.name);
 if(!name||!validAvatar(input.avatar))return {ok:false,message:'Escolha um nome de até 24 letras/números e um personagem válido.'};
 farm.playerName=name;farm.avatar={...input.avatar};farm.profileComplete=true;
 return {ok:true,message:`Bem-vindo, ${name}! Sua fazenda está salva na conta.`};
}
