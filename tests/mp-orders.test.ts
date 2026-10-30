import test from 'node:test';import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';
import {orderCents,orderPayload,validateProviderOrder} from '../server/mp-orders';
import {verifyWebhook,sandboxRuntime} from '../server/mercadopago';import {settleProviderOrder} from '../server/store';import {pool} from '../server/db';
const id='ORDTST01KS5AJ6HTK2HRQ3XJ3C2JCKP9',local={id:'00000000-0000-4000-8000-000000000001',package:'p10',amount_cents:1000,collector_id:'123',mode:'test',method:'pix',payment_api:'orders',provider_order_id:id,origin:'https://farm.test'};
const config={token:'fixture',secret:'fixture-secret',collector:'123',mode:'test' as const,origin:local.origin,api:'orders' as const,application:'456'};
const payment={amount:'10.00',refunded_amount:'0.00',payment_method:{id:'pix',type:'bank_transfer'}};
const proof={id,type:'online',processing_mode:'manual',status:'processed',status_detail:'accredited',country_code:'BRA',currency:'BRL',user_id:'123',external_reference:local.id,total_amount:'10.00',total_paid_amount:'10.00',last_updated_date:'2026-10-30T20:00:00Z',integration_data:{application_id:'456'},transactions:{payments:[payment]}};
test('isolated sandbox permits its own public test endpoint but never the live game project',()=>{
 assert.equal(sandboxRuntime({VERCEL_ENV:'production'}),false);
 assert.equal(sandboxRuntime({VERCEL_ENV:'production',VERCEL_PROJECT_ID:'test-project',MP_SANDBOX_PROJECT_ID:'test-project'}),true);
 assert.equal(sandboxRuntime({VERCEL_ENV:'production',VERCEL_PROJECT_ID:'other-project',MP_SANDBOX_PROJECT_ID:'test-project'}),false);
 assert.equal(sandboxRuntime({VERCEL_ENV:'production',VERCEL_PROJECT_ID:'prj_iRVw6wfsusQgc7mTmTs2FXHHBVkJ',MP_SANDBOX_PROJECT_ID:'prj_iRVw6wfsusQgc7mTmTs2FXHHBVkJ'}),false);
});
test('Orders prices, references, hosted payment restrictions and return URLs come from the server',()=>{
 const methods=[{id:'pix',payment_type_id:'bank_transfer',status:'active'},{id:'visa',payment_type_id:'credit_card',status:'active'},{id:'bolbradesco',payment_type_id:'ticket',status:'active'}];
 for(const method of ['pix','card']){const p=orderPayload({...local,method},'qa@example.invalid',methods);assert.equal(p.total_amount,'10.00');assert.equal(p.processing_mode,'manual');assert.equal(p.external_reference,local.id);assert.equal(p.config.payment_method.max_installments,1);assert.equal(p.config.online.callback_url,'https://farm.test/api/mp-webhook');assert.ok(!JSON.stringify(p).includes('card_number'));assert.ok(p.config.payment_method.not_allowed_ids.includes(method==='pix'?'visa':'pix'));}
 for(const bad of [10,'10.001','1e1','-1.00','10,00',null])assert.throws(()=>orderCents(bad));assert.equal(orderCents('10.10'),1010);
});
test('a prepaid brand sharing the same id cannot exclude its permitted credit card',()=>{
 const methods=[{id:'visa',payment_type_id:'prepaid_card',status:'active'},{id:'visa',payment_type_id:'credit_card',status:'active'},{id:'account_money',payment_type_id:'account_money',status:'active'}];
 const p=orderPayload({...local,method:'card'},'qa@example.invalid',methods);assert.equal(p.config.payment_method.not_allowed_ids.includes('visa'),false);assert.ok(p.config.payment_method.not_allowed_types.includes('prepaid_card'));assert.equal(p.config.payment_method.not_allowed_types.includes('wallet'),false);
});
test('Orders proof binds seller, application, mode, BRL price, method and immutable remote id',()=>{
 assert.equal(validateProviderOrder(proof,local,config).status,'approved');
 for(const change of [{id:id.replace('TST','')},{user_id:'999'},{currency:'USD'},{country_code:'ARG'},{external_reference:'other'},{total_amount:'1.00'},{total_amount:'10.001'},{total_paid_amount:'0.00'},{last_updated_date:'bad'},{live_mode:true},{processing_mode:'automatic'},{integration_data:{application_id:'wrong'}},{transactions:{payments:[]}}])assert.throws(()=>validateProviderOrder({...proof,...change},local,config));
 assert.throws(()=>validateProviderOrder(proof,{...local,method:'card'},config));
 const card={...payment,payment_method:{id:'visa',type:'credit_card',installments:1}};assert.equal(validateProviderOrder({...proof,transactions:{payments:[card]}},{...local,method:'card'},config).status,'approved');
 assert.throws(()=>validateProviderOrder({...proof,transactions:{payments:[{...card,payment_method:{...card.payment_method,installments:2}}]}},{...local,method:'card'},config));
});
test('Orders pending, rejected, canceled and authorized states cannot become approved',()=>{
 for(const [status,expected] of [['created','pending'],['action_required','pending'],['processing','in_process'],['failed','rejected'],['canceled','cancelled']])assert.equal(validateProviderOrder({...proof,status,total_paid_amount:'0.00',transactions:{payments:[]}},local,config).status,expected);
 assert.throws(()=>validateProviderOrder({...proof,status:'unknown'},local,config));assert.throws(()=>validateProviderOrder({...proof,status_detail:'waiting_capture'},local,config));
});
test('Orders refunds, disputes and Pix data preserve exact entitlement',()=>{
 const partial=validateProviderOrder({...proof,status_detail:'partially_refunded',transactions:{payments:[{...payment,refunded_amount:'2.00'}]}},local,config);assert.equal(partial.refund,200);assert.equal(partial.status,'approved');
 assert.equal(validateProviderOrder({...proof,status:'refunded'},local,config).refund,1000);
 assert.equal(validateProviderOrder({...proof,transactions:{payments:[payment],chargebacks:[{id:'dispute',status:'opened'}]}},local,config).status,'charged_back');
 assert.throws(()=>validateProviderOrder({...proof,status_detail:'partially_refunded'},local,config));
 const pix=validateProviderOrder({...proof,status:'action_required',total_paid_amount:'0.00',transactions:{payments:[{...payment,payment_method:{...payment.payment_method,qr_code:'fixture',qr_code_base64:'cWE='}}]}},local,config);assert.equal(pix.qr,'fixture');assert.equal(pix.qrImage,'cWE=');assert.equal(pix.status,'pending');
});
test('Orders HMAC preserves signed resource case, matching the official SDK',()=>{
 const headers=new Headers({'x-request-id':'fixture','x-signature':'ts=1793390400,v1='+createHmac('sha256',config.secret).update(`id:${id};request-id:fixture;ts:1793390400;`).digest('hex')});
 assert.ok(verifyWebhook(headers,new URL('https://farm.test/api/mp-webhook?data.id='+id),config.secret));assert.equal(verifyWebhook(headers,new URL('https://farm.test/api/mp-webhook?data.id='+id+'A'),config.secret),false);
});
test('signature parsing supports automatic Orders and SDK conventions without accepting another resource',()=>{
 const hash=createHmac('sha256',config.secret).update(`id:${id};request-id:fixture;ts:1793390400;`).digest('hex'),headers=new Headers({'x-request-id':' fixture ','x-signature':` ts = 1793390400 , v1 = ${hash} `});
 assert.ok(verifyWebhook(headers,new URL('https://farm.test/api/mp-webhook?data.id='+id),config.secret));assert.equal(verifyWebhook(headers,new URL('https://farm.test/api/mp-webhook?data.id='+id.toLowerCase()),config.secret),false);
 const legacy=createHmac('sha256',config.secret).update(`id:${id.toLowerCase()};request-id:fixture;ts:1793390400;`).digest('hex');assert.equal(verifyWebhook(new Headers({'x-request-id':'fixture','x-signature':`ts=1793390400,v1=${legacy}`}),new URL('https://farm.test/api/mp-webhook?data.id='+id),config.secret),true);
});
test('Orders settlement uses one stable aggregate ledger key and never writes on invalid proof',async()=>{
 const query=pool.query,connect=pool.connect,seen:any[]=[];pool.query=(async()=>({rows:[local]})) as any;pool.connect=(async()=>({query:async(sql:string,args:any[])=>{seen.push({sql,args});return{rows:[],rowCount:1};},release:()=>{}})) as any;
 try{await settleProviderOrder(proof,config);assert.ok(seen.some(s=>s.sql.includes('apply_store_payment')&&s.args[1]==='mp-order:'+id&&s.args[2]==='approved'));const before=seen.length;await assert.rejects(settleProviderOrder({...proof,user_id:'another'},config));assert.equal(seen.length,before);}
 finally{pool.query=query;pool.connect=connect;}
});

