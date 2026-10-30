import {paymentConfig,verifyWebhook,StoreError,salesAllowed,sandboxRuntime} from '../server/mercadopago.js';import {processWebhook} from '../server/store.js';
export async function POST(request:Request){try{const c=paymentConfig();if(!c)return Response.json({error:'Integração não configurada.'},{status:503});const url=new URL(request.url);if(!verifyWebhook(request.headers,url,c.secret))return Response.json({error:'Assinatura inválida.'},{status:401});const text=await request.text();if(text.length>16384)return new Response(null,{status:413});let body;try{body=JSON.parse(text);}catch{return new Response(null,{status:400});}const id=url.searchParams.get('data.id')!,type=body.type??url.searchParams.get('type');if(body.data?.id!=null&&String(body.data.id).toLowerCase()!==id.toLowerCase())return new Response(null,{status:400});if(!['order','payment','chargebacks'].includes(type))return Response.json({received:true,ignored:true});await processWebhook((request.headers.get('x-request-id')??'')+':'+id+':'+request.headers.get('x-signature'),type,id);return Response.json({received:true});}catch(e){console.error('payment_notification_failed',e instanceof Error?e.name:'unknown');return Response.json({error:'Aguardando conciliação.'},{status:e instanceof StoreError?e.status:503});}}

export async function GET(){
 let testAccountVerified=false;
 if(process.env.MP_MODE==='test'&&sandboxRuntime()&&process.env.MP_ACCESS_TOKEN&&process.env.MP_COLLECTOR_ID){
  try{const {verifyCollector}=await import('../server/mercadopago.js');await verifyCollector({token:process.env.MP_ACCESS_TOKEN,collector:process.env.MP_COLLECTOR_ID,secret:'',mode:'test',origin:process.env.MP_APP_ORIGIN??''});testAccountVerified=true;}catch{/* Health checks never disclose credentials or provider account details. */}
 }
 return Response.json({service:'fazendinha-payments-webhook',api:'orders',ready:!!paymentConfig(),testAccountVerified,salesEnabled:salesAllowed()},{headers:{'Cache-Control':'no-store'}});
}
