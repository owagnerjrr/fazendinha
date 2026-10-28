export type Effects='auto'|'full'|'light';
const KEY='wj-display-v1';
export function parseDisplay(raw:string|null){try{const v=JSON.parse(raw??'null');return{breathing:v?.breathing!==false,effects:(['auto','full','light'].includes(v?.effects)?v.effects:'auto') as Effects};}catch{return{breathing:true,effects:'auto' as Effects};}}
function read(){try{return parseDisplay(localStorage.getItem(KEY));}catch{return parseDisplay(null);}}
export const display=read();let automaticLight=false;
export function lightEffects(){return display.effects==='light'||display.effects==='auto'&&automaticLight;}
export function setAutomaticLight(value:boolean){automaticLight=value;}
export function saveDisplay(){try{localStorage.setItem(KEY,JSON.stringify(display));}catch{/* Display choices do not affect farm saving. */}}
