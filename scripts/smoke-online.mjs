// Optional live integration checks. Uses disposable test accounts, never a player's credentials.
// node --env-file=.env.local scripts/smoke-online.mjs https://fazendinha-wj.vercel.app
import {randomBytes,randomUUID} from 'node:crypto';import assert from 'node:assert/strict';
const base=process.argv[2];if(!base)throw new Error('Informe a URL de teste.');
const auth=process.env.NEON_AUTH_BASE_URL;
const password=randomBytes(24).toString('base64url');const suffix=randomBytes(5).toString('hex');
async function newUser(n){
 const email=`qa-${suffix}-${n}@example.invalid`;
 const r=await fetch(`${base}/api/auth/sign-up/email`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({name:`QA temporário ${suffix}-${n}`,email,password})});
 const body=await r.json();if(!r.ok)throw new Error(`Signup failed ${r.status}: ${body.message??body.error??'unknown'}`);
 const cookies=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const t=await fetch(`${base}/api/auth/token`,{headers:{cookie:cookies,Origin:base}});const token=(await t.json()).token;assert.ok(token,'Auth token issued');
 return {email,cookies,token};
}
async function api(u,query='',body){const r=await fetch(`${base}/api/game${query}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${u.token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const result=await r.json();return {status:r.status,...result};}
const denied=await fetch(`${base}/api/game`);assert.equal(denied.status,401);console.log('PASS unauthenticated access denied');
const a=await newUser('a'),b=await newUser('b');let sa=await api(a),sb=await api(b);assert.equal(sa.status,200);assert.equal(sa.farm.coins,250);assert.notEqual(sa.code,sb.code);console.log('PASS signup and isolated farms');
const buy={id:randomUUID(),revision:sa.revision,command:{type:'buy',crop:'carrot'}};
const purchased=await api(a,'',buy);assert.equal(purchased.farm.coins,210);const retry=await api(a,'',buy);assert.equal(retry.farm.coins,210);assert.equal(retry.replayed,true);console.log('PASS purchase replay does not duplicate debit or seeds');
const tampered=await api(a,'',{...buy,command:{type:'buy',crop:'tomato'}});assert.equal(tampered.status,409);const conflict=await api(a,'',{id:randomUUID(),revision:sa.revision,command:{type:'sell'}});assert.equal(conflict.status,409);console.log('PASS key reuse and stale session rejected');
sa=await api(a);assert.equal(sa.farm.coins,210);assert.equal((await api(b)).farm.coins,250);console.log('PASS cross-session persistence and account isolation');
await new Promise(r=>setTimeout(r,200));const fr=await api(a,'',{id:randomUUID(),revision:sa.revision,command:{type:'friend',code:sb.code}});assert.equal(fr.status,200);const accept=await api(b,'',{id:randomUUID(),revision:sb.revision,command:{type:'accept',code:sa.code}});assert.equal(accept.status,200);assert.equal((await api(a,`?visit=${sb.code}`)).status,200);console.log('PASS friendship, acceptance and authorized visit');
// Store only local, git-ignored QA session data for a follow-up run, never commit it.
const {writeFileSync}=await import('node:fs');writeFileSync('.qa-session.json',JSON.stringify({a,b,sa:await api(a),sb:await api(b),password}),{mode:0o600});
console.log('Live smoke checks passed. Test data is identifiable by QA temporário prefix.');
