// Uses one isolated synthetic QA account; never reads player credentials.
import assert from 'node:assert/strict';import {randomBytes,randomUUID} from 'node:crypto';
const base=process.argv[2];if(!base)throw Error('Informe a URL do jogo.');
const email=`qa-avatar-${randomBytes(8).toString('hex')}@example.invalid`,password=randomBytes(24).toString('base64url'),headers={'Content-Type':'application/json',Origin:base,'X-Farm-Version':'8'};
const signup=await fetch(`${base}/api/auth/sign-up/email`,{method:'POST',headers,body:JSON.stringify({name:'QA Avatar',email,password})});assert.equal(signup.status,200);
let cookie=signup.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
async function token(){const r=await fetch(`${base}/api/auth/token`,{headers:{...headers,cookie}});assert.equal(r.status,200);const t=await r.json();assert.ok(t.token);return t.token;}
let bearer=await token();
async function api(body){const r=await fetch(`${base}/api/game`,{method:body?'POST':'GET',headers:{...headers,Authorization:`Bearer ${bearer}`},body:body?JSON.stringify(body):undefined});return {status:r.status,...await r.json()};}
async function command(command){for(let n=0;n<6;n++){const s=await api(),r=await api({id:randomUUID(),revision:s.revision,command});if([409,429].includes(r.status)){await new Promise(r=>setTimeout(r,400));continue;}assert.equal(r.status,200,r.error);return r;}throw Error('Não foi possível confirmar o comando.');}
const cap={style:'cap',skin:0,hair:1,shirt:1},ponytail={style:'ponytail',skin:2,hair:1,shirt:0};
assert.equal((await api()).farm.profileComplete,false);
let s=await command({type:'initialize-profile',name:'QA Avatar',avatar:cap});assert.deepEqual(s.farm.avatar,cap);assert.equal(s.farm.profileComplete,true);console.log('PASS conta nova guarda o personagem escolhido');
const before={coins:s.farm.coins,name:s.farm.playerName,seeds:s.farm.seeds,inventory:s.farm.inventory,animals:s.farm.animals.map(a=>a.id)};
s=await command({type:'avatar',avatar:ponytail});assert.deepEqual(s.farm.avatar,ponytail);
assert.deepEqual({coins:s.farm.coins,name:s.farm.playerName,seeds:s.farm.seeds,inventory:s.farm.inventory,animals:s.farm.animals.map(a=>a.id)},before);console.log('PASS conta existente troca somente aparência, preservando fazenda');
const login=await fetch(`${base}/api/auth/sign-in/email`,{method:'POST',headers,body:JSON.stringify({email,password})});assert.equal(login.status,200);cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');bearer=await token();assert.deepEqual((await api()).farm.avatar,ponytail);console.log('PASS novo login mantém o personagem confirmado');
const oauth=await fetch(`${base}/api/auth/sign-in/social`,{method:'POST',headers,body:JSON.stringify({provider:'google',callbackURL:`${base}/?setup=character`,disableRedirect:true})});assert.equal(oauth.status,200);assert.ok((await oauth.json()).url);console.log('PASS rota de retorno Google para seleção aceita; consentimento pessoal não executado');
