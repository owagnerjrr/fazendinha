import type{PoolClient}from'pg';
import{pool}from'./db.js';
import{identity}from'./auth.js';
import{catalogFor}from'./studio.js';
import{assetReferences}from'./studio-media.js';
import{check,uuid}from'../src/studio-schema.js';
import{studioEntries}from'../src/studio-runtime.js';
import{validAvatar}from'../src/content.js';
import{sharedEntries,sharedProjection,guestSpawn,guestDoor,visitPosition,applyStudioGuest,safeGuestPosition,type StudioPosition}from'../src/studio-visit-rules.js';
import type{Farm}from'../src/farm.js';

async function context(db:PoolClient,user:string,code:unknown,lock=false){
 check(typeof code==='string'&&/^[A-F0-9]{10}$/.test(code),'Código de amigo inválido.');
 const host=(await db.query(`SELECT f.user_id,f.public_code,f.name,${lock?'f.state':"jsonb_build_object('studio',f.state->'studio','calendar',f.state->'calendar','visitorCare',f.state->'visitorCare')"} AS state FROM farms f JOIN neon_auth."user" u ON u.id::text=f.user_id WHERE f.public_code=$2 AND NOT coalesce(u.banned,false) AND NOT EXISTS(SELECT 1 FROM studio_account_blocks WHERE user_id=f.user_id) AND (f.user_id=$1 OR EXISTS(SELECT 1 FROM friendships WHERE accepted AND ((sender=$1 AND recipient=f.user_id) OR (recipient=$1 AND sender=f.user_id)))) AND NOT EXISTS(SELECT 1 FROM social_blocks WHERE (owner=$1 AND blocked=f.user_id) OR (blocked=$1 AND owner=f.user_id)) ${lock?'FOR UPDATE OF f':''}`,[user,code])).rows[0];
 check(host,'A visita precisa de amizade aceita e sem bloqueios.');
 const visitor=host.user_id===user?host:(await db.query("SELECT jsonb_build_object('studio',state->'studio') AS state FROM farms WHERE user_id=$1",[user])).rows[0];check(visitor,'Entre no jogo primeiro.');
 const ownCatalog=host.user_id===user&&!lock?[]:await catalogFor(db,host.user_id),visitorCatalog=host.user_id===user?ownCatalog:await catalogFor(db,user);
 return{host,ownCatalog,visitorEntries:studioEntries(visitor.state,visitorCatalog)};
}
async function peers(db:PoolClient,user:string,owner:string,scene:string){
 const rows=(await db.query(`SELECT f.public_code AS code,f.name,f.state->'avatar' AS avatar,f.state->'wardrobe'->>'equipped' AS outfit,p.x,p.y,p.direction FROM studio_presence p JOIN farms f ON f.user_id=p.user_id WHERE p.owner_id=$2 AND p.scene=$3 AND p.user_id<>$1 AND p.updated_at>now()-interval '12 seconds' AND (p.user_id=$2 OR EXISTS(SELECT 1 FROM friendships WHERE accepted AND ((sender=p.user_id AND recipient=$2) OR (recipient=p.user_id AND sender=$2)))) AND NOT EXISTS(SELECT 1 FROM social_blocks WHERE (owner=$1 AND blocked=p.user_id) OR (blocked=$1 AND owner=p.user_id) OR (owner=$2 AND blocked=p.user_id) OR (blocked=$2 AND owner=p.user_id)) AND NOT EXISTS(SELECT 1 FROM studio_account_blocks WHERE user_id=p.user_id) ORDER BY p.updated_at DESC LIMIT 20`,[user,owner,scene])).rows;
 return rows.filter(p=>validAvatar(p.avatar)).map(p=>({...p,avatar:{...p.avatar,...(p.outfit?{outfit:p.outfit}:{})}}));
}
async function savePresence(db:PoolClient,user:string,owner:string,p:StudioPosition){await db.query('INSERT INTO studio_presence(user_id,owner_id,scene,x,y,direction) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET owner_id=$2,scene=$3,x=$4,y=$5,direction=$6,updated_at=now()',[user,owner,p.scene,p.x,p.y,p.direction??0]);}

export async function readStudioVisit(request:Request){const user=await identity(request),url=new URL(request.url),db=await pool.connect();try{
 const ctx=await context(db,user.id,url.searchParams.get('visit')),scene=url.searchParams.get('scene');
 if(!scene){const scenes=[];for(const e of ctx.host.state.studio?.owned??[]){if(e.definition.kind!=='scene'||e.definition.data.visitable!==true)continue;try{sharedEntries(ctx.host.state,ctx.ownCatalog,ctx.visitorEntries,e.id);scenes.push({id:e.id,name:e.definition.name});}catch{}}
 return{owner:{code:ctx.host.public_code,name:ctx.host.name},scenes};}
 check(uuid(scene),'Cenário inválido.');const entries=sharedEntries(ctx.host.state,ctx.ownCatalog,ctx.visitorEntries,scene);
 const p=(await db.query('SELECT scene,x,y,direction FROM studio_presence WHERE user_id=$1 AND owner_id=$2 AND scene=$3 AND updated_at>now()-interval \'12 seconds\'',[user.id,ctx.host.user_id,scene])).rows[0]??guestSpawn(entries,scene);
 const projection=sharedProjection(ctx.host.state,entries,{code:ctx.host.public_code,name:ctx.host.name},safeGuestPosition(ctx.host.state,entries,p),Date.now());projection.players=await peers(db,user.id,ctx.host.user_id,scene);return projection;
 }finally{db.release();}}

