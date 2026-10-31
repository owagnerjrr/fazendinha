import {CROPS,sellAll,type Farm,type Crop} from './farm.js';import {ANIMALS,type AnimalProduct} from './content.js';import {FISH,type Fish} from './fishing.js';
export const VENDOR={x:1030,y:425};
export const atVendor=(p:{x:number;y:number})=>Math.hypot(p.x-VENDOR.x,p.y-VENDOR.y)<=85;
export type SaleItem={id:string;name:string;quantity:number;price:number};
export function saleItems(f:Farm):SaleItem[]{return[
 ...(Object.keys(CROPS) as Crop[]).flatMap(k=>[{id:`crop:${k}`,name:CROPS[k].name,quantity:f.inventory[k],price:CROPS[k].sellPrice},{id:`seed:${k}`,name:`Semente de ${CROPS[k].name.toLowerCase()}`,quantity:f.seeds[k],price:Math.max(1,Math.floor(CROPS[k].seedPrice/2))}]),
 ...(['egg','milk','goatMilk'] as AnimalProduct[]).map(k=>{const a=Object.values(ANIMALS).find(a=>a.product===k)!;return{id:`product:${k}`,name:a.productName,quantity:f.products[k],price:a.sellPrice};}),
 ...(Object.keys(FISH) as Fish[]).map(k=>({id:`fish:${k}`,name:FISH[k].name,quantity:f.fishing?.fish[k]??0,price:FISH[k].price}))
 ].filter(i=>i.quantity>0);}
export function applyVendorSale(f:Farm,c:{type?:unknown;item?:unknown;quantity?:unknown;all?:unknown}){
 if(!atVendor(f.player))return{ok:false,message:'Vá até a venda para vender.'};
 if(c.item===undefined){const total=sellAll(f);return{ok:total>0,message:total?`Venda concluída: +${total} moedas.`:'Não há produção para vender.'};}
 const row=saleItems(f).find(i=>i.id===c.item),quantity=c.quantity;
 if(!row||typeof quantity!=='number'||!Number.isSafeInteger(quantity)||quantity<1||quantity>row.quantity)return{ok:false,message:'Quantidade ou produto inválido.'};
 if(c.all===true&&quantity!==row.quantity)return{ok:false,message:'O estoque mudou. Atualize a venda antes de vender tudo.'};
 const [kind,key]=row.id.split(':');if(kind==='crop')f.inventory[key as Crop]-=quantity;else if(kind==='seed')f.seeds[key as Crop]-=quantity;else if(kind==='product')f.products[key as AnimalProduct]-=quantity;else f.fishing!.fish[key as Fish]-=quantity;
 const total=row.price*quantity;f.coins+=total;return{ok:true,message:`${quantity} × ${row.name}: +${total} moedas.`};
}
