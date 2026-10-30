import test from 'node:test';import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';import {POST} from '../api/mp-webhook';
test('webhook diagnostics distinguish rejected and ignored requests without recording signatures or secrets',async()=>{
 const saved={...process.env},info=console.info,logs:unknown[]=[];
 Object.assign(process.env,{MP_MODE:'test',MP_ACCESS_TOKEN:'TEST-private-fixture',MP_COLLECTOR_ID:'123',MP_WEBHOOK_SECRET:'private-signing-fixture',MP_APP_ORIGIN:'https://farm.test'});console.info=(...args)=>{logs.push(args);};
 try{
  let result=await POST(new Request('https://farm.test/api/mp-webhook?data.id=123',{method:'POST',body:'{}'}));assert.equal(result.status,401);assert.ok(JSON.stringify(logs).includes('missing_signature'));
  const headers={'x-request-id':'fixture-request','x-signature':'ts=1793390400,v1='+createHmac('sha256','private-signing-fixture').update('id:123;request-id:fixture-request;ts:1793390400;').digest('hex')};
  result=await POST(new Request('https://farm.test/api/mp-webhook?data.id=123',{method:'POST',headers,body:'invalid'}));assert.equal(result.status,400);assert.ok(JSON.stringify(logs).includes('invalid_json'));
  result=await POST(new Request('https://farm.test/api/mp-webhook?data.id=123',{method:'POST',headers,body:JSON.stringify({type:'order',data:{id:'456'}})}));assert.equal(result.status,400);assert.ok(JSON.stringify(logs).includes('resource_mismatch'));
  result=await POST(new Request('https://farm.test/api/mp-webhook?data.id=123',{method:'POST',headers,body:JSON.stringify({type:'unrelated',data:{id:'123'}})}));assert.equal(result.status,200);assert.deepEqual(await result.json(),{received:true,ignored:true});
  const text=JSON.stringify(logs);for(const secret of ['private-signing-fixture','TEST-private-fixture',headers['x-signature']])assert.equal(text.includes(secret),false);
 }finally{console.info=info;for(const key of Object.keys(process.env))if(!(key in saved))delete process.env[key];Object.assign(process.env,saved);}
});
