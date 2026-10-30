import type {Farm} from './farm.js';
import {findPath} from './pathfinding.js';
import {HOUSE_PROPS,HOUSE_WALLS} from './house-layout.js';
export const HOME_ITEMS={plant:{name:'Árvore ornamental',price:90},bookcase:{name:'Estante de livros',price:180},rug:{name:'Tapete bordado',price:75},painting:{name:'Quadro do vale',price:60},stool:{name:'Banquinho de madeira',price:45},flowers:{name:'Vaso de flores',price:50}} as const;
export const HOME_THEMES={natural:{name:'Casa do campo',floor:0xad8755,wall:0xd7c59e,price:0},sage:{name:'Refúgio verde',floor:0x879c79,wall:0xc6d8be,price:150},rose:{name:'Casa rosada',floor:0xbb8e78,wall:0xe9c6bd,price:150},midnight:{name:'Noite azul',floor:0x697c8c,wall:0xc3cfdd,price:180}} as const;
export const BASE_HOME={bed:{x:317,y:315,name:'Cama'},wardrobe:{x:887,y:315,name:'Guarda-roupa'},tv:{x:740,y:326,name:'TV'},sofa:{x:740,y:520,name:'Sofá'},coffee:{x:740,y:417,name:'Mesa de centro'},table:{x:410,y:540,name:'Mesa'},chair:{x:410,y:587,name:'Cadeira'},lamp:{x:303,y:703,name:'Abajur'}} as const;
export type HouseDesign={theme:keyof typeof HOME_THEMES;themes:(keyof typeof HOME_THEMES)[];base:Partial<Record<keyof typeof BASE_HOME,{x:number;y:number}>>;items:{id:string;kind:keyof typeof HOME_ITEMS;x:number;y:number;stored?:boolean}[]};
export function houseOffset(f:Farm,kind:keyof typeof BASE_HOME){const base=BASE_HOME[kind],p=f.houseDesign?.base[kind]??base;return{x:p.x-base.x,y:p.y-base.y};}
export function homeLayoutProblem(f:Farm,base:HouseDesign['base'],items:HouseDesign['items']){
 const props=HOUSE_PROPS.map(p=>{const at=base[p.kind]??p,dx=at.x-p.x,dy=at.y-p.y;return{...p,body:{...p.body,x:p.body.x+dx,y:p.body.y+dy},access:{x:p.access.x+dx,y:p.access.y+dy}};});
 const bodies=[...HOUSE_WALLS,...props.filter(p=>p.body.width>0).map(p=>p.body),...items.filter(i=>!i.stored&&['bookcase','stool'].includes(i.kind)).map(i=>({x:i.x-25,y:i.y-18,width:50,height:18}))];
 if(props.some(p=>p.access.x<285||p.access.x>915||p.access.y<230||p.access.y>700||p.body.width>0&&(p.body.x<278||p.body.x+p.body.width>922||p.body.y<224||p.body.y+p.body.height>708)))return 'O móvel precisa caber dentro da casa com espaço para usar.';
 if(props.some(p=>!findPath({x:600,y:680},p.access,bodies).length))return 'Deixe uma passagem da porta até todos os móveis.';
 return null;
}
export function applyHouseDesign(f:Farm,c:any){
 const fail=(message:string)=>({ok:false,message});
 if(c.type==='buy-house-item'){
  if(!Object.hasOwn(HOME_ITEMS,c.kind))return fail('Peça inválida.');const item=HOME_ITEMS[c.kind as keyof typeof HOME_ITEMS];
  if((f.houseDesign?.items.length??0)>=30)return fail('Sua casa já possui 30 peças.');if(f.coins<item.price)return fail('Moedas insuficientes.');
  f.houseDesign??={theme:'natural',themes:['natural'],base:{},items:[]};f.coins-=item.price;f.houseDesign.items.push({id:`home-${c.kind}-${f.houseDesign.items.length}`,kind:c.kind,x:600,y:430,stored:true});return{ok:true,message:'Peça comprada! Escolha onde colocá-la.'};
 }
 if(c.type==='house-style'){
  if(!Object.hasOwn(HOME_THEMES,c.theme))return fail('Estilo inválido.');const theme=c.theme as keyof typeof HOME_THEMES,owned=theme==='natural'||f.houseDesign?.themes.includes(theme),price=owned?0:HOME_THEMES[theme].price;
  if(f.coins<price)return fail('Moedas insuficientes.');f.houseDesign??={theme:'natural',themes:['natural'],base:{},items:[]};f.coins-=price;f.houseDesign.theme=theme;if(!owned)f.houseDesign.themes.push(theme);return{ok:true,message:'Paredes, piso e tecidos renovados!'};
 }
 if(c.type==='place-house-item'){
  if(!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<310||c.x>880||c.y<310||c.y>650)return fail('Escolha uma posição dentro da casa, deixando a entrada livre.');
  const base=typeof c.base==='string'&&Object.hasOwn(BASE_HOME,c.base)?c.base as keyof typeof BASE_HOME:null;
  const item=f.houseDesign?.items.find(i=>i.id===c.id);if(!base&&!item)return fail('Você não possui esta peça.');
  // Doors stay accessible. Rugs and wall paintings do not block walking.
  const others=Object.entries(BASE_HOME).filter(([k])=>k!==base).map(([k,v])=>f.houseDesign?.base[k as keyof typeof BASE_HOME]??v);
  if(base&&others.some(p=>Math.hypot(p.x-c.x,p.y-c.y)<64))return fail('Deixe espaço entre os móveis.');
  const nextBase={...f.houseDesign?.base,...(base?{[base]:{x:c.x,y:c.y}}:{})},nextItems=(f.houseDesign?.items??[]).map(i=>i.id===item?.id?{...i,x:c.x,y:c.y,stored:false}:i),problem=homeLayoutProblem(f,nextBase,nextItems);if(problem)return fail(problem);
  f.houseDesign??={theme:'natural',themes:['natural'],base:{},items:[]};if(base)f.houseDesign.base[base]={x:c.x,y:c.y};else Object.assign(item!,{x:c.x,y:c.y,stored:false});return{ok:true,message:'Peça reposicionada. Entre novamente na casa para ver a reforma.'};
 }
 return fail('Ação da casa inválida.');
}
