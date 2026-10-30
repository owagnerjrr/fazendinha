import {pool} from './db.js';import {GameError} from './game.js';import {FRIEND_CODE,MESSAGE_ID,normalizeMessage,messageCursor} from '../src/social-rules.js';
import type {PoolClient} from 'pg';
async function friend(db:Pick<PoolClient,'query'>,user:string,code:string){
 if(!FRIEND_CODE.test(code))throw new GameError('Código inválido.');
 const r=await db.query(`SELECT f.user_id,f.name,f.public_code AS code FROM farms f WHERE f.public_code=$2 AND f.user_id<>$1
 AND EXISTS(SELECT 1 FROM neon_auth."user" u WHERE u.id::text=$1 AND u.banned IS NOT TRUE)
 AND EXISTS(SELECT 1 FROM friendships r WHERE r.accepted AND ((r.sender=$1 AND r.recipient=f.user_id) OR (r.recipient=$1 AND r.sender=f.user_id)))
 AND NOT EXISTS(SELECT 1 FROM social_blocks b WHERE (b.owner=$1 AND b.blocked=f.user_id) OR (b.owner=f.user_id AND b.blocked=$1))`,[user,code]);
 if(!r.rows[0])throw new GameError('O chat está disponível somente entre amigos aceitos.',403);return r.rows[0];
}
const publicMessage=(r:any,user:string)=>({id:String(r.id),body:r.body,mine:r.sender===user,at:new Date(r.created_at).getTime()});
export async function readChat(user:string,code:string,after:string|null,before:string|null){
 let a:string|null,b:string|null;try{a=messageCursor(after);b=messageCursor(before);}catch{throw new GameError('Cursor inválido.');}if(a&&b)throw new GameError('Escolha uma direção de histórico.');
 const f=await friend(pool,user,code);
 const r=await pool.query(`SELECT id,sender,body,created_at FROM friend_messages WHERE LEAST(sender,recipient)=LEAST($1::text,$2::text) AND GREATEST(sender,recipient)=GREATEST($1::text,$2::text) AND ($3::bigint IS NULL OR id>$3) AND ($4::bigint IS NULL OR id<$4) ORDER BY id ${a?'ASC':'DESC'} LIMIT 51`,[user,f.user_id,a,b]);
 const more=r.rows.length>50,rows=r.rows.slice(0,50);if(!a)rows.reverse();return{friend:{code:f.code,name:f.name},messages:rows.map(r=>publicMessage(r,user)),more,now:Date.now()};
}
export async function sendChat(user:string,input:any){
 const text=normalizeMessage(input?.body);if(!text||!MESSAGE_ID.test(input?.id??''))throw new GameError('Escreva uma mensagem de 1 a 500 caracteres.');
 const db=await pool.connect();try{await db.query('BEGIN');await db.query("SELECT pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'))");const f=await friend(db,user,input.code);
 const previous=await db.query('SELECT id,sender,recipient,body,created_at FROM friend_messages WHERE sender=$1 AND client_id=$2',[user,input.id]);
 if(previous.rows[0]){const old=previous.rows[0];if(old.recipient!==f.user_id||old.body!==text)throw new GameError('Identificador de mensagem já utilizado.',409);await db.query('COMMIT');return{message:publicMessage(old,user),replayed:true};}
 const rate=await db.query("SELECT count(*)::int AS recent,max(created_at) AS last FROM friend_messages WHERE sender=$1 AND created_at>now()-interval '1 minute'",[user]);
 if(rate.rows[0].recent>=20||rate.rows[0].last&&Date.now()-new Date(rate.rows[0].last).getTime()<1000)throw new GameError('Aguarde um instante para enviar outra mensagem.',429);
 const r=await db.query('INSERT INTO friend_messages(sender,recipient,client_id,body) VALUES($1,$2,$3,$4) RETURNING id,sender,body,created_at',[user,f.user_id,input.id,text]);await db.query('COMMIT');return{message:publicMessage(r.rows[0],user)};
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}
