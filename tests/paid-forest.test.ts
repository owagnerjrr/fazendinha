import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {makeFarm} from '../src/farm';
import {applyWardrobe,appearanceOf} from '../src/wardrobe';
import {orderPayload} from '../server/mp-orders';
import {requiresNewClient} from '../src/client-compat';
test('forest outfit is paid, equips free when owned, and requires the compatible client',()=>{
 const f=makeFarm(),before=structuredClone(f);assert.equal(applyWardrobe(f,{type:'buy-outfit',outfit:'forest'}).ok,false);assert.deepEqual(f,before);
 f.wardrobe={owned:['forest'],equipped:null};assert.equal(applyWardrobe(f,{type:'equip-outfit',outfit:'forest'}).ok,true);assert.equal(appearanceOf(f).outfit,'forest');assert.equal(f.coins,before.coins);assert.equal(requiresNewClient(f,'19'),true);assert.equal(requiresNewClient(f,'20'),false);
 for(const method of ['pix','card']){const p=orderPayload({id:randomUUID(),package:'outfit_forest',package_version:1,package_name:'Guardião da Clareira',coins:0,amount_cents:1500,method,origin:'https://farm.test'},'qa@example.invalid',[{id:'pix',payment_type_id:'bank_transfer',status:'active'},{id:'visa',payment_type_id:'credit_card',status:'active'}]);assert.equal(p.total_amount,'15.00');assert.match(p.items[0].title,/Guardião da Clareira/);}
});
test('forest migration preserves data; delivery, refund, gifts and Nebulosa are isolated and idempotent',async()=>{
 const db=new PGlite();try{
 await db.exec(`CREATE TABLE farms(user_id text PRIMARY KEY,state jsonb NOT NULL,revision int NOT NULL DEFAULT 0);INSERT INTO farms VALUES('buyer','{"coins":12255,"wardrobe":{"owned":["space","nebula"],"equipped":"nebula"},"animals":[{"id":"keep"}],"inventory":{"tomato":23}}',0);CREATE TABLE studio_admins(user_id text);INSERT INTO studio_admins VALUES('buyer');CREATE TABLE studio_audit(request_id uuid UNIQUE,author text,action text,target text,reason text,before jsonb,after jsonb,hash text,result jsonb);`);
 const load=(f:string)=>db.exec(readFileSync(new URL('../migrations/'+f,import.meta.url),'utf8'));
 for(const f of ['007_store.sql','008_store_credit.sql','009_orders_api.sql','011_fertilizer_store.sql','016_admin_payment_catalog.sql','021_paid_nebula.sql'])await load(f);
 const before=(await db.query('SELECT * FROM farms')).rows;await load('023_paid_forest.sql');await load('023_paid_forest.sql');assert.deepEqual((await db.query('SELECT * FROM farms')).rows,before);
 await load('024_publish_forest.sql');await load('024_publish_forest.sql');assert.deepEqual((await db.query("SELECT cents,coins,active FROM studio_payment_packs WHERE id='outfit_forest'")).rows,[{cents:1500,coins:0,active:true}]);
 await db.exec("UPDATE studio_payment_packs SET active=false WHERE id='outfit_forest'");await load('024_publish_forest.sql');assert.equal((await db.query<any>("SELECT active FROM studio_payment_packs WHERE id='outfit_forest'")).rows[0].active,false);
 const farmsBeforeRename=(await db.query('SELECT * FROM farms')).rows;await load('025_rename_forest.sql');await load('025_rename_forest.sql');assert.deepEqual((await db.query('SELECT * FROM farms')).rows,farmsBeforeRename);assert.deepEqual((await db.query("SELECT name,cents,version FROM studio_payment_packs WHERE id='outfit_forest'")).rows,[{name:'Guerreiro Link',cents:1500,version:2}]);
 const order=async()=>{const id=randomUUID();await db.query("INSERT INTO coin_orders(id,user_id,request_id,package,coins,amount_cents,method,mode,collector_id,expires_at,payment_api,package_version) VALUES($1,'buyer',$1,'outfit_forest',0,1500,'card','test','fixture',now()+interval '1 hour','orders',1)",[id]);return id;};
 const state=async()=>(await db.query<any>('SELECT state FROM farms')).rows[0].state;
 const pay=async(id:string,key:string,status:string,hour:number,refund=0,amount=1500)=>Number((await db.query<any>('SELECT apply_store_payment($1,$2,$3,$4,$5,$6) delta',[id,key,status,amount,refund,new Date(Date.UTC(2026,10,1,hour))])).rows[0].delta);
 const a=await order();await assert.rejects(pay(a,'wrong','approved',0,0,1000));assert.equal(await pay(a,'forest-a','pending',0),0);assert.equal(await pay(a,'forest-a','approved',1),1);assert.equal(await pay(a,'forest-a','approved',1),0);assert.deepEqual((await state()).wardrobe.owned,['space','nebula','forest']);
 await db.exec(`UPDATE farms SET state=jsonb_set(state,'{wardrobe,equipped}','"forest"')`);assert.equal(await pay(a,'forest-a','refunded',2,1500),-1);assert.equal(await pay(a,'forest-a','refunded',2,1500),0);assert.equal(await pay(a,'forest-a','approved',1),0);assert.deepEqual((await state()).wardrobe,{owned:['space','nebula'],equipped:null});
 const b=await order(),c=await order();await pay(b,'forest-b','approved',3);await pay(c,'forest-c','approved',3);await pay(b,'forest-b','charged_back',4,1500);assert.equal((await state()).wardrobe.owned.filter((x:string)=>x==='forest').length,1);await db.exec("UPDATE paid_outfit_ownership SET gifted=true WHERE outfit='forest'");await pay(c,'forest-c','refunded',5,1500);assert.ok((await state()).wardrobe.owned.includes('forest'));
 assert.equal((await state()).coins,12255);assert.deepEqual((await state()).animals,[{id:'keep'}]);assert.deepEqual((await state()).inventory,{tomato:23});assert.ok((await state()).wardrobe.owned.includes('nebula'));
 }finally{await db.close();}
});
