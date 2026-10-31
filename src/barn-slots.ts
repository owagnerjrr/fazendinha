import type{Animal}from'./content.js';
export const BARN_PENS=8,PEN_CAPACITY=5,BARN_CAPACITY=40;
export const barnResident=(a:Animal)=>!a.housing||a.housing==='barn';
export const validPen=(v:unknown):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<BARN_PENS;
export function penAssignments(animals:Animal[]){const map=new Map<string,number>(),counts=Array(8).fill(0);for(const a of animals.filter(barnResident))if(validPen(a.pen)){map.set(a.id,a.pen);counts[a.pen]+=1+(a.incubationAt!=null?1:0);}for(const a of animals.filter(barnResident))if(!map.has(a.id)){const slots=1+(a.incubationAt!=null?1:0),p=counts.findIndex(n=>n+slots<=5);if(p>=0){map.set(a.id,p);counts[p]+=slots;}}return map;}
export function penCount(animals:Animal[],pen:number,except?:string){const map=penAssignments(animals);return animals.filter(a=>a.id!==except&&map.get(a.id)===pen).reduce((n,a)=>n+1+(a.incubationAt!=null?1:0),0);}
export function assignBarnPens(f:{animals:Animal[]}){const map=penAssignments(f.animals);for(const a of f.animals)if(map.has(a.id))a.pen=map.get(a.id);}
export function availablePen(animals:Animal[],except?:string,slots=1){return Array.from({length:8},(_,i)=>i).find(i=>penCount(animals,i,except)+slots<=5);}
export function penOptions(animals:Animal[],selected?:number,except?:string){return Array.from({length:8},(_,i)=>'<option value="'+i+'" '+(i===selected?'selected':'')+'>Baia '+(i+1)+' ('+penCount(animals,i,except)+'/5)</option>').join('');}