test('open Orders with only failed attempts show rejected, while active and paid attempts retain priority',()=>{
 const attempt={...payment,status:'failed'};
 for(const status of ['created','action_required'])assert.equal(validateProviderOrder({...proof,status,total_paid_amount:'0.00',transactions:{payments:[attempt]}},local,config).status,'rejected');
 assert.equal(validateProviderOrder({...proof,status:'created',total_paid_amount:'0.00',transactions:{payments:[attempt,{...payment,status:'processing'}]}},local,config).status,'pending');
 assert.equal(validateProviderOrder({...proof,status:'processing',transactions:{payments:[attempt]}},local,config).status,'in_process');
 assert.equal(validateProviderOrder({...proof,transactions:{payments:[attempt,{...payment,status:'processed'}]}},local,config).status,'approved');
});

test('reclassifying an equal-time declined attempt cannot change credited payments or bypass older-event protection',async()=>{const query=pool.query,connect=pool.connect,seen:any[]=[];pool.query=(async()=>({rows:[local]})) as any;pool.connect=(async()=>({query:async(sql:string,args:any[])=>{seen.push({sql,args});return{rows:[],rowCount:1};},release:()=>{}})) as any;try{await settleProviderOrder({...proof,status:'action_required',status_detail:'waiting_retry',total_paid_amount:'0.00',transactions:{payments:[{...payment,status:'failed'}]}},config);const correction=seen.find(s=>s.sql.startsWith('UPDATE coin_payments'));assert.ok(correction.sql.includes('credited_coins=0 AND refunded_cents=0 AND provider_updated_at=$3::timestamptz'));assert.ok(correction.sql.includes("status='pending'"));assert.equal(correction.args[2],proof.last_updated_date);assert.ok(seen.some(s=>s.sql.includes('apply_store_payment')&&s.args[2]==='rejected'));}finally{pool.query=query;pool.connect=connect;}});
