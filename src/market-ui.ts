import type { Listing, CloudFarm } from './cloud';
import type { Farm } from './farm';
import { MARKET_IDS, MARKET_ITEMS, isMarketItem, marketStock, type MarketItem } from './market';

type Filter='all'|'crop'|'animal'|'mine';
export type MarketView={filter:Filter;item:MarketItem};
const esc=(s:string)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

export function mountMarket(root:HTMLElement,listings:Listing[],getFarm:()=>Farm,cloud:Pick<CloudFarm,'command'|'refresh'>,view:MarketView,reload:(message?:string)=>Promise<void>,notify:(message:string)=>void) {
  let busy=false;
  function render(){
    const farm=getFarm();
    const available=MARKET_IDS.filter(id=>marketStock(farm,id)>0);
    if(marketStock(farm,view.item)<1&&available.length)view.item=available[0];
    const shown=listings.filter(l=>isMarketItem(l.crop)&&(view.filter==='all'||(view.filter==='mine'?l.mine:MARKET_ITEMS[l.crop].category===view.filter)));
    root.innerHTML=`<div class="market-heading"><h3>Feira do vale</h3><button class="secondary" id="refresh-market" type="button">Atualizar feira</button></div>
      <p>Ovos, leites, flores, frutas e vegetais. O preço é pelo lote completo; os produtos anunciados ficam reservados.</p>
      <p class="market-wallet">Seu saldo: <strong>${farm.coins} moedas</strong> · ${listings.filter(l=>l.mine).length}/10 ofertas suas abertas</p>
      <form class="farm-form" id="listing-form"><label>Produto para anunciar<select name="crop">${MARKET_IDS.map(id=>`<option value="${id}" ${id===view.item?'selected':''} ${marketStock(farm,id)<1?'disabled':''}>${MARKET_ITEMS[id].name} (${marketStock(farm,id)} no celeiro)</option>`).join('')}</select></label>
      <div class="form-pair"><label>Quantidade<input name="quantity" type="number" min="1" max="99" value="1" required /></label><label>Preço do lote<input name="price" type="number" min="1" max="9999" value="${MARKET_ITEMS[view.item].basePrice}" required /></label></div>
      <p class="quiet-note" id="listing-hint"></p><button class="secondary" id="publish-listing" ${!available.length?'disabled':''}>Anunciar produtos</button></form>
      <div class="market-filters" role="group" aria-label="Filtrar ofertas">${([['all','Todos'],['crop','Da horta'],['animal','Dos animais'],['mine','Minhas ofertas']] as const).map(([id,name])=>`<button class="secondary" type="button" data-market-filter="${id}" aria-pressed="${view.filter===id}">${name}</button>`).join('')}</div>
      <p class="quiet-note" role="status">${shown.length} ${shown.length===1?'oferta encontrada':'ofertas encontradas'}. Suas ofertas aparecem primeiro.</p>
      ${shown.length?shown.map(l=>{const item=MARKET_ITEMS[l.crop as MarketItem];return `<div class="item-row market-offer"><span class="market-product-icon" aria-hidden="true">${item.icon}</span><div class="item-info"><strong>${l.quantity} × ${item.name}</strong><small>${l.mine?'Sua oferta':esc(l.name)} · ${l.price} moedas pelo lote</small><small>${(l.price/l.quantity).toLocaleString('pt-BR',{maximumFractionDigits:2})} moedas por unidade</small></div><button data-listing="${l.id}" data-mine="${l.mine}" ${!l.mine&&farm.coins<l.price?'disabled':''}>${l.mine?'Cancelar':farm.coins<l.price?'Sem saldo':'Comprar'}</button></div>`;}).join(''):'<p>Nenhuma oferta neste filtro. Colete produtos e anuncie seu primeiro lote!</p>'}
      <p class="quiet-note">São exibidas até 60 ofertas abertas. Animais vivos, rações e equipamentos não são negociados na feira.</p>`;
    const form=root.querySelector<HTMLFormElement>('#listing-form')!;
    const item=form.elements.namedItem('crop') as HTMLSelectElement;
    const quantity=form.elements.namedItem('quantity') as HTMLInputElement;
    const price=form.elements.namedItem('price') as HTMLInputElement;
    const hint=root.querySelector<HTMLElement>('#listing-hint')!;
    function updateHint(){
      const stock=marketStock(getFarm(),view.item);quantity.max=String(Math.min(99,stock));
      hint.textContent=stock?`${stock} disponíveis. Na venda do celeiro, cada unidade vale ${MARKET_ITEMS[view.item].basePrice} moedas. Você escolhe o preço na feira.`:'Seu celeiro está vazio. Colha ou colete a produção dos animais para anunciar.';
    }
    item.onchange=()=>{if(!isMarketItem(item.value))return;view.item=item.value;quantity.value='1';price.value=String(MARKET_ITEMS[view.item].basePrice);updateHint();};updateHint();
    async function run(work:()=>Promise<void>){
      if(busy)return;busy=true;
      root.querySelectorAll<HTMLButtonElement|HTMLInputElement|HTMLSelectElement>('button,input,select').forEach(e=>e.disabled=true);
      try{await work();}catch(e){notify(e instanceof Error?e.message:'Não foi possível concluir.');render();}finally{busy=false;}
    }
    root.querySelectorAll<HTMLButtonElement>('[data-market-filter]').forEach(b=>b.onclick=()=>{if(busy)return;view.filter=b.dataset.marketFilter as Filter;render();});
    root.querySelector<HTMLButtonElement>('#refresh-market')!.onclick=()=>void run(async()=>{await cloud.refresh();await reload('Feira atualizada.');});
    root.querySelectorAll<HTMLButtonElement>('[data-listing]').forEach(b=>b.onclick=()=>void run(async()=>{const r=await cloud.command({type:b.dataset.mine==='true'?'cancel-listing':'trade',listing:b.dataset.listing});await reload(r.message);}));
    form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity()||!available.length)return;const command={type:'list',crop:view.item,quantity:Number(quantity.value),price:Number(price.value)};void run(async()=>{const r=await cloud.command(command);await reload(r.message);});};
  }
  render();
}
