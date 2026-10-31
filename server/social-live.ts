import {pool} from './db.js';
import {GameError} from './game.js';
import {riverWalkable} from '../src/river-boundary.js';
import {validAvatar} from '../src/content.js';
export async function presence(user:string,input:any){
 if(input?.leave===true){await pool.query('DELETE FROM farm_presence WHERE user_id=$1',[user]);return{players:[]};}
 if(!/^[A-Z0-9]{10}$/.test(input?.code??'')||!Number.isFinite(input.x)||!Number.isFinite(input.y)||input.x<100||input.x>1480||input.y<180||input.y>1090||!riverWalkable(input)||!Number.isInteger(input.direction)||input.direction<0||input.direction>3)throw new GameError('Presença inválida.');
 // Every heartbeat rechecks friendship and blocks; presence never grants economic authority.
 const owner=(await pool.query(`SELECT f.user_id FROM farms f WHERE public_code=$2 AND (f.user_id=$1 OR EXISTS(SELECT 1 FROM friendships r WHERE accepted AND ((sender=$1 AND recipient=f.user_id) OR (recipient=$1 AND sender=f.user_id)))) AND NOT EXISTS(SELECT 1 FROM social_blocks WHERE (owner=$1 AND blocked=f.user_id) OR (blocked=$1 AND owner=f.user_id))`,[user,input.code])).rows[0];
 if(!owner){await pool.query('DELETE FROM farm_presence WHERE user_id=$1',[user]);throw new GameError('Visita não permitida.',403);}
 const previous=(await pool.query('SELECT owner_id,x,y,updated_at FROM farm_presence WHERE user_id=$1',[user])).rows[0],elapsed=previous?Math.max(0,(Date.now()-new Date(previous.updated_at).getTime())/1000):Infinity;
 if(previous?.owner_id===owner.user_id&&Math.hypot(input.x-previous.x,input.y-previous.y)>190*Math.min(elapsed,12)+80)throw new GameError('Movimento de visita rápido demais.',409);
 if(owner.user_id!==user&&previous?.owner_id!==owner.user_id&&Math.hypot(input.x-750,input.y-650)>70)throw new GameError('Entre pela chegada da fazenda.',409);
 await pool.query(`INSERT INTO farm_presence(user_id,owner_id,x,y,direction) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id) DO UPDATE SET owner_id=excluded.owner_id,x=excluded.x,y=excluded.y,direction=excluded.direction,updated_at=now() WHERE farm_presence.owner_id<>excluded.owner_id OR farm_presence.x<>excluded.x OR farm_presence.y<>excluded.y OR farm_presence.updated_at<now()-interval '750 milliseconds'`,[user,owner.user_id,input.x,input.y,input.direction]);
 const r=await pool.query(`SELECT f.public_code AS code,f.name,f.state->'avatar' AS avatar,f.state->'wardrobe'->>'equipped' AS outfit,p.x,p.y,p.direction FROM farm_presence p JOIN farms f ON f.user_id=p.user_id WHERE p.owner_id=$2 AND p.user_id<>$1 AND p.updated_at>now()-interval '12 seconds' AND (p.user_id=$2 OR EXISTS(SELECT 1 FROM friendships WHERE accepted AND ((sender=p.user_id AND recipient=$2) OR (recipient=p.user_id AND sender=$2)))) AND NOT EXISTS(SELECT 1 FROM social_blocks WHERE (owner=$1 AND blocked=p.user_id) OR (blocked=$1 AND owner=p.user_id) OR (owner=$2 AND blocked=p.user_id) OR (blocked=$2 AND owner=p.user_id)) ORDER BY p.updated_at DESC LIMIT 20`,[user,owner.user_id]);
 return{players:r.rows.filter(p=>validAvatar(p.avatar)).map(p=>({...p,avatar:{...p.avatar,...(p.outfit?{outfit:p.outfit}:{})}}))};
}
export async function notifications(user:string,history=false){return{events:(await pool.query(`SELECT n.id::text,n.kind,f.name,f.public_code AS code,extract(epoch FROM n.created_at)*1000 AS at FROM social_notifications n JOIN farms f ON f.user_id=n.actor_id WHERE n.user_id=$1 AND ($2 OR n.read_at IS NULL) ORDER BY n.id DESC LIMIT 40`,[user,history])).rows};}
export async function acknowledge(user:string,input:any){
 if(!Array.isArray(input?.ids)||input.ids.length>40||input.ids.some((v:any)=>typeof v!=='string'||!/^\d{1,19}$/.test(v)))throw new GameError('Notificação inválida.');
 await pool.query('UPDATE social_notifications SET read_at=now() WHERE user_id=$1 AND id=ANY($2::bigint[])',[user,input.ids]);return{ok:true};
}
