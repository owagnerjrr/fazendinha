// Shared validation; definitions are data, never executable expressions or scripts.
export const STUDIO_KINDS=['animal','item','crop','cosmetic','building','scene','shop','config','bundle'] as const;
export type StudioKind=typeof STUDIO_KINDS[number];
export type Audience={mode:'self'|'players'|'groups'|'new'|'all';players:string[];groups:string[];percent:number;minLevel:number};
export type Definition={kind:StudioKind;name:string;description:string;price:number;sellPrice:number;color:string;behaviors:string[];data:Record<string,unknown>;dependencies:string[]};
export const CAPABILITIES=['wander','follow','pet','play','feed','water','clean','heal'] as const;
export class StudioValidationError extends Error {}
export function check(value:unknown,message:string):asserts value {if(!value)throw new StudioValidationError(message);}
export function uuid(v:unknown):v is string{return typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);}
export function integer(v:unknown,min:number,max:number){check(Number.isSafeInteger(v)&&Number(v)>=min&&Number(v)<=max,'Número fora dos limites.');return Number(v);}
export function text(v:unknown,max=200){check(typeof v==='string'&&v.length<=max,'Texto inválido ou muito longo.');return v.trim();}
export function definition(v:unknown):Definition{
 check(v&&typeof v==='object'&&!Array.isArray(v),'Definição inválida.');const x=v as Record<string,unknown>;
 check(STUDIO_KINDS.includes(x.kind as StudioKind),'Tipo de conteúdo inválido.');const name=text(x.name,80);check(name.length>1,'Informe um nome.');
 const data=x.data??{};check(data&&typeof data==='object'&&!Array.isArray(data)&&JSON.stringify(data).length<100000,'Configuração inválida.');
 const dependencies=x.dependencies??[];check(Array.isArray(dependencies)&&dependencies.length<=50&&dependencies.every(uuid),'Dependências inválidas.');
 const behaviors=x.behaviors??[];check(Array.isArray(behaviors)&&behaviors.length<=8&&behaviors.every(b=>CAPABILITIES.includes(b)),'Comportamento não suportado.');
 const color=x.color??'#88754c';check(typeof color==='string'&&/^#[0-9a-f]{6}$/i.test(color),'Cor inválida.');
 const d:Definition={kind:x.kind as StudioKind,name,description:text(x.description??'',2000),price:integer(x.price??0,0,1000000),sellPrice:integer(x.sellPrice??0,0,1000000),color,behaviors:[...new Set(behaviors)] as string[],dependencies:[...new Set(dependencies)] as string[],data:data as Record<string,unknown>};
 check(d.sellPrice<=d.price||d.kind==='crop','Venda não pode ultrapassar a compra.');
 if(d.kind==='animal'){integer(d.data.speed??35,5,120);integer(d.data.careMinutes??90,20,720);check(['short','long','bird'].includes(String(d.data.shape??'short')),'Anatomia não suportada.');}
 if(d.kind==='scene'){const w=integer(d.data.width,8,64),h=integer(d.data.height,8,64);const cells=d.data.cells??[];check(Array.isArray(cells)&&cells.length<=w*h,'Células inválidas.');for(const c of cells){check(c&&typeof c==='object','Célula inválida.');integer(c.x,0,w-1);integer(c.y,0,h-1);check(['grass','path','water','wall','crop','door'].includes(c.type),'Terreno inválido.');if(c.type==='door')check(c.destination==='farm'||uuid(c.destination),'Destino inválido.');} }
 if(d.kind==='crop')integer(d.data.growthSeconds??120,10,86400);
 return d;
}
export function audience(v:unknown):Audience{const a=v as Audience;check(a&&['self','players','groups','new','all'].includes(a.mode),'Público inválido.');check(Array.isArray(a.players)&&a.players.length<=200&&a.players.every(p=>/^[A-F0-9]{10}$/.test(p)),'Códigos inválidos.');check(Array.isArray(a.groups)&&a.groups.length<=50&&a.groups.every(uuid),'Grupos inválidos.');return {...a,percent:integer(a.percent,0,100),minLevel:integer(a.minLevel,1,10000)};}
export function included(a:Audience,p:{id:string;code:string;level:number;created:number;groups:string[]},owner:string,created:number,content:string){
 const mode=a.mode==='all'||a.mode==='self'&&p.id===owner||a.mode==='players'&&a.players.includes(p.code)||a.mode==='groups'&&a.groups.some(g=>p.groups.includes(g))||a.mode==='new'&&p.created>=created;
 let hash=2166136261;for(const c of p.id+content){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return !!mode&&p.level>=a.minLevel&&(hash>>>0)%10000<a.percent*100;
}
