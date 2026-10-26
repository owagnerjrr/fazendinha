import { auth, CloudFarm, type Friend, type Listing } from './cloud';
import { CROPS, type Crop } from './farm';
import { ECONOMY, levelOf, type OnlineFarm } from './online-rules';
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const esc=(s:string)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function setupOnlineUI(cloud:CloudFarm,open:(title:string,html:string)=>void,close:()=>void,toast:(s:string)=>void,getFarm:()=>OnlineFarm,onOffline:()=>void) {
  const status=(message:string)=>{const el=$('online-feedback');if(el)el.textContent=message;else toast(message);};
  const run=async(button:HTMLButtonElement,work:()=>Promise<unknown>)=>{button.disabled=true;try{await work();}catch(e){status(e instanceof Error?e.message:'Não foi possível concluir.');}finally{button.disabled=false;}};
  function account() {
    if(cloud.active) {
      open('Sua fazenda online',`<p>Bem-vindo, <b>${esc(cloud.name)}</b>. Use a mesma conta no celular e no PC para continuar sua fazenda.</p><p>Seu código de amigo: <strong class="friend-code">${esc(cloud.code)}</strong></p><p class="quiet-note">A fazenda de teste deste aparelho continua guardada separadamente. A fazenda online começa com uma economia nova e protegida.</p><p id="online-feedback" role="status"></p><button class="primary" id="sync-now">Sincronizar agora</button><button class="secondary" id="logout">Sair da conta e voltar ao teste local</button>`);
      $('sync-now').onclick=()=>run($<HTMLButtonElement>('sync-now'),async()=>{await cloud.retryPending();await cloud.refresh();status('Fazenda sincronizada.');});
      $('logout').onclick=()=>run($<HTMLButtonElement>('logout'),async()=>{await cloud.disconnect();onOffline();close();});
      return;
    }
    open('Seu cantinho em qualquer tela',`<p>Entre ou crie sua conta para salvar a fazenda online. Seu teste local permanece guardado neste aparelho.</p><form id="auth-form" class="farm-form"><label>Seu nome<input name="name" autocomplete="nickname" maxlength="40" placeholder="Como quer ser chamado?" /></label><label>E-mail<input name="email" type="email" autocomplete="email" required /></label><label>Senha<input name="password" type="password" autocomplete="current-password" minlength="8" maxlength="128" required /></label><p id="online-feedback" role="status" aria-live="polite"></p><button class="primary" type="submit" id="login">Entrar</button><button class="secondary" type="button" id="signup">Criar conta</button><button class="secondary" type="button" id="recover">Entrar com código por e-mail</button></form><p class="quiet-note">Na versão online de testes, tempos e preços ainda podem ser ajustados. Para jogar sem conta, feche esta janela.</p>`);
    const form=$<HTMLFormElement>('auth-form');
    const login=async(signup:boolean)=>{
      if(!form.reportValidity())return;
      const data=new FormData(form),email=String(data.get('email')),password=String(data.get('password')),name=String(data.get('name')||'Fazendeiro');
      const buttons=Array.from(form.querySelectorAll('button'));buttons.forEach(b=>b.disabled=true);status('Abrindo as porteiras…');
      try{
        const a=await auth(),result=signup?await a.signUp.email({email,password,name}):await a.signIn.email({email,password});
        if(result.error)throw new Error(result.error.message||'Confira seu e-mail e sua senha.');
        if(await cloud.connect()){close();toast('Sua fazenda online está pronta!');}else status('Confira seu e-mail para verificar a conta e depois entre.');
      }catch(e){status(e instanceof Error?e.message:'Não foi possível entrar.');}finally{buttons.forEach(b=>b.disabled=false);}
    };
    form.onsubmit=e=>{e.preventDefault();void login(false);};$('signup').onclick=()=>void login(true);
    $('recover').onclick=()=>run($<HTMLButtonElement>('recover'),async()=>{
      const email=form.querySelector<HTMLInputElement>('[name=email]')!;if(!email.reportValidity()||!email.value)return;
      const a=await auth(),r=await a.emailOtp.sendVerificationOtp({email:email.value,type:'sign-in'});if(r.error)throw new Error(r.error.message);
      open('Confira seu e-mail',`<p>Enviamos um código para entrar na sua conta.</p><form id="otp-form" class="farm-form"><label>Código<input name="otp" inputmode="numeric" autocomplete="one-time-code" required /></label><p id="online-feedback" role="status"></p><button class="primary" id="verify-otp">Entrar com código</button></form>`);
      const address=email.value;$<HTMLFormElement>('otp-form').onsubmit=e=>{e.preventDefault();void run($<HTMLButtonElement>('verify-otp'),async()=>{const r=await a.signIn.emailOtp({email:address,otp:String(new FormData($<HTMLFormElement>('otp-form')).get('otp'))});if(r.error)throw new Error(r.error.message);if(await cloud.connect())close();});};
    });
  }
  function progression(){
    const f=getFarm(),next=ECONOMY.expansions.find(e=>e.plots>f.unlockedPlots),level=levelOf(f.xp);
    open('Sua fazenda crescendo',`<p><b>Nível ${level}</b> · ${f.xp} XP · próximo nível em ${level*level*40} XP</p><p>Energia: <b>${f.energy}/${ECONOMY.energyMax}</b>. Recupera 1 por minuto, mesmo com o jogo fechado. Enxada usa 2; plantar, regar e colher usam 1.</p><p>${f.unlockedPlots} canteiros liberados. Cada colheita rende 10 XP.</p>${(Object.keys(CROPS) as Crop[]).map(c=>`<div class="item-row"><div class="item-info"><strong>${CROPS[c].name}</strong><small>${CROPS[c].seconds}s · semente ${CROPS[c].seedPrice} · colheita ${CROPS[c].yield} × ${CROPS[c].sellPrice} moedas · lucro ${CROPS[c].yield*CROPS[c].sellPrice-CROPS[c].seedPrice}</small></div></div>`).join('')}<p id="online-feedback" role="status"></p>${next?`<button class="primary" id="expand" ${level<next.level||f.coins<next.price?'disabled':''}>Liberar mais 6 canteiros · nível ${next.level} · ${next.price} moedas</button>`:'<p>Todos os canteiros liberados!</p>'}`);
    if(next)$('expand').onclick=()=>run($<HTMLButtonElement>('expand'),async()=>{const r=await cloud.command({type:'expand'});toast(r.message!);progression();});
  }
  async function community(){
    open('Amigos e feira',`<p id="online-feedback" role="status">Abrindo a porteira dos vizinhos…</p>`);
    try{
      const data=await cloud.request('?community=1') as {friends:Friend[];market:Listing[]};
      open('Amigos e feira',`<p>Seu código: <strong class="friend-code">${esc(cloud.code)}</strong></p><form id="friend-form" class="farm-form inline-form"><label>Código de um amigo<input name="code" minlength="10" maxlength="10" required autocapitalize="characters" /></label><button class="secondary">Adicionar</button></form><p id="online-feedback" role="status" aria-live="polite"></p><h3>Seus vizinhos</h3>${data.friends.length?data.friends.map(f=>`<div class="item-row"><div class="item-info"><strong>${esc(f.name)}</strong><small>${esc(f.code)} · ${f.accepted?'Amigos':f.incoming?'Quer ser seu amigo':'Pedido enviado'}</small></div>${f.accepted?`<button data-visit="${f.code}">Visitar</button>`:f.incoming?`<button data-accept="${f.code}">Aceitar</button>`:''}</div>`).join(''):'<p>Convide alguém pelo código para visitar sua fazenda.</p>'}<h3>Feira do vale</h3><p>O preço é pelo lote completo. Os produtos anunciados ficam reservados até vender ou cancelar.</p><form class="farm-form" id="listing-form"><label>Produto<select name="crop">${(Object.keys(CROPS) as Crop[]).map(c=>`<option value="${c}">${CROPS[c].name} (${getFarm().inventory[c]} no celeiro)</option>`).join('')}</select></label><div class="form-pair"><label>Quantidade<input name="quantity" type="number" min="1" max="99" value="1" required /></label><label>Preço do lote<input name="price" type="number" min="1" max="9999" value="12" required /></label></div><button class="secondary">Anunciar produtos</button></form>${data.market.length?data.market.map(m=>`<div class="item-row"><div class="item-info"><strong>${m.quantity} ${CROPS[m.crop as Crop].name}</strong><small>${esc(m.name)} · ${m.price} moedas pelo lote</small></div><button data-listing="${m.id}" data-mine="${m.mine}">${m.mine?'Cancelar':'Comprar'}</button></div>`).join(''):'<p>A feira ainda está vazia. Publique a primeira oferta!</p>'}`);
      $<HTMLFormElement>('friend-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget as HTMLFormElement;void run(form.querySelector('button')!,async()=>{const r=await cloud.command({type:'friend',code:String(new FormData(form).get('code')).trim().toUpperCase()});await community();status(r.message!);});};
      document.querySelectorAll<HTMLButtonElement>('[data-accept]').forEach(b=>b.onclick=()=>run(b,async()=>{await cloud.command({type:'accept',code:b.dataset.accept});await community();}));
      document.querySelectorAll<HTMLButtonElement>('[data-visit]').forEach(b=>b.onclick=()=>void visit(b.dataset.visit!));
      document.querySelectorAll<HTMLButtonElement>('[data-listing]').forEach(b=>b.onclick=()=>run(b,async()=>{const r=await cloud.command({type:b.dataset.mine==='true'?'cancel-listing':'trade',listing:b.dataset.listing});await community();status(r.message!);}));
      $<HTMLFormElement>('listing-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget as HTMLFormElement,d=new FormData(form);void run(form.querySelector('button')!,async()=>{const r=await cloud.command({type:'list',crop:d.get('crop'),quantity:Number(d.get('quantity')),price:Number(d.get('price'))});await community();status(r.message!);});};
    }catch(e){status(e instanceof Error?e.message:'Não foi possível abrir a comunidade.');}
  }
  async function visit(code:string){
    try{
      const v=await cloud.request(`?visit=${code}`);
      open(`Fazenda de ${esc(v.name)}`,`<p>Visita aos canteiros do seu amigo. Você pode regar uma plantação por dia nesta fazenda e ganhar 5 XP.</p><div class="visit-grid">${v.plots.map((p:any)=>`<button class="visit-plot" data-help="${p.id}" ${!p.crop||p.wateredAt!==null?'disabled':''}>${p.crop?`<img src="/assets/v2/${p.crop}-3.png" alt="${CROPS[p.crop as Crop].name}" />`:'🌱'}<small>${!p.crop?'Vazio':p.wateredAt===null?'Ajudar a regar':'Regado'}</small></button>`).join('')}</div><p id="online-feedback" role="status"></p><button class="secondary" id="back-community">Voltar aos amigos</button>`);
      document.querySelectorAll<HTMLButtonElement>('[data-help]').forEach(b=>b.onclick=()=>run(b,async()=>{const r=await cloud.command({type:'help',code,plot:Number(b.dataset.help)});await visit(code);status(r.message!);}));
      $('back-community').onclick=()=>void community();
    }catch(e){status(e instanceof Error?e.message:'Não foi possível visitar.');}
  }
  $('account').onclick=account;$('progression').onclick=progression;$('community').onclick=()=>void community();
  return {account,progression,community};
}
