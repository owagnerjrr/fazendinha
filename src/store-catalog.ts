export const COIN_PACKS={p10:{coins:10000,cents:1000},p20:{coins:20000,cents:2000},p30:{coins:30000,cents:3000},p40:{coins:40000,cents:4000},p50:{coins:50000,cents:5000}} as const;
export type PackId=keyof typeof COIN_PACKS;
export const OUTFITS={adventure:{name:'Guardião do Vale',price:2500,description:'Túnica verde, cinto de couro e botas de aventura.',color:'#408653'},space:{name:'Explorador Solar',price:4000,description:'Armadura âmbar, placas protetoras e detalhes tecnológicos.',color:'#dc8a35'},gardener:{name:'Jardineiro Rubi',price:2000,description:'Macacão azul, camiseta vermelha e boné de trabalho.',color:'#376db1'}} as const;
export type OutfitId=keyof typeof OUTFITS;
export const money=(cents:number)=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const ORDER_LABELS:Record<string,string>={created:'Preparando pagamento',pending:'Aguardando pagamento',in_process:'Em análise',approved:'Aprovado',rejected:'Recusado',cancelled:'Cancelado',expired:'Expirado',refunded:'Reembolsado',partially_refunded:'Reembolso parcial',charged_back:'Contestado',in_mediation:'Em contestação',creation_failed:'Não foi possível abrir o pagamento'};
