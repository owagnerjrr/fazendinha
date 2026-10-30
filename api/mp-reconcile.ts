import {timingSafeEqual} from 'node:crypto';
import {pool} from '../server/db.js';
import {paymentConfig,verifyCollector,mpRequest,sandboxRuntime} from '../server/mercadopago.js';
import {validateProviderOrder} from '../server/mp-orders.js';
import {settleProviderOrder} from '../server/store.js';
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET,provided=request.headers.get('authorization')??'',expected='Bearer '+(secret??'');
 if(!secret||secret.length<32||Buffer.byteLength(provided)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(provided),Buffer.from(expected)))return Response.json({error:'Unauthorized'},{status:401});
 const config=paymentConfig();if(!config||config.api!=='orders')return Response.json({error:'Unavailable'},{status:503});
 await verifyCollector(config);
 const orders=await pool.query("UPDATE coin_orders SET checked_at=now() WHERE id IN (SELECT id FROM coin_orders WHERE payment_api='orders' AND mode=$1 AND collector_id=$2 AND provider_order_id IS NOT NULL AND created_at>now()-interval '45 days' ORDER BY checked_at ASC NULLS FIRST LIMIT 10) RETURNING id,provider_order_id",[config.mode,config.collector]);
 let processed=0,failed=0;
 for(const order of orders.rows){try{const resource=await mpRequest(config,'/v1/orders/'+encodeURIComponent(order.provider_order_id));
  // Operational diagnostics contain only state enums and timestamps, never payer/card data.
  const safe=(v:unknown)=>typeof v==='string'&&/^[a-z_]{1,60}$/.test(v)?v:undefined;
  console.info('payment_reconciliation',{order:order.id,status:safe(resource.status),detail:safe(resource.status_detail),updated:resource.last_updated_date,payments:(resource.transactions?.payments??[]).map((p:any)=>({status:safe(p.status),detail:safe(p.status_detail)}))});
  await settleProviderOrder(resource,config);processed++;
 }catch{failed++;console.error('payment_reconciliation_failed',{order:order.id});}}
 return Response.json({processed,failed},{status:failed?503:200,headers:{'Cache-Control':'no-store'}});
}

/** Operator-only refund of a sandbox payment; never available for real funds. */
export async function POST(request:Request){
 const secret=process.env.CRON_SECRET,provided=request.headers.get('authorization')??'',expected='Bearer '+(secret??'');
 if(!secret||secret.length<32||Buffer.byteLength(provided)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(provided),Buffer.from(expected)))return Response.json({error:'Unauthorized'},{status:401});
 const config=paymentConfig();if(!config||config.api!=='orders'||config.mode!=='test'||!sandboxRuntime())return Response.json({error:'Sandbox only'},{status:403});
 const raw=await request.text();if(raw.length>300)return Response.json({error:'Invalid request'},{status:400});let input;try{input=JSON.parse(raw);}catch{return Response.json({error:'Invalid JSON'},{status:400});}
 if(input.action!=='refund'||typeof input.order!=='string'||! /^[0-9a-f-]{36}$/.test(input.order))return Response.json({error:'Invalid action'},{status:400});
 await verifyCollector(config);const order=(await pool.query("SELECT * FROM coin_orders WHERE id=$1 AND mode='test' AND payment_api='orders' AND collector_id=$2",[input.order,config.collector])).rows[0];
 if(!order?.provider_order_id?.startsWith('ORDTST'))return Response.json({error:'Test order not found'},{status:404});
 const resource=await mpRequest(config,'/v1/orders/'+encodeURIComponent(order.provider_order_id)),proof=validateProviderOrder(resource,order,config);
 if(proof.status!=='refunded'){if(proof.status!=='approved')return Response.json({error:'Only approved test orders can be refunded'},{status:409});await mpRequest(config,'/v1/orders/'+encodeURIComponent(order.provider_order_id)+'/refund',{},order.id);}
 const updated=await mpRequest(config,'/v1/orders/'+encodeURIComponent(order.provider_order_id));await settleProviderOrder(updated,config);return Response.json({status:validateProviderOrder(updated,order,config).status},{headers:{'Cache-Control':'no-store'}});
}
