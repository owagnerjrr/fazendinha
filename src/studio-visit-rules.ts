import type {Farm} from './farm.js';
import {check,uuid,integer,contentDependencies} from './studio-schema.js';
import {applyStudio,studioEntries,mapSpawn,mapWalkable,petNeeds,pinDependencies,studioCell,type StudioEntry,type StudioPet} from './studio-runtime.js';
import {footprint} from './studio-building.js';

export type StudioPosition={scene:string;x:number;y:number;direction?:number};
export type StudioPeer={code:string;name:string;x:number;y:number;direction:number;avatar:Farm['avatar']};
export type SharedStudio={owner:{code:string;name:string};visitorCare:boolean;entries:StudioEntry[];position:StudioPosition;animals:StudioPet[];plots:NonNullable<Farm['studio']>['plots'];structures:NonNullable<Farm['studio']>['structures'];calendar:Farm['calendar'];players:StudioPeer[];now:number};

// Both publication scope and the owner's explicit scene switch apply to visitors.
export function sharedEntries(host:Farm,hostCatalog:StudioEntry[],visitorEntries:StudioEntry[],scene:string){
 const own=host.studio?.owned??[],all=studioEntries(host,hostCatalog),area=own.find(e=>e.id===scene);
 check(area?.definition.kind==='scene'&&area.definition.data.visitable===true,'O dono não abriu este cenário para visitas.');
 const allowed=new Set(visitorEntries.map(e=>e.id)),wanted=new Set([scene]);
 for(const b of host.studio!.structures.filter(b=>b.scene===scene))wanted.add(b.content);
 for(const [key,p] of Object.entries(host.studio!.plots))if(key.startsWith(scene+':')&&p.content)wanted.add(p.content);
 for(let n=0;n<100;n++){const before=wanted.size;for(const id of wanted){const e=all.find(e=>e.id===id);check(e&&allowed.has(id),'Esta área contém conteúdo não liberado para sua conta.');for(const dep of contentDependencies(e.definition))wanted.add(dep);}if(wanted.size===before)break;}
 check(wanted.size<=100,'Este cenário tem dependências demais.');
 for(const e of all)if(e.definition.kind==='crop'&&allowed.has(e.id))wanted.add(e.id);
 // Private species are not exposed just because their owner accepts a friendship.
 for(const pet of host.studio!.animals)if((pet.room===scene||pet.mode==='follow'&&host.studio!.position.scene===scene)&&allowed.has(pet.content))wanted.add(pet.content);
 return all.filter(e=>wanted.has(e.id));
}

export function visitPosition(host:Farm,entries:StudioEntry[],position:StudioPosition,c:Record<string,unknown>){
 const d=entries.find(e=>e.id===position.scene)?.definition;check(d?.kind==='scene','Cenário indisponível.');
 const x=integer(c.x,0,63),y=integer(c.y,0,63);
 check(Math.abs(x-position.x)+Math.abs(y-position.y)===1,'Caminhe um espaço por vez.');
 check(mapWalkable(d,x,y),'Passagem bloqueada.');
 for(const b of host.studio?.structures??[]){if(b.scene!==position.scene)continue;const bd=entries.find(e=>e.id===b.content)?.definition;if(!bd||bd.data.function==='garden')continue;const size=footprint(bd,b.rotation);check(!(x>=b.x&&x<b.x+size.width&&y>=b.y&&y<b.y+size.height),'Há uma construção neste espaço.');}
 return {scene:position.scene,x,y,direction:x<position.x?1:x>position.x?2:y<position.y?3:0};
}

