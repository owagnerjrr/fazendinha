import{applyLife}from'../src/life-rules.js';
import{settleClimate}from'../src/climate.js';
import{settleVitals}from'../src/living-animals.js';
import {housingProblem,outdoorBox} from '../src/housing.js';
import {settleCoinDebt} from '../src/wallet.js';
import {claimInvitation,settleVerifiedInvitation,referralSummary} from './referrals.js';
import {progressionProblem} from '../src/progression.js';
import {atVendor} from '../src/vendor-sales.js';
import {riverWalkable} from '../src/river-boundary.js';
import {plantNeeds,settlePlant} from '../src/plant-care.js';
import { plotPosition,plotUsable } from '../src/plots.js';
import { requiresNewClient, CLIENT_UPDATE_MESSAGE } from '../src/client-compat.js';
import { initializeProfile } from '../src/profile.js';
import { LIFE_COMMANDS } from '../src/life-rules.js';
import { dogProtects } from '../src/content.js';
import { returnLot, transferLot } from '../src/market.js';
import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool } from './db.js';
import { applyCommand, newOnlineFarm, replenish, type OnlineFarm } from '../src/online-rules.js';
import { soilTime, getPlot, allPlots, upgradeFarm, hasPests, remaining, CROPS, type Crop } from '../src/farm.js';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const codePattern = /^[A-Z0-9]{10}$/;
export class GameError extends Error { constructor(message: string, public status = 400) { super(message); } }
export async function ensureFarm(id: string, name: string,care=false,living=false) {
  const account=await pool.query('SELECT name FROM neon_auth."user" WHERE id=$1 AND banned IS NOT TRUE',[id]);
  if(!account.rowCount) throw new GameError('Conta não encontrada.',401);
  await pool.query('INSERT INTO farms(user_id,name,state) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[id,String(account.rows[0].name || name).slice(0,40),newOnlineFarm(Date.now())]);
  // Add only the missing calendar. Existing state and revision remain intact; simultaneous openings serialize this row update.
  await pool.query("UPDATE farms SET state=jsonb_set(state,'{calendar}',jsonb_build_object('startedAt',floor(extract(epoch FROM now())*1000),'offsetMinutes',0)) WHERE user_id=$1 AND NOT (state ? 'calendar')",[id]);
  if(living)await pool.query("UPDATE farms SET state=jsonb_set(state,'{livingSince}',to_jsonb(floor(extract(epoch FROM now())*1000))) WHERE user_id=$1 AND NOT(state ? 'livingSince')",[id]);
  if(care)await pool.query("UPDATE farms SET state=state || jsonb_build_object('careVersion',1,'careStartedAt',floor(extract(epoch FROM now())*1000)) WHERE user_id=$1 AND NOT (state ? 'careVersion')",[id]);
}
async function getFarm(db: PoolClient, id: string) { const { rows } = await db.query('SELECT * FROM farms WHERE user_id=$1 FOR UPDATE',[id]); if (!rows[0]) throw new GameError('Fazenda não encontrada.',404); upgradeFarm(rows[0].state);return rows[0]; }
export async function snapshot(id:string){await settleVerifiedInvitation(id);const db=await pool.connect();try{await db.query('BEGIN');const row=await getFarm(db,id);const now=Date.now();if(row.state.livingSince!=null){settleClimate(row.state,now);settleVitals(row.state,now);await db.query('UPDATE farms SET state=$2 WHERE user_id=$1',[id,row.state]);}replenish(row.state,now);await db.query('COMMIT');return{farm:row.state,revision:row.revision,code:row.public_code,name:row.name,now};}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}}
export async function community(id: string, marketVersion=1) {
  const friends = await pool.query(`SELECT f.public_code AS code,f.name,r.accepted,(r.recipient=$1) AS incoming FROM friendships r JOIN farms f ON f.user_id=CASE WHEN r.sender=$1 THEN r.recipient ELSE r.sender END WHERE (r.sender=$1 OR r.recipient=$1) AND NOT EXISTS(SELECT 1 FROM social_blocks b WHERE (b.owner=$1 AND b.blocked=f.user_id) OR (b.blocked=$1 AND b.owner=f.user_id)) ORDER BY r.created_at DESC LIMIT 100`,[id]);
  // Older installed PWAs only know crops. Keep their response compatible until they update.
  const market = marketVersion===0?{rows:[]}:await pool.query(`SELECT m.id,m.crop,m.quantity,m.price,(m.seller=$1) AS mine,f.name,f.public_code AS code FROM market_listings m JOIN farms f ON f.user_id=m.seller WHERE m.status='open' AND ($2 OR m.crop IN ('carrot','lettuce','tomato')) ORDER BY (m.seller=$1) DESC,m.created_at DESC LIMIT 60`,[id,marketVersion>=2]);
  const blocked=await pool.query('SELECT f.public_code AS code,f.name FROM social_blocks b JOIN farms f ON f.user_id=b.blocked WHERE b.owner=$1 ORDER BY b.created_at DESC LIMIT 100',[id]);return { friends: friends.rows, blocked:blocked.rows, market: market.rows,referrals:await referralSummary(id) };
}
export async function visit(id: string, code: string) {
  if (!codePattern.test(code)) throw new GameError('Código inválido.');
  const { rows } = await pool.query(`SELECT f.state,f.name,f.public_code AS code FROM farms f WHERE f.public_code=$2 AND EXISTS(SELECT 1 FROM friendships WHERE accepted AND ((sender=$1 AND recipient=f.user_id) OR (recipient=$1 AND sender=f.user_id)))`,[id,code]);
  if (!rows[0]|| (await pool.query('SELECT 1 FROM social_blocks WHERE (owner=$1 AND blocked=(SELECT user_id FROM farms WHERE public_code=$2)) OR (blocked=$1 AND owner=(SELECT user_id FROM farms WHERE public_code=$2))',[id,code])).rowCount) throw new GameError('A visita precisa de uma amizade aceita.',403);
  upgradeFarm(rows[0].state);
  return { unlockedPlots:rows[0].state.unlockedPlots, avatar:rows[0].state.avatar, decorations:rows[0].state.decorations, socialRaids:rows[0].state.socialRaids,animalRaids:rows[0].state.animalRaids===true,protected:dogProtects(rows[0].state.animals,Date.now())||rows[0].state.raidProtectionUntil>Date.now(), plots:allPlots(rows[0].state),landOwned:rows[0].state.landOwned,landParcels:rows[0].state.landParcels,buildings:rows[0].state.buildings,calendar:rows[0].state.calendar,visitorCare:rows[0].state.visitorCare===true,animals:rows[0].state.animals, name: rows[0].name, code: rows[0].code, now: Date.now() };
}
function move(row: any, position: any, now: number) {
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y) || position.x<100 || position.x>1480 || position.y<180 || position.y>1090) throw new GameError('Posição inválida.');
  if(!riverWalkable(position))throw new GameError('Não é possível caminhar sobre a água.');
  const elapsed = Math.max(0,(now-new Date(row.position_at).getTime())/1000);
  if (Math.hypot(position.x-row.state.player.x,position.y-row.state.player.y)>elapsed*190+45) throw new GameError('Movimento rápido demais. Aguarde a sincronização.',409);
  row.state.player={x:position.x,y:position.y};
}
export async function mutate(user: string, body: any, version?: string|null) {
  if (!body || !uuid.test(body.id) || !body.command || typeof body.command !== 'object') throw new GameError('Pedido inválido.');
  const hash = createHash('sha256').update(JSON.stringify({command:body.command,position:body.position,revision:body.revision})).digest('hex');
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    // Serializes the beta economy, including trades involving two farms. Replace with ordered row locks at scale.
    await db.query("SELECT pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'))");
    const row = await getFarm(db,user), now = Date.now();
    if(requiresNewClient(row.state,version))throw new GameError(CLIENT_UPDATE_MESSAGE,409);
    const old = await db.query('SELECT hash,result FROM action_receipts WHERE user_id=$1 AND id=$2',[user,body.id]);
    if (old.rows[0]) {
      if(old.rows[0].hash!==hash) throw new GameError('Identificador já usado em outra ação.',409);
      await db.query('COMMIT'); return { ...old.rows[0].result, farm:row.state,revision:row.revision,now,replayed:true };
    }
    if (body.revision !== row.revision) throw new GameError('Sua fazenda mudou em outro aparelho. Sincronize e tente novamente.',409);
    if(now-new Date(row.last_action_at).getTime()<150) throw new GameError('Aguarde um instante entre as ações.',429);
    const c=body.command;const blocked=progressionProblem(row.state,c);if(blocked)throw new GameError(blocked);
    if(c.type==='initialize-profile'){
      const result=initializeProfile(row.state,c);if(!result.ok)throw new GameError(result.message,result.existing?409:400);
      await claimInvitation(db,user,c.referral,now);
      row.name=row.state.playerName;await db.query('UPDATE farms SET name=$2 WHERE user_id=$1',[user,row.name]);row.result=result;
    }else if(c.type==='position') move(row,body.position,now);
    else if(['work','buy','sell','expand',...LIFE_COMMANDS].includes(c.type)) {
      if(['fertilize','cast-line','reel-line','sell','till-ground'].includes(c.type))move(row,body.position,now);
      if(c.type==='work'||c.type==='fertilize') {
        move(row,body.position,now);
        const point=plotPosition(c.plot,row.state);if(!point)throw new GameError('Canteiro inválido.');
        const {x,y}=point;
        if(Math.hypot(row.state.player.x-x,row.state.player.y-y)>70) throw new GameError('Aproxime-se do canteiro.');
      }
      const result=applyCommand(row.state,c,now); if(!result.ok) throw new GameError(result.message);
      row.result=result;
    } else {if(c.type==='list'){move(row,body.position,now);if(!atVendor(row.state.player))throw new GameError('Vá até a venda para anunciar produtos na feira.');}row.result=await social(db,user,row,c,now);}
    row.result??={ok:true,message:'Posição salva.'};
    // Older cached clients may play before seeing the new welcome flow. Preserve that farm too.
    if(c.type!=='position'&&c.type!=='initialize-profile'&&row.state.profileComplete===false)row.state.profileComplete=true;
    settleCoinDebt(row.state);
    await db.query('UPDATE farms SET state=$2,revision=revision+1,last_action_at=now(),position_at=CASE WHEN $3 THEN now() ELSE position_at END WHERE user_id=$1',[user,row.state,['position','work','fertilize','cast-line','reel-line','sell','list','till-ground'].includes(c.type)]);
    await db.query('INSERT INTO action_receipts(user_id,id,hash,result) VALUES($1,$2,$3,$4)',[user,body.id,hash,row.result]);
    await db.query('COMMIT');
    return {...row.result,farm:row.state,revision:row.revision+1,name:row.name,now};
  } catch(error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
}
async function social(db:PoolClient,user:string,row:any,c:any,now:number) {
  if(['friend','accept','decline','cancel-friend','unfriend','block','unblock','help','steal','steal-animal','visit-animal-care'].includes(c.type)) {
    if(typeof c.code!=='string'||!codePattern.test(c.code)) throw new GameError('Código inválido.');
    const target=(await db.query('SELECT * FROM farms WHERE public_code=$1 FOR UPDATE',[c.code])).rows[0];
    if(target)upgradeFarm(target.state);
    if(!target||target.user_id===user) throw new GameError('Escolha o código de outro jogador.');
    if(c.type==='unblock'){await db.query('DELETE FROM social_blocks WHERE owner=$1 AND blocked=$2',[user,target.user_id]);return{ok:true,message:'Contato desbloqueado. Envie um novo pedido para voltar a ser amigo.'};}
    if(c.type==='block'){await db.query('INSERT INTO social_blocks(owner,blocked) VALUES($1,$2) ON CONFLICT DO NOTHING',[user,target.user_id]);await db.query('DELETE FROM friendships WHERE (sender=$1 AND recipient=$2) OR (sender=$2 AND recipient=$1)',[user,target.user_id]);return{ok:true,message:'Contato bloqueado. Pedidos, visitas e chat interrompidos.'};}
    const blocked=await db.query('SELECT 1 FROM social_blocks WHERE (owner=$1 AND blocked=$2) OR (owner=$2 AND blocked=$1)',[user,target.user_id]);if(blocked.rowCount)throw new GameError('Este contato não está disponível.',403);
    if(c.type==='decline'||c.type==='cancel-friend'||c.type==='unfriend'){const extra=c.type==='decline'?'sender=$2 AND recipient=$1 AND NOT accepted':c.type==='cancel-friend'?'sender=$1 AND recipient=$2 AND NOT accepted':'accepted AND ((sender=$1 AND recipient=$2) OR (sender=$2 AND recipient=$1))';const r=await db.query(`DELETE FROM friendships WHERE ${extra}`,[user,target.user_id]);if(!r.rowCount)throw new GameError('Pedido ou amizade não encontrado.');return{ok:true,message:c.type==='unfriend'?'Amizade removida.':'Pedido encerrado.'};}
    if(c.type==='friend') {
      const exists=await db.query('SELECT 1 FROM friendships WHERE (sender=$1 AND recipient=$2) OR (sender=$2 AND recipient=$1)',[user,target.user_id]);
      if(exists.rowCount) throw new GameError('Vocês já têm um pedido ou uma amizade.');
      await db.query('INSERT INTO friendships(sender,recipient) VALUES($1,$2)',[user,target.user_id]);
      return {ok:true,message:'Pedido de amizade enviado.'};
    }
    if(c.type==='accept') {
      const r=await db.query('UPDATE friendships SET accepted=true WHERE sender=$1 AND recipient=$2 AND NOT accepted',[target.user_id,user]);
      if(!r.rowCount) throw new GameError('Pedido não encontrado.');
      return {ok:true,message:'Amizade aceita! Vocês já podem visitar as fazendas.'};
    }
    const allowed=await db.query('SELECT 1 FROM friendships WHERE accepted AND ((sender=$1 AND recipient=$2) OR (sender=$2 AND recipient=$1))',[user,target.user_id]);
    if(!allowed.rowCount) throw new GameError('Aceitem a amizade antes de ajudar.',403);
    if(c.type==='visit-animal-care'){
 if(target.state.visitorCare!==true)throw new GameError('O dono não permitiu cuidados por visitantes.',403);
 if(!['feed-animal','water-animal','pet-animal','play-animal','clean-animal'].includes(c.mode))throw new GameError('Cuidado de visitante inválido.');
 const animal=target.state.animals.find((a:any)=>a.id===c.animal);if(!animal)throw new GameError('Animal não encontrado.');const building=target.state.buildings?.find((b:any)=>b.id===animal.housing),box=building?outdoorBox(building):null,spot=box?{x:box.x+box.width/2,y:box.y+box.height+20}:{x:1050,y:840};const nearby=await db.query("SELECT 1 FROM farm_presence WHERE user_id=$1 AND owner_id=$2 AND updated_at>now()-interval '12 seconds' AND sqrt(power(x-$3,2)+power(y-$4,2))<180",[user,target.user_id,spot.x,spot.y]);if(!nearby.rowCount)throw new GameError('Entre no celeiro do amigo para cuidar.');
 const host=structuredClone(target.state);settleVitals(host,now);host.feed=row.state.feed;host.supplies={...row.state.supplies};const result=applyLife(host,{type:c.mode,id:c.animal},now);if(!result.ok)throw new GameError(result.message);row.state.feed=host.feed;row.state.supplies=host.supplies;target.state.animals=host.animals;
 await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[target.user_id,target.state]);await db.query("INSERT INTO social_notifications(user_id,actor_id,kind) VALUES($1,$2,'visit_help')",[target.user_id,user]);return result;
 }
 if(c.type==='steal-animal')throw new GameError('Animais pertencem ao dono. Visitantes podem apenas cuidar.',403);
 if(c.type==='steal-animal'){
      if(!row.state.animalRaids||!target.state.animalRaids)throw new GameError('Os dois amigos precisam ativar o roubo de animais separadamente.');
      const animal=target.state.animals.find((a:any)=>a.id===c.animal);
      if(!row.state.socialRaids||!target.state.socialRaids)throw new GameError('Os dois amigos precisam ativar a brincadeira de roubo.');
      if(dogProtects(target.state.animals,now)||target.state.raidProtectionUntil>now)throw new GameError('Esta fazenda está protegida.');
      if(!animal||animal.kind==='dog'||animal.incubationAt!=null||target.state.animals.length<=1)throw new GameError('Este animal não pode ser levado. O último animal sempre fica com o dono.');
      if(row.state.animals.some((a:any)=>a.id===animal.id))throw new GameError('Este animal já está na sua fazenda.');
      const space=housingProblem(row.state,animal.kind,'barn');if(space)throw new GameError(space);
      const habitat=animal.housing&&animal.housing!=='barn'?target.state.buildings?.find((b:any)=>b.id===animal.housing):null;
      if(animal.housing&&animal.housing!=='barn'&&!habitat)throw new GameError('Instalação não encontrada.');
      const box=habitat?outdoorBox(habitat):null,animalPoint=box?{x:box.x+box.width/2,y:box.y+box.height+20}:{x:1050,y:795};
      const live=await db.query("SELECT 1 FROM farm_presence WHERE user_id=$1 AND owner_id=$2 AND updated_at>now()-interval '12 seconds' AND sqrt(power(x-$3,2)+power(y-$4,2))<180",[user,target.user_id,animalPoint.x,animalPoint.y]);if(!live.rowCount)throw new GameError('Visite a fazenda e aproxime-se do celeiro.');
      if((await db.query('SELECT 1 FROM farm_raids WHERE visitor=$1 AND owner=$2 AND day=$3',[user,target.user_id,new Date(now).toISOString().slice(0,10)])).rowCount)throw new GameError('Você já pegou algo deste amigo hoje.');
      target.state.animals=target.state.animals.filter((a:any)=>a.id!==animal.id);row.state.animals.push({...animal,housing:'barn'});target.state.raidProtectionUntil=now+86400000;
      await db.query('INSERT INTO farm_raids(visitor,owner,day,plot) VALUES($1,$2,$3,-1)',[user,target.user_id,new Date(now).toISOString().slice(0,10)]);
      target.state.visitLog.unshift({name:row.name,action:'levou um animal na brincadeira',at:now});target.state.visitLog=target.state.visitLog.slice(0,20);
      await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[target.user_id,target.state]);
      await db.query("INSERT INTO social_notifications(user_id,actor_id,kind) VALUES($1,$2,'visit_steal')",[target.user_id,user]);
      return{ok:true,message:'Animal levado para seu celeiro. O amigo ganhou 24 horas de proteção.'};
    }
    if(!Number.isInteger(c.plot)||c.plot<0||!plotUsable(target.state,c.plot)) throw new GameError('Canteiro inválido.');
    if(!plotUsable(target.state,c.plot))throw new GameError('Este espaço não está disponível para cultivo.');
    const spot=plotPosition(c.plot,target.state)!;
    const nearby=await db.query("SELECT 1 FROM farm_presence WHERE user_id=$1 AND owner_id=$2 AND updated_at>now()-interval '12 seconds' AND sqrt(power(x-$3,2)+power(y-$4,2))<=80",[user,target.user_id,spot.x,spot.y]);
    if(!nearby.rowCount)throw new GameError('Visite a fazenda e aproxime-se do canteiro.');
    const plot=getPlot(target.state,c.plot)!;
    const day=new Date(now).toISOString().slice(0,10);
    if(c.type==='steal'){
      if(!row.state.socialRaids||!target.state.socialRaids)throw new GameError('Os dois amigos precisam ativar a brincadeira de roubo.');
      if(dogProtects(target.state.animals,now)||target.state.raidProtectionUntil>now)throw new GameError('Esta fazenda está protegida. O cachorro está de olho!');
      if(!plot.crop||remaining(plot,now)!==0||plantNeeds(plot,now).dry||plantNeeds(plot,now).sick||hasPests(plot,now)||(plot.stolen??0)>=1)throw new GameError('Escolha uma colheita madura e ainda não beliscada.');
      const used=await db.query('SELECT 1 FROM farm_raids WHERE visitor=$1 AND owner=$2 AND day=$3',[user,target.user_id,day]);if(used.rowCount)throw new GameError('Você já pegou um produto deste amigo hoje.');
      row.state.inventory[plot.crop as Crop]++;plot.stolen=(plot.stolen??0)+1;target.state.raidProtectionUntil=now+3600000;
      await db.query('INSERT INTO farm_raids(visitor,owner,day,plot) VALUES($1,$2,$3,$4)',[user,target.user_id,day,c.plot]);
      target.state.visitLog.unshift({name:row.name,action:'pegou 1 produto maduro',at:now});target.state.visitLog=target.state.visitLog.slice(0,20);
      await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[target.user_id,target.state]);
      await db.query("INSERT INTO social_notifications(user_id,actor_id,kind) VALUES($1,$2,'visit_steal')",[target.user_id,user]);
      return {ok:true,message:'Você pegou 1 produto! O amigo mantém pelo menos 2 e ganha 1 hora de proteção.'};
    }
    const mode=c.mode??'water';if(!['hoe','plant','water','clean'].includes(mode))throw new GameError('Ajuda inválida.');
    const used=await db.query('SELECT 1 FROM farm_help WHERE helper=$1 AND owner=$2 AND day=$3 AND plot=$4 AND mode=$5',[user,target.user_id,day,c.plot,mode]);
    const helpXp=used.rowCount?0:5; // Repeat useful care, but award XP once per plot/action/day.
    let action='regou uma plantação';
    if(mode==='hoe'){if(plot.crop||plot.tilled)throw new GameError('Escolha terra vazia que ainda não foi preparada.');plot.tilled=true;plot.tilledAt=soilTime(target.state,now);action='preparou a terra';
    }else if(mode==='plant'){
      if(plot.crop||!Object.hasOwn(CROPS,c.crop)||row.state.seeds[c.crop as Crop]<1)throw new GameError('Canteiro ocupado ou semente indisponível.');
      row.state.seeds[c.crop as Crop]--;plot.tilled=true;plot.crop=c.crop;plot.growthDurationMs=CROPS[c.crop as Crop].seconds*1000;plot.wateredAt=null;plot.pestAt=null;plot.stolen=0;if(target.state.careVersion)plot.care={startedAt:now,lastWateredAt:null,growthMs:0,checkpointAt:now,illnessAt:null};action='plantou uma semente';
    }else if(mode==='clean'){
      if(!hasPests(plot,now))throw new GameError('Esta plantação não tem pragas.');settlePlant(plot,now);plot.pestAt=null;action='removeu pragas';
    }else{
      if(!plot.crop||plot.wateredAt!==null&&plantNeeds(plot,now).water>=100)throw new GameError('Escolha uma plantação precisando de água.');if(plot.care){settlePlant(plot,now);plot.care.lastWateredAt=now;plot.care.checkpointAt=now;}plot.wateredAt??=now;
    }
    row.state.xp+=helpXp;
    await db.query('INSERT INTO farm_help(helper,owner,day,plot,mode) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[user,target.user_id,day,c.plot,mode]);
    target.state.visitLog.unshift({name:row.name,action,at:now});target.state.visitLog=target.state.visitLog.slice(0,20);
    await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[target.user_id,target.state]);
    await db.query("INSERT INTO social_notifications(user_id,actor_id,kind) VALUES($1,$2,'visit_help')",[target.user_id,user]);
    return {ok:true,message:helpXp?'Ajuda concluída! +5 XP pela amizade.':'Ajuda concluída! Seu amigo já pode continuar cuidando da plantação.'};
  }
  if(c.type==='return-market-reservations'){
    const reserved=await db.query("SELECT * FROM market_listings WHERE seller=$1 AND status='open' FOR UPDATE",[user]);
    for(const listing of reserved.rows){const r=returnLot(row.state,listing);if(!r.ok)throw new GameError(r.message);await db.query("UPDATE market_listings SET status='cancelled' WHERE id=$1",[listing.id]);}
    return{ok:true,message:reserved.rows.length?'Seus produtos reservados voltaram ao inventário.':'Você não tem produtos reservados.'};
  }
  if(c.type==='list')throw new GameError('A feira foi encerrada. Venda seus produtos no Vartin.');
  if(c.type==='trade'||c.type==='cancel-listing') {
    if(!uuid.test(c.listing)) throw new GameError('Oferta inválida.');
    const listing=(await db.query("SELECT * FROM market_listings WHERE id=$1 AND status='open' FOR UPDATE",[c.listing])).rows[0];
    if(!listing) throw new GameError('Esta oferta já foi vendida ou cancelada.',409);
    if(c.type==='cancel-listing') {
      if(listing.seller!==user) throw new GameError('Esta oferta não é sua.',403);
      const result=returnLot(row.state,listing);if(!result.ok)throw new GameError(result.message);
      await db.query("UPDATE market_listings SET status='cancelled' WHERE id=$1",[listing.id]);
      return {ok:true,message:'Oferta cancelada. Produtos devolvidos ao celeiro.'};
    }
    if(listing.seller===user) throw new GameError('Você não pode comprar sua própria oferta.');
    const seller=await getFarm(db,listing.seller);
    const result=transferLot(row.state,seller.state,listing);if(!result.ok)throw new GameError(result.message);
    await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[listing.seller,seller.state]);
    await db.query("UPDATE market_listings SET status='sold',buyer=$2 WHERE id=$1",[listing.id,user]);
    return {ok:true,message:'Compra feita! Os produtos estão no seu celeiro.'};
  }
  throw new GameError('Ação desconhecida.');
}
