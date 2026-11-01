// Immutable fallback for pre-versioned orders; never use current offers to reinterpret a saved purchase.
export const LEGACY_PURCHASE_PACKS={p10:{coins:10000,cents:1000},p20:{coins:20000,cents:2000},p30:{coins:30000,cents:3000},p40:{coins:40000,cents:4000},p50:{coins:50000,cents:5000},f5:{coins:0,cents:1000,fertilizers:5}} as const;
export const COIN_PACKS={p10:{coins:500,cents:1000},p20:{coins:1000,cents:2000},p30:{coins:1500,cents:3000},p40:{coins:2000,cents:4000},p50:{coins:2500,cents:5000}} as const;
export const PURCHASE_PACKS={...COIN_PACKS,f5:{coins:0,cents:1000,fertilizers:5}} as const;
export type PackId=keyof typeof PURCHASE_PACKS;
export const packLabel=(id:string,coins=0)=>id==='outfit_nebula'?'Sentinela Nebulosa':id==='f5'?'5 fertilizantes':`${coins.toLocaleString('pt-BR')} moedas`;
export const OUTFITS={nebula:{name:'Sentinela Nebulosa',price:0,description:'Armadura violeta com capacete vermelho, visor verde e ombreiras amplas. Roupa permanente na sua conta.',color:'#754485'},adventure:{name:'Guardião do Vale',price:600,description:'Túnica verde, cinto de couro e botas de aventura.',color:'#408653'},space:{name:'Explorador Solar',price:850,description:'Armadura âmbar, placas protetoras e detalhes tecnológicos.',color:'#dc8a35'},gardener:{name:'Jardineiro Rubi',price:400,description:'Macacão azul, camiseta vermelha e boné de trabalho.',color:'#376db1'}} as const;
export type OutfitId=keyof typeof OUTFITS;
export const money=(cents:number)=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const ORDER_LABELS:Record<string,string>={created:'Preparando pagamento',pending:'Aguardando pagamento',in_process:'Em análise',approved:'Aprovado',rejected:'Recusado',cancelled:'Cancelado',expired:'Expirado',refunded:'Reembolsado',partially_refunded:'Reembolso parcial',charged_back:'Contestado',in_mediation:'Em contestação',creation_failed:'Não foi possível abrir o pagamento'};
