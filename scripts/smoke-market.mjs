// Run AFTER migration 003 and deployment. Synthetic accounts, real growth time, no DB overrides.
// NODE_USE_ENV_PROXY=1 node scripts/smoke-market.mjs https://fazendinha-wj.vercel.app
import {randomBytes,randomUUID} from 'node:crypto';import assert from 'node:assert/strict';
const base=process.argv[2];if(!base)throw new Error('Informe a URL do jogo.');
const suffix=randomBytes(5).toString('hex'),password=randomBytes(24).toString('base64url');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function signup(k){
 const r=await fetch(`${base}/api/auth/sign-up/email`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({name:`QA Feira ${suffix}-${k}`,email:`qa-market-${suffix}-${k}@example.invalid`,password})});
 assert.equal(r.status,200,'signup');const cookie=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const t=await fetch(`${base}/api/auth/token`,{headers:{cookie,Origin:base}});const token=(await t.json()).token;assert.ok(token);return{token};
}
async function api(u,body,path=''){
 const r=await fetch(`${base}/api/game${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${u.token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return{status:r.status,...await r.json()};
}
async function command(u,command){await delay(200);const s=await api(u);const body={id:randomUUID(),revision:s.revision,command};const r=await api(u,body);assert.equal(r.status,200,`${command.type}: ${r.error}`);return{body,r};}
const a=await signup('a'),b=await signup('b');await api(a);await api(b);
const feed=await command(a,{type:'feed-animal',id:'starter-hen'});
while(Date.now()<feed.r.now+90500){console.log('Aguardando a produção real da galinha…');await delay(Math.min(30000,feed.r.now+90500-Date.now()));}
await command(a,{type:'collect-animal',id:'starter-hen'});
const list=await command(a,{type:'list',crop:'egg',quantity:1,price:17});assert.equal(list.r.farm.products.egg,0);
const replay=await api(a,list.body);assert.equal(replay.replayed,true);assert.equal(replay.farm.products.egg,0);
let market=await api(a,undefined,'?community=1&marketVersion=2');const lot=market.market.find(l=>l.mine&&l.crop==='egg');assert.ok(lot);
assert.equal((await api(a,undefined,'?community=1')).market.some(l=>l.crop==='egg'),false,'legacy clients do not receive unknown products');
console.log('PASS egg reserve, receipt replay and old-client compatibility');
const before=await api(b);await delay(200);
const buys=await Promise.all([1,2].map(()=>api(b,{id:randomUUID(),revision:before.revision,command:{type:'trade',listing:lot.id}})));
assert.equal(buys.filter(r=>r.status===200).length,1);assert.equal(buys.filter(r=>r.status===409).length,1);
assert.equal((await api(b)).farm.products.egg,1);assert.equal((await api(b)).farm.coins,233);assert.equal((await api(a)).farm.coins,267);
console.log('PASS concurrent purchase transfers one egg and charges once');
await command(b,{type:'list',crop:'egg',quantity:1,price:20});market=await api(b,undefined,'?community=1&marketVersion=2');const cancelLot=market.market.find(l=>l.mine&&l.crop==='egg');assert.ok(cancelLot);
const cancelled=await command(b,{type:'cancel-listing',listing:cancelLot.id});assert.equal(cancelled.r.farm.products.egg,1);
assert.equal((await api(b,cancelled.body)).farm.products.egg,1);
await delay(200);const current=await api(b);const again=await api(b,{id:randomUUID(),revision:current.revision,command:{type:'cancel-listing',listing:cancelLot.id}});assert.equal(again.status,409);
assert.equal((await api(b)).farm.products.egg,1);await command(b,{type:'sell'});assert.equal((await api(b)).farm.coins,245);assert.equal((await api(b)).farm.products.egg,0);
console.log('PASS single cancellation, replay protection and barn sale of purchased product');
console.log('Marketplace live checks passed. No credentials written to disk.');
