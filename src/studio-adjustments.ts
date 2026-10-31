import {check,integer,text} from './studio-schema.js';
// Explicit paths only. No eval, arbitrary JSON paths, deletion or whole-save replacement.
export function adjustProgress(state:Record<string,any>,patch:Record<string,unknown>){
 const field=text(patch.field,40),value=integer(patch.value,0,10000000);let container=state,key=field;
 if(['coins','xp','feed','fertilizers'].includes(field)){check(typeof state[field]==='number','Campo indisponível nesta conta.');}
 else if(['seeds','inventory','products','supplies'].includes(field)){key=text(patch.key,60);check(state[field]&&Object.hasOwn(state[field],key)&&typeof state[field][key]==='number','Item inexistente ou protegido.');container=state[field];}
 else {check(false,'Este campo não admite ajuste administrativo.');}
 const before=container[key];container[key]=value;return {before,after:value,field,key};
}
