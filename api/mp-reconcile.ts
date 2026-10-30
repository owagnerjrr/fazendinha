import {timingSafeEqual} from 'node:crypto';
import {pool} from '../server/db.js';
import {paymentConfig,verifyCollector,mpRequest} from '../server/mercadopago.js';
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
