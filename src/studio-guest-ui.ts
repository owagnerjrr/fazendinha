import type{Farm}from'./farm';
import type{SharedStudio}from'./studio-visit-rules';
import{StudioWorldView,type WorldServices}from'./studio-world-view';
import{loadEntryAssets}from'./studio-assets-client';
import{effectsAudio}from'./sound';

type Services={farm:()=>Farm;request:(path:string,body?:unknown)=>Promise<any>;command:(c:Record<string,unknown>)=>Promise<any>;open:(title:string,html:string)=>void;close:()=>void;toast:(s:string)=>void;avatar:WorldServices['avatar'];peerAvatar:WorldServices['peerAvatar'];now:()=>number};
export function studioGuestUI(s:Services){
 let data:SharedStudio|undefined,view:StudioWorldView|undefined,timer:ReturnType<typeof setInterval>|undefined,code='',busy=false,epoch=0,polling=false;
 const path=(scene?:string)=>'?visit='+encodeURIComponent(code)+(scene?'&scene='+encodeURIComponent(scene):'');
 const composite=():Farm=>data?{...s.farm(),calendar:data.calendar,studio:{owned:data.entries,resources:[],inventory:{...(s.farm().studio?.inventory??{})},animals:data.animals,structures:data.structures,plots:data.plots,position:data.position}}:s.farm();
 function mount(){if(!data||!document.getElementById('studio-guest-panel'))return;view?.destroy();view=new StudioWorldView(document.getElementById('studio-guest-panel')!,{farm:composite,catalog:[],command,message:s.toast,avatar:s.avatar,peerAvatar:s.peerAvatar,peers:()=>data?.players??[],now:s.now,guest:{care:data!.visitorCare,products:()=>{const f=s.farm();return(f.studio?.owned??[]).filter(e=>e.definition.kind==='item'&&['feed','heal'].includes(String(e.definition.data.action))&&(f.studio?.inventory[e.id]??0)>0).map(entry=>({entry,quantity:f.studio!.inventory[entry.id]}));}},exit:s.close});}
 async function assets(){if(data)await loadEntryAssets(data.entries,false,'&visit='+encodeURIComponent(code)+'&scene='+data.position.scene);}
 function navigation(){if(data)sessionStorage.setItem('wj-studio-visit',JSON.stringify({code,scene:data.position.scene}));}
 function destroy(){const hadActive=!!data||!!view;epoch++;view?.destroy();view=undefined;data=undefined;busy=false;if(timer)clearInterval(timer);timer=undefined;sessionStorage.removeItem('wj-studio-visit');return hadActive?s.request('',{type:'scene-presence',leave:true}).catch(()=>{}):Promise.resolve();}
 async function poll(){if(!data||busy||polling||document.hidden)return;polling=true;const current=epoch,scene=data.position.scene;try{
  const response=await s.request('',{type:'scene-presence',code,scene});const fresh:SharedStudio=response.visit??await s.request(path(scene));if(current!==epoch||!data)return;const changed=data.visitorCare!==fresh.visitorCare;data=fresh;await assets();if(current===epoch&&changed)mount();
 }catch(e){if(current!==epoch)return;if((e as {status?:number}).status===403||(e as {status?:number}).status===400){destroy();s.close();s.toast('A visita terminou ou as permissões mudaram.');}}finally{polling=false;}}
 async function command(c:Record<string,any>){if(busy||!data)throw Error('Aguarde a visita sincronizar.');busy=true;epoch++;try{
  if(c.action==='travel'&&c.content==='farm'){await s.request('',{type:'scene-presence',leave:true});data.position={scene:'farm',x:0,y:0};return{message:'Você voltou da visita.'};}
  const result=await s.command({...c,type:'studio-visit',code,scene:data.position.scene});
  if(result.studioVisit?.exit){data.position={scene:'farm',x:0,y:0};return result;}
  const previousScene=data.position.scene;data=await s.request(path(result.studioVisit?.scene??data.position.scene));await assets();if(data&&previousScene!==data.position.scene)mount();navigation();
  const sound={hoe:'hoe',plant:'seed',water:'water',pet:'hand',fish:'hand'} as const;if(c.action in sound)effectsAudio.play(sound[c.action as keyof typeof sound]);return result;
 }finally{busy=false;}}
 async function enter(nextCode:string,scene:string){if(busy)throw Error('Aguarde a visita anterior.');await destroy();code=nextCode;busy=true;const operation=epoch;try{
  await s.command({type:'studio-visit',action:'enter',code,scene});if(operation!==epoch)return;data=await s.request(path(scene));if(operation!==epoch)return;await assets();if(operation!==epoch||!data)return;navigation();
  s.open('Visita · '+data!.owner.name,'<div id="studio-guest-panel"></div>');
  mount();timer=setInterval(()=>void poll(),2000);
 }catch(e){if(operation===epoch)await destroy();throw e;}finally{if(operation===epoch)busy=false;}}
 async function open(nextCode:string){await destroy();code=nextCode;const list=await s.request(path());s.open('Cenários de '+list.owner.name,'<div id="studio-guest-panel"></div>');const root=document.getElementById('studio-guest-panel')!;
  const p=document.createElement('p');p.textContent=list.scenes.length?'Escolha uma área liberada. Seus bens continuam na sua própria fazenda.':'Não há cenários abertos e compatíveis com as suas permissões de conteúdo.';root.append(p);
  for(const area of list.scenes){const b=document.createElement('button');b.textContent='Visitar '+area.name;b.onclick=()=>{b.disabled=true;void enter(nextCode,area.id).catch(e=>{b.disabled=false;s.toast(e.message);});};root.append(b);}
 }
 async function resume(){const raw=sessionStorage.getItem('wj-studio-visit');if(!raw)return;try{const p=JSON.parse(raw);if(typeof p.code==='string'&&typeof p.scene==='string')await enter(p.code,p.scene);else sessionStorage.removeItem('wj-studio-visit');}catch(e){destroy();s.toast((e as Error).message);}}
 return{open,resume,destroy,currentFarm:()=>data?composite():undefined,active:()=>!!data};
}
