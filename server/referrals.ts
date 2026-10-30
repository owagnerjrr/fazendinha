import {createHash} from 'node:crypto';
import type {PoolClient} from 'pg';
import {canonicalEmail,referralCode,referralEligible} from '../src/referrals.js';
import {pool} from './db.js';
const fingerprint=(email:string)=>createHash('sha256').update(canonicalEmail(email)).digest('hex');
/** Called only during the first successful profile initialization, inside the economy transaction. */
export async function claimInvitation(db:PoolClient,user:string,code:unknown,now:number){
 if(!referralCode(code))return;
 const account=(await db.query('SELECT email,"createdAt" FROM neon_auth."user" WHERE id::text=$1 AND banned IS NOT TRUE',[user])).rows[0];
 const farm=(await db.query('SELECT created_at FROM farms WHERE user_id=$1',[user])).rows[0];
 if(!account||!farm||!referralEligible(new Date(account.createdAt).getTime(),new Date(farm.created_at).getTime(),now))return;
 const inviter=(await db.query(`SELECT f.user_id,u.email FROM farms f JOIN neon_auth."user" u ON u.id::text=f.user_id WHERE f.public_code=$1 AND COALESCE((f.state->>'profileComplete')::boolean,true) AND u.banned IS NOT TRUE`,[code])).rows[0];
 if(!inviter||inviter.user_id===user||!canonicalEmail(account.email)||canonicalEmail(inviter.email)===canonicalEmail(account.email))return;
 await db.query('INSERT INTO referral_claims(invitee,referrer,email_hash) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[user,inviter.user_id,fingerprint(account.email)]);
 await settleInvitation(db,user);
}
/** Locks + atomic balance update make verification retries and concurrent openings idempotent. */
export async function settleInvitation(db:PoolClient,user:string){await db.query('SELECT public.credit_verified_referral($1)',[user]);}
export async function settleVerifiedInvitation(user:string){
 const pending=await pool.query('SELECT 1 FROM referral_claims WHERE invitee=$1 AND rewarded_at IS NULL',[user]);if(pending.rowCount)await pool.query('SELECT public.credit_verified_referral($1)',[user]);
}
export async function referralSummary(user:string){const r=await pool.query(`SELECT count(*) FILTER(WHERE rewarded_at IS NOT NULL)::int AS completed,count(*) FILTER(WHERE rewarded_at IS NULL)::int AS pending,COALESCE(sum(reward) FILTER(WHERE rewarded_at IS NOT NULL),0)::int AS earned FROM referral_claims WHERE referrer=$1`,[user]);const own=await pool.query('SELECT rewarded_at IS NULL AS pending FROM referral_claims WHERE invitee=$1',[user]);return{...r.rows[0],verificationPending:own.rows[0]?.pending??false};}
