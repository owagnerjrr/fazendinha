// Isolated database branch only. Synthetic fixtures; never target production.
import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
if(process.env.QA_BRANCH!=='br-icy-frost-b8ni6nob')throw Error('Use the isolated QA branch.');
const {pool}=await import('../server/db.ts');const {ensureFarm,snapshot,mutate,community}=await import('../server/game.ts');
const {settleVerifiedInvitation}=await import('../server/referrals.ts');
const ids=Array.from({length:5},()=>randomUUID()),now=Date.now(),suffix=randomUUID().replaceAll('-','');
const emails=[`qa-owner-${suffix}@example.invalid`,`qa.new.${suffix}@gmail.com`,`qa-unverified-${suffix}@example.invalid`,`qa-old-${suffix}@example.invalid`,`qa.new.${suffix}+alias@googlemail.com`];
for(let i=0;i<ids.length;i++){await pool.query('INSERT INTO neon_auth."user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$5)',[ids[i],'QA Referral',emails[i],i!==2,new Date(i===3?now-172800000:now)]);await ensureFarm(ids[i],'QA Referral',true);}
async function command(i,c,id=randomUUID()){const s=await snapshot(ids[i]);return mutate(ids[i],{id,revision:s.revision,command:c},'8');}
const avatar={style:'cap',skin:0,hair:1,shirt:1};
await command(0,{type:'initialize-profile',name:'QA Owner',avatar});const owner=await snapshot(ids[0]);
assert.equal(owner.farm.coins,50);assert.equal(owner.farm.unlockedPlots,6);assert.equal(owner.farm.animals.length,0);
await assert.rejects(command(0,{type:'buy-rod'}),/nível 4/);assert.equal((await snapshot(ids[0])).farm.coins,50);
console.log('PASS new starter and authoritative level gate');
const before=owner.revision,receipt=randomUUID(),body={id:receipt,revision:(await snapshot(ids[1])).revision,command:{type:'initialize-profile',name:'QA New',avatar,referral:owner.code}};
await mutate(ids[1],body,'8');let paid=await snapshot(ids[0]);assert.equal(paid.farm.coins,1050);assert.equal(paid.revision,before+1);
await Promise.all([mutate(ids[1],body,'8'),settleVerifiedInvitation(ids[1]),settleVerifiedInvitation(ids[1])]);assert.equal((await snapshot(ids[0])).farm.coins,1050);
console.log('PASS verified signup credits 1000 once; retries and concurrent settling do not duplicate');
await command(2,{type:'initialize-profile',name:'QA Pending',avatar,referral:owner.code});assert.equal((await snapshot(ids[0])).farm.coins,1050);assert.equal((await community(ids[0])).referrals.pending,1);
await pool.query('UPDATE neon_auth."user" SET "emailVerified"=true WHERE id=$1',[ids[2]]);
await Promise.all([settleVerifiedInvitation(ids[2]),settleVerifiedInvitation(ids[2]),settleVerifiedInvitation(ids[2])]);assert.equal((await snapshot(ids[0])).farm.coins,2050);
console.log('PASS unverified signup waits; confirmation credits once across concurrent openings');
await command(3,{type:'initialize-profile',name:'QA Old',avatar,referral:owner.code});assert.equal((await snapshot(ids[0])).farm.coins,2050);
await command(4,{type:'initialize-profile',name:'QA Alias',avatar,referral:owner.code});assert.equal((await snapshot(ids[0])).farm.coins,2050);
assert.equal((await community(ids[0])).referrals.completed,2);
console.log('PASS old accounts and Gmail alias re-registration do not earn rewards');
// Existing account cannot submit a second profile/claim, including a self-invite.
await new Promise(r=>setTimeout(r,180));await assert.rejects(command(0,{type:'initialize-profile',name:'QA Self',avatar,referral:owner.code}),/já tem uma fazenda/);
assert.equal((await snapshot(ids[0])).farm.coins,2050);
console.log('PASS existing profile cannot reclaim or self-refer');
await pool.end();
