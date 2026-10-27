// Live profile lifecycle. Synthetic accounts only; no personal Google account or DB overrides.
import {randomBytes,randomUUID} from 'node:crypto';import assert from 'node:assert/strict';
const base=process.argv[2];if(!base)throw new Error('Informe a URL.');const suffix=randomBytes(5).toString('hex');
const password=randomBytes(24).toString('base64url');
const signup=await fetch(`${base}/api/auth/sign-up/email`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({email:`qa-profile-${suffix}@example.invalid`,password,name:`QA Perfil ${suffix}`})});assert.equal(signup.status,200);
const cookie=signup.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
const tokenResponse=await fetch(`${base}/api/auth/token`,{headers:{cookie,Origin:base}}),token=(await tokenResponse.json()).token;assert.ok(token);
async function api(body){const r=await fetch(`${base}/api/game`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});return{status:r.status,...await r.json()};}
const start=await api();assert.equal(start.farm.profileComplete,false);
const avatar={style:'crop',skin:5,hair:0,shirt:1};
const blank=await api({id:randomUUID(),revision:start.revision,command:{type:'initialize-profile',name:' ',avatar}});assert.equal(blank.status,400);assert.equal((await api()).farm.profileComplete,false);
const body={id:randomUUID(),revision:start.revision,command:{type:'initialize-profile',name:'QA Caio',avatar}};
const initialized=await api(body);assert.equal(initialized.status,200);assert.equal(initialized.name,'QA Caio');assert.deepEqual(initialized.farm.avatar,avatar);assert.equal(initialized.farm.profileComplete,true);assert.equal(initialized.farm.coins,250);
assert.equal((await api(body)).replayed,true);console.log('PASS profile initialized once, with chosen name/avatar and idempotent receipt');
await new Promise(r=>setTimeout(r,200));let snap=await api();const bought=await api({id:randomUUID(),revision:snap.revision,command:{type:'buy',crop:'carrot'}});assert.equal(bought.status,200);assert.equal(bought.farm.coins,210);
await new Promise(r=>setTimeout(r,200));snap=await api();const replacement=await api({id:randomUUID(),revision:snap.revision,command:{type:'initialize-profile',name:'Outro',avatar:{style:'puffs',skin:4,hair:0,shirt:2}}});assert.equal(replacement.status,409);
const reloaded=await api();assert.equal(reloaded.name,'QA Caio');assert.equal(reloaded.farm.coins,210);assert.deepEqual(reloaded.farm.avatar,avatar);assert.equal(reloaded.farm.seeds.carrot,13);console.log('PASS existing farm reload preserves name, avatar, coins and seeds; replacement refused');
await new Promise(r=>setTimeout(r,200));let care=await api();const fed=await api({id:randomUUID(),revision:care.revision,command:{type:'feed-animal',id:'starter-hen'}});assert.equal(fed.status,200);assert.equal(fed.farm.feed,4);
while(Date.now()<fed.now+90500){console.log('Waiting for real hen production…');await new Promise(r=>setTimeout(r,Math.min(30000,fed.now+90500-Date.now())));}
care=await api();const collectBody={id:randomUUID(),revision:care.revision,command:{type:'collect-animal',id:'starter-hen'}};const egg=await api(collectBody);assert.equal(egg.status,200);assert.equal(egg.farm.products.egg,1);assert.equal((await api(collectBody)).farm.products.egg,1);
await new Promise(r=>setTimeout(r,200));care=await api();const twice=await api({id:randomUUID(),revision:care.revision,command:{type:'collect-animal',id:'starter-hen'}});assert.equal(twice.status,400);assert.equal((await api()).farm.products.egg,1);console.log('PASS real animal feeding/production preserved and collection cannot duplicate');
const google=await fetch(`${base}/api/auth/sign-in/social`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({provider:'google',callbackURL:base,disableRedirect:true})});const result=await google.json();assert.equal(google.status,200);assert.ok(result.url);
const redirect=await fetch(result.url,{redirect:'manual'});assert.ok([302,303].includes(redirect.status));assert.equal(new URL(redirect.headers.get('location')).hostname,'accounts.google.com');console.log('PASS Google OAuth starts and redirects to Google; personal consent not completed');
console.log('Profile live checks passed. No credentials written to disk.');
