import {paymentConfig,verifyWebhook,StoreError,salesAllowed,sandboxRuntime} from '../server/mercadopago.js';import {processWebhook} from '../server/store.js';
export async function POST(request:Request){
 const url=new URL(request.url),resource=url.searchParams.get('data.id');
 const safeResource=resource&&/^[A-Za-z0-9_-]{1,100}$/.test(resource)?resource:undefined;
 const log=(phase:string,status:number,reason?:string)=>console.info('payment_notification',{phase,status,reason,resource:safeResource,hasSignature:!!request.headers.get('x-signature'),hasRequestId:!!request.headers.get('x-request-id')});
 log('received',0);
 try{
  const c=paymentConfig();if(!c){log('rejected',503,'not_configured');return Response.json({error:'Integração não configurada.'},{status:503});}
  if(!verifyWebhook(request.headers,url,c.secret)){log('rejected',401,!resource?'missing_resource':!request.headers.get('x-signature')?'missing_signature':!request.headers.get('x-request-id')?'missing_request_id':'signature_mismatch');return Response.json({error:'Assinatura inválida.'},{status:401});}
  const text=await request.text();if(text.length>16384){log('rejected',413,'too_large');return new Response(null,{status:413});}
  let body;try{body=JSON.parse(text);}catch{log('rejected',400,'invalid_json');return new Response(null,{status:400});}
  const id=resource!,type=body?.type??url.searchParams.get('type');
  if(body?.data?.id!=null&&String(body.data.id).toLowerCase()!==id.toLowerCase()){log('rejected',400,'resource_mismatch');return new Response(null,{status:400});}
  if(!['order','payment','chargebacks'].includes(type)){log('ignored',200,'unsupported_event');return Response.json({received:true,ignored:true});}
  await processWebhook((request.headers.get('x-request-id')??'')+':'+id+':'+request.headers.get('x-signature'),type,id);log('processed',200);return Response.json({received:true});
 }catch(e){const status=e instanceof StoreError?e.status:503;log('failed',status,e instanceof Error?e.name:'unknown');return Response.json({error:'Aguardando conciliação.'},{status});}
}

export async function GET(){
 let testAccountVerified=false;
 if(process.env.MP_MODE==='test'&&sandboxRuntime()&&process.env.MP_ACCESS_TOKEN&&process.env.MP_COLLECTOR_ID){
  try{const {verifyCollector}=await import('../server/mercadopago.js');await verifyCollector({token:process.env.MP_ACCESS_TOKEN,collector:process.env.MP_COLLECTOR_ID,secret:'',mode:'test',origin:process.env.MP_APP_ORIGIN??''});testAccountVerified=true;}catch{/* Health checks never disclose credentials or provider account details. */}
 }
 return Response.json({service:'fazendinha-payments-webhook',api:'orders',diagnosticVersion:3,ready:!!paymentConfig(),testAccountVerified,salesEnabled:salesAllowed()},{headers:{'Cache-Control':'no-store'}});
}
