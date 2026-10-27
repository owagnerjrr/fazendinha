import { plotPosition } from '../src/plots.js';
import { requiresNewClient, CLIENT_UPDATE_MESSAGE } from '../src/client-compat.js';
import { initializeProfile } from '../src/profile.js';
import { LIFE_COMMANDS } from '../src/life-rules.js';
import { dogProtects } from '../src/content.js';
import { reserveLot, returnLot, transferLot } from '../src/market.js';
import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool } from './db.js';
import { applyCommand, newOnlineFarm, replenish, type OnlineFarm } from '../src/online-rules.js';
import { upgradeFarm, hasPests, remaining, CROPS, type Crop } from '../src/farm.js';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const codePattern = /^[A-Z0-9]{10}$/;
export class GameError extends Error { constructor(message: string, public status = 400) { super(message); } }
export async function ensureFarm(id: string, name: string) {
  const account=await pool.query('SELECT name FROM neon_auth."user" WHERE id=$1 AND banned IS NOT TRUE',[id]);
  if(!account.rowCount) throw new GameError('Conta não encontrada.',401);
  await pool.query('INSERT INTO farms(user_id,name,state) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[id,String(account.rows[0].name || name).slice(0,40),newOnlineFarm(Date.now())]);
}
async function getFarm(db: PoolClient, id: string) { const { rows } = await db.query('SELECT * FROM farms WHERE user_id=$1 FOR UPDATE',[id]); if (!rows[0]) throw new GameError('Fazenda não encontrada.',404); upgradeFarm(rows[0].state);return rows[0]; }
export async function snapshot(id: string) {
  const { rows } = await pool.query('SELECT state,revision,public_code,name FROM farms WHERE user_id=$1',[id]);
  const row = rows[0]; upgradeFarm(row.state);replenish(row.state,Date.now());
  return { farm: row.state, revision: row.revision, code: row.public_code, name: row.name, now: Date.now() };
}
export async function community(id: string, marketVersion=1) {
  const friends = await pool.query(`SELECT f.public_code AS code,f.name,r.accepted,(r.recipient=$1) AS incoming FROM friendships r JOIN farms f ON f.user_id=CASE WHEN r.sender=$1 THEN r.recipient ELSE r.sender END WHERE r.sender=$1 OR r.recipient=$1 ORDER BY r.created_at DESC LIMIT 100`,[id]);
  // Older installed PWAs only know crops. Keep their response compatible until they update.
  const market = await pool.query(`SELECT m.id,m.crop,m.quantity,m.price,(m.seller=$1) AS mine,f.name,f.public_code AS code FROM market_listings m JOIN farms f ON f.user_id=m.seller WHERE m.status='open' AND ($2 OR m.crop IN ('carrot','lettuce','tomato')) ORDER BY (m.seller=$1) DESC,m.created_at DESC LIMIT 60`,[id,marketVersion>=2]);
  return { friends: friends.rows, market: market.rows };
}
export async function visit(id: string, code: string) {
  if (!codePattern.test(code)) throw new GameError('Código inválido.');
  const { rows } = await pool.query(`SELECT f.state,f.name,f.public_code AS code FROM farms f WHERE f.public_code=$2 AND EXISTS(SELECT 1 FROM friendships WHERE accepted AND ((sender=$1 AND recipient=f.user_id) OR (recipient=$1 AND sender=f.user_id)))`,[id,code]);
  if (!rows[0]) throw new GameError('A visita precisa de uma amizade aceita.',403);
  upgradeFarm(rows[0].state);
  return { unlockedPlots:rows[0].state.unlockedPlots, avatar:rows[0].state.avatar, decorations:rows[0].state.decorations, socialRaids:rows[0].state.socialRaids,protected:dogProtects(rows[0].state.animals,Date.now())||rows[0].state.raidProtectionUntil>Date.now(), plots: rows[0].state.plots, name: rows[0].name, code: rows[0].code, now: Date.now() };
}
function move(row: any, position: any, now: number) {
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y) || position.x<100 || position.x>1480 || position.y<180 || position.y>1090) throw new GameError('Posição inválida.');
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
    const c=body.command;
    if(c.type==='initialize-profile'){
      const result=initializeProfile(row.state,c);if(!result.ok)throw new GameError(result.message,result.existing?409:400);
      row.name=row.state.playerName;await db.query('UPDATE farms SET name=$2 WHERE user_id=$1',[user,row.name]);row.result=result;
    }else if(c.type==='position') move(row,body.position,now);
    else if(['work','buy','sell','expand',...LIFE_COMMANDS].includes(c.type)) {
      if(c.type==='work') {
        move(row,body.position,now);
        const point=plotPosition(c.plot);if(!point)throw new GameError('Canteiro inválido.');
        const {x,y}=point;
        if(Math.hypot(row.state.player.x-x,row.state.player.y-y)>70) throw new GameError('Aproxime-se do canteiro.');
      }
      const result=applyCommand(row.state,c,now); if(!result.ok) throw new GameError(result.message);
      row.result=result;
    } else row.result=await social(db,user,row,c,now);
    row.result??={ok:true,message:'Posição salva.'};
    // Older cached clients may play before seeing the new welcome flow. Preserve that farm too.
    if(c.type!=='position'&&c.type!=='initialize-profile'&&row.state.profileComplete===false)row.state.profileComplete=true;
    await db.query('UPDATE farms SET state=$2,revision=revision+1,last_action_at=now(),position_at=CASE WHEN $3 THEN now() ELSE position_at END WHERE user_id=$1',[user,row.state,c.type==='position'||c.type==='work']);
    await db.query('INSERT INTO action_receipts(user_id,id,hash,result) VALUES($1,$2,$3,$4)',[user,body.id,hash,row.result]);
    await db.query('COMMIT');
    return {...row.result,farm:row.state,revision:row.revision+1,name:row.name,now};
  } catch(error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
}
async function social(db:PoolClient,user:string,row:any,c:any,now:number) {
  if(c.type==='friend'||c.type==='accept'||c.type==='help'||c.type==='steal') {
    if(typeof c.code!=='string'||!codePattern.test(c.code)) throw new GameError('Código inválido.');
    const target=(await db.query('SELECT * FROM farms WHERE public_code=$1',[c.code])).rows[0];
    if(target)upgradeFarm(target.state);
    if(!target||target.user_id===user) throw new GameError('Escolha o código de outro jogador.');
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
    if(!Number.isInteger(c.plot)||c.plot<0||c.plot>=target.state.unlockedPlots) throw new GameError('Canteiro inválido.');
    const plot=target.state.plots[c.plot];
    const day=new Date(now).toISOString().slice(0,10);
    if(c.type==='steal'){
      if(!row.state.socialRaids||!target.state.socialRaids)throw new GameError('Os dois amigos precisam ativar a brincadeira de roubo.');
      if(dogProtects(target.state.animals,now)||target.state.raidProtectionUntil>now)throw new GameError('Esta fazenda está protegida. O cachorro está de olho!');
      if(!plot.crop||remaining(plot,now)!==0||hasPests(plot,now)||(plot.stolen??0)>=1)throw new GameError('Escolha uma colheita madura e ainda não beliscada.');
      const used=await db.query('SELECT 1 FROM farm_raids WHERE visitor=$1 AND owner=$2 AND day=$3',[user,target.user_id,day]);if(used.rowCount)throw new GameError('Você já pegou um produto deste amigo hoje.');
      row.state.inventory[plot.crop as Crop]++;plot.stolen=(plot.stolen??0)+1;target.state.raidProtectionUntil=now+3600000;
      await db.query('INSERT INTO farm_raids(visitor,owner,day,plot) VALUES($1,$2,$3,$4)',[user,target.user_id,day,c.plot]);
      target.state.visitLog.unshift({name:row.name,action:'pegou 1 produto maduro',at:now});target.state.visitLog=target.state.visitLog.slice(0,20);
      await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[target.user_id,target.state]);
      return {ok:true,message:'Você pegou 1 produto! O amigo mantém pelo menos 2 e ganha 1 hora de proteção.'};
    }
    const used=await db.query('SELECT 1 FROM farm_help WHERE helper=$1 AND owner=$2 AND day=$3',[user,target.user_id,day]);
    if(used.rowCount) throw new GameError('Você já ajudou esta fazenda hoje. Volte amanhã!');
    let action='regou uma plantação';
    if(c.mode==='plant'){
      if(plot.crop||!Object.hasOwn(CROPS,c.crop)||row.state.seeds[c.crop as Crop]<1)throw new GameError('Canteiro ocupado ou semente indisponível.');
      row.state.seeds[c.crop as Crop]--;plot.tilled=true;plot.crop=c.crop;plot.wateredAt=null;plot.pestAt=null;plot.stolen=0;action='plantou uma semente';
    }else if(c.mode==='clean'){
      if(!hasPests(plot,now))throw new GameError('Esta plantação não tem pragas.');plot.pestAt=null;action='removeu pragas';
    }else{
      if(!plot.crop||plot.wateredAt!==null)throw new GameError('Escolha uma plantação ainda sem água.');plot.wateredAt=now;
    }
    row.state.xp+=5;
    await db.query('INSERT INTO farm_help(helper,owner,day,plot) VALUES($1,$2,$3,$4)',[user,target.user_id,day,c.plot]);
    target.state.visitLog.unshift({name:row.name,action,at:now});target.state.visitLog=target.state.visitLog.slice(0,20);
    await db.query('UPDATE farms SET state=$2,revision=revision+1 WHERE user_id=$1',[target.user_id,target.state]);
    return {ok:true,message:'Ajuda concluída! +5 XP pela amizade.'};
  }
  if(c.type==='list') {
    const count=await db.query("SELECT count(*) FROM market_listings WHERE seller=$1 AND status='open'",[user]);
    if(Number(count.rows[0].count)>=10) throw new GameError('Limite de 10 ofertas abertas.');
    const result=reserveLot(row.state,c);if(!result.ok)throw new GameError(result.message);
    await db.query('INSERT INTO market_listings(seller,crop,quantity,price) VALUES($1,$2,$3,$4)',[user,c.crop,c.quantity,c.price]);
    return {ok:true,message:'Oferta publicada. Os produtos ficam reservados até a venda ou cancelamento.'};
  }
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