export function applyStudioGuest(host:Farm,visitor:Farm,entries:StudioEntry[],position:StudioPosition,c:Record<string,any>,now:number){
 check(host.visitorCare===true,'O dono não permitiu cuidados por visitantes.');
 check(['pet','hoe','plant','water','fish'].includes(c.action),'Visitantes não podem colher, vender, construir, mover bens nem levar animais.');
 const hostCopy=structuredClone(host),guestCopy=structuredClone(visitor),originalPosition=hostCopy.studio!.position;
 hostCopy.studio!.position={scene:position.scene,x:position.x,y:position.y};
 if(c.action==='pet'){
  check(['pet','play','feed','water','clean','heal'].includes(c.mode),'Visitantes não podem mudar o local ou o dono do animal.');
  const pet=hostCopy.studio!.animals.find(a=>a.id===c.animal),d=entries.find(e=>e.id===pet?.content)?.definition;
  check(pet&&d&&(pet.room===position.scene||pet.mode==='follow'&&originalPosition.scene===position.scene),'Animal indisponível neste cenário.');
  const n=petNeeds(pet,d,now);if(c.mode==='feed')check(n.food<95,'O animal já está alimentado.');if(c.mode==='heal')check(n.health<95,'O animal não precisa deste remédio.');
  hostCopy.feed=guestCopy.feed;hostCopy.supplies=structuredClone(guestCopy.supplies);
 }else if(c.action==='plant'){
  check(uuid(c.content),'Escolha uma semente.');const seed=guestCopy.studio?.owned.find(e=>e.id===c.content),crop=entries.find(e=>e.id===c.content);
  check(seed?.definition.kind==='crop'&&crop&&seed.version===crop.version,'A semente precisa ter a versão disponível neste cenário.');
  check((guestCopy.studio!.inventory[seed.id]??0)>0,'Você não tem esta semente na bolsa.');
  if(!hostCopy.studio!.owned.some(e=>e.id===seed.id))hostCopy.studio!.owned.push(structuredClone(seed));
  hostCopy.studio!.inventory[seed.id]=(hostCopy.studio!.inventory[seed.id]??0)+1;
  pinDependencies(hostCopy,seed,entries);
 }else if(c.action==='fish'){
  guestCopy.studio??={owned:[],inventory:{},animals:[],plots:{},structures:[],position:{scene:'farm',x:0,y:0}};
  const previous=guestCopy.studio.position;guestCopy.studio.position={...hostCopy.studio!.position};
  const result=applyStudio(guestCopy,entries,c,now);guestCopy.studio.position=previous;
  visitor.fishing=guestCopy.fishing;visitor.studio??=guestCopy.studio;visitor.studio.fishedAt=guestCopy.studio.fishedAt;return result;
 }
 const result=applyStudio(hostCopy,entries,c,now);
 if(c.action==='pet'){visitor.feed=hostCopy.feed;visitor.supplies=hostCopy.supplies;host.studio!.animals=hostCopy.studio!.animals;}
 else{host.studio!.plots=hostCopy.studio!.plots;host.studio!.owned=hostCopy.studio!.owned;host.studio!.resources=hostCopy.studio!.resources;if(c.action==='plant')visitor.studio!.inventory[c.content]--;}
 return result;
}

export function sharedProjection(host:Farm,entries:StudioEntry[],owner:{code:string;name:string},position:StudioPosition,now:number):SharedStudio{
 const ids=new Set(entries.map(e=>e.id)),s=host.studio!;
 return {owner,visitorCare:host.visitorCare===true,entries,position,calendar:host.calendar,now,players:[],
 plots:Object.fromEntries(Object.entries(s.plots).filter(([key])=>key.startsWith(position.scene+':'))),structures:s.structures.filter(b=>b.scene===position.scene),
 animals:s.animals.filter(p=>ids.has(p.content)&&(p.room===position.scene||p.mode==='follow'&&s.position.scene===position.scene)).map(p=>({...petNeeds(p,entries.find(e=>e.id===p.content)!.definition,now),mode:'stay',room:position.scene}))};
}

export function guestDoor(host:Farm,entries:StudioEntry[],position:StudioPosition,c:Record<string,unknown>){
 const x=integer(c.x,0,63),y=integer(c.y,0,63);check(Math.hypot(x-position.x,y-position.y)<=1.5,'Aproxime-se da porta.');
 const cell=studioCell(host,entries,position.scene,x,y);check(cell?.type==='door','Não há porta aqui.');
 return cell.destination;
}
export function guestSpawn(entries:StudioEntry[],scene:string){const e=entries.find(e=>e.id===scene);check(e?.definition.kind==='scene','Cenário indisponível.');return{scene,...mapSpawn(e.definition),direction:0};}