export async function scenePresence(user:string,input:Record<string,any>){const db=await pool.connect();try{
 if(input.leave===true){await db.query('DELETE FROM studio_presence WHERE user_id=$1',[user]);return{players:[]};}
 const ctx=await context(db,user,input.code);check(uuid(input.scene),'Cenário inválido.');
 let p:StudioPosition;let entries:ReturnType<typeof sharedEntries>|undefined;if(ctx.host.user_id===user){p=ctx.host.state.studio?.position;check(p?.scene===input.scene,'Entre neste cenário primeiro.');}
 else{entries=sharedEntries(ctx.host.state,ctx.ownCatalog,ctx.visitorEntries,input.scene);p=(await db.query('SELECT scene,x,y,direction FROM studio_presence WHERE user_id=$1 AND owner_id=$2 AND scene=$3 AND updated_at>now()-interval \'12 seconds\'',[user,ctx.host.user_id,input.scene])).rows[0];check(p,'Sua visita terminou. Entre novamente.');p=safeGuestPosition(ctx.host.state,entries,p);}
 await savePresence(db,user,ctx.host.user_id,p);const players=await peers(db,user,ctx.host.user_id,p.scene);if(entries){const visit=sharedProjection(ctx.host.state,entries,{code:ctx.host.public_code,name:ctx.host.name},p,Date.now());visit.players=players;return{players,visit};}return{players};
 }finally{db.release();}}

// Called inside the existing economy transaction and receipt. No extra mutable endpoint.
export async function mutateStudioVisit(db:PoolClient,user:string,visitor:Farm,c:Record<string,any>,now:number){
 const ctx=await context(db,user,c.code,true);check(ctx.host.user_id!==user,'Use suas ferramentas na sua própria área.');check(uuid(c.scene),'Cenário inválido.');
 const entries=sharedEntries(ctx.host.state,ctx.ownCatalog,ctx.visitorEntries,c.scene),stored=(await db.query('SELECT scene,x,y,direction,updated_at FROM studio_presence WHERE user_id=$1 AND owner_id=$2 FOR UPDATE',[user,ctx.host.user_id])).rows[0];
 let p:StudioPosition=stored,changed=false,message='';
 if(c.action==='enter'){p=stored?.scene===c.scene&&now-Number(new Date(stored.updated_at))<12000?stored:guestSpawn(entries,c.scene);message='Você chegou ao cenário de '+ctx.host.name+'.';}
 else{
  check(stored?.scene===c.scene&&now-Number(new Date(stored.updated_at))<12000,'A visita terminou. Entre novamente.');
  const safe=safeGuestPosition(ctx.host.state,entries,p);if(safe.x!==p.x||safe.y!==p.y){await savePresence(db,user,ctx.host.user_id,safe);return{ok:true,message:'A área mudou. Você voltou à entrada em segurança.',studioVisit:safe};}
  if(c.action==='move'){p=visitPosition(ctx.host.state,entries,p,c);message='Posição da visita salva.';}
  else if(c.action==='door'){
   const destination=guestDoor(ctx.host.state,entries,p,c);if(destination==='farm'){await db.query('DELETE FROM studio_presence WHERE user_id=$1',[user]);return{ok:true,message:'Visita encerrada.',studioVisit:{exit:true}};}
   check(uuid(destination),'Destino inválido.');const target=sharedEntries(ctx.host.state,ctx.ownCatalog,ctx.visitorEntries,destination);p=guestSpawn(target,destination);message='Passagem concluída.';
  }else{const result=applyStudioGuest(ctx.host.state,visitor,entries,p,c,now);changed=c.action!=='fish';message=result.message;}
 }
 if(changed){await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[ctx.host.user_id,ctx.host.state]);await db.query("INSERT INTO social_notifications(user_id,actor_id,kind) VALUES($1,$2,'visit_help')",[ctx.host.user_id,user]);await db.query("INSERT INTO player_events(user_id,kind,area,details) VALUES($1,'studio-guest-care',$2,$3)",[ctx.host.user_id,p.scene,{visitor:c.code===undefined?'':(await db.query('SELECT public_code FROM farms WHERE user_id=$1',[user])).rows[0].public_code,action:c.action,mode:c.mode??null}]);}
 await savePresence(db,user,ctx.host.user_id,p);return{ok:true,message,studioVisit:p};
}

export async function visitAsset(request:Request){const user=await identity(request),url=new URL(request.url),db=await pool.connect();try{const ctx=await context(db,user.id,url.searchParams.get('visit')),scene=url.searchParams.get('scene');check(uuid(scene),'Cenário inválido.');const entries=sharedEntries(ctx.host.state,ctx.ownCatalog,ctx.visitorEntries,scene),asset=url.searchParams.get('asset'),version=Number(url.searchParams.get('version'));check(uuid(asset)&&assetReferences(entries).some(r=>r.id===asset&&r.version===version),'Recurso não disponível para esta visita.');const row=(await db.query('SELECT mime,bytes FROM studio_asset_versions WHERE asset_id=$1 AND version=$2',[asset,version])).rows[0];check(row,'Recurso não encontrado.');return{mime:row.mime,data:row.bytes.toString('base64')};}finally{db.release();}}
