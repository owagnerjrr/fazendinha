import {COIN_PACKS,type PackId} from '../src/store-catalog.js';
import {StoreError,type MPConfig} from './mercadopago.js';
export const providerOrderId=(value:unknown):value is string=>typeof value==='string'&&/^ORD[A-Z0-9]{20,50}$/.test(value);
/** Monetary strings are parsed without floating point rounding or coercion. */
export function orderCents(value:unknown){if(typeof value!=='string'||!/^\d{1,10}(\.\d{1,2})?$/.test(value))throw new StoreError('Valor da order inválido.',409);const [whole,fraction='']=value.split('.');return Number(whole)*100+Number(fraction.padEnd(2,'0'));}
export function orderPayload(order:any,email:string,methods:any[]){
 const pack=COIN_PACKS[order.package as PackId],amount=(pack.cents/100).toFixed(2),back=`${order.origin}/?store=return&order=${order.id}`;
 const allowed=(m:any)=>order.method==='pix'?m.id==='pix':m.payment_type_id==='credit_card';
 if(!Array.isArray(methods)||!methods.some(m=>allowed(m)&&m.status==='active'))throw new StoreError('Forma de pagamento indisponível na conta recebedora.',503);
 const types=[...new Set<string>(methods.filter(m=>!allowed(m)).map(m=>String(m.payment_type_id)).filter(t=>!methods.some(m=>allowed(m)&&m.payment_type_id===t)).concat(['wallet','account_money']))];
 return{type:'online',processing_mode:'manual',total_amount:amount,external_reference:order.id,expiration_time:order.method==='pix'?'PT30M':'P1D',
  payer:{email},items:[{title:`Fazenda Feliz · ${pack.coins} moedas`,unit_price:amount,quantity:1,external_code:order.package}],
  config:{online:{success_url:back,failure_url:back,pending_url:back,auto_return:'approved',callback_url:order.origin+'/api/mp-webhook',retries:{allowed:false}},payment_method:{max_installments:1,default_installments:1,not_allowed_types:types,not_allowed_ids:methods.filter(m=>!allowed(m)).map(m=>String(m.id))}}};
}
/** Only call with a response obtained from the authenticated Orders API. */
export function validateProviderOrder(p:any,order:any,c:MPConfig){
 if(!providerOrderId(p.id)||p.id.startsWith('ORDTST')!==(c.mode==='test')||order.mode!==c.mode||order.collector_id!==c.collector||String(p.user_id)!==c.collector||p.external_reference!==order.id||p.type!=='online'||p.processing_mode!=='manual'||p.currency!=='BRL'||p.country_code!=='BRA'||orderCents(p.total_amount)!==order.amount_cents||order.provider_order_id&&p.id!==order.provider_order_id||c.application&&String(p.integration_data?.application_id)!==c.application)throw new StoreError('Order não corresponde ao pedido.',409);
 if(p.live_mode!=null&&p.live_mode!==(c.mode==='production'))throw new StoreError('Ambiente de pagamento incorreto.',409);
 const updated=p.last_updated_date;if(typeof updated!=='string'||!Number.isFinite(Date.parse(updated)))throw new StoreError('Data da order inválida.',409);
 let status:string;switch(p.status){case 'created':case 'action_required':status='pending';break;case 'processing':status='in_process';break;case 'processed':if(!['accredited','partially_refunded'].includes(p.status_detail))throw new StoreError('Order aguardando conciliação.',409);status='approved';break;case 'failed':status='rejected';break;case 'canceled':case 'cancelled':status='cancelled';break;case 'refunded':status='refunded';break;case 'charged_back':status='charged_back';break;default:throw new StoreError('Situação da order não reconhecida.',409);}
 const payments=p.transactions?.payments??[];if(!Array.isArray(payments))throw new StoreError('Transações inválidas.',409);
 let refund=0;for(const payment of payments){
  if(order.method==='pix'?payment.payment_method?.id!=='pix':payment.payment_method?.type!=='credit_card'||payment.payment_method?.installments!==1)throw new StoreError('Forma de pagamento diverge do pedido.',409);
  refund+=orderCents(payment.refunded_amount??'0.00');
 }
 if(p.transactions?.chargebacks?.length)status='charged_back';
 if(status==='approved'&&(orderCents(p.total_paid_amount)!==order.amount_cents||!payments.length))throw new StoreError('Order ainda não paga integralmente.',409);
 if(status==='refunded')refund=order.amount_cents;
 if(refund>order.amount_cents||p.status_detail==='partially_refunded'&&refund<=0)throw new StoreError('Reembolso aguardando conciliação.',409);
 const qr=payments.find((payment:any)=>payment.payment_method?.id==='pix')?.payment_method;
 return{status,refund,updated,qr:typeof qr?.qr_code==='string'?qr.qr_code:null,qrImage:typeof qr?.qr_code_base64==='string'?qr.qr_code_base64:null};
}
