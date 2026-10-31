import {UNLOCKS} from './progression';
import {REFERRAL_REWARD} from './referrals';
import {mountChat} from './chat-ui';
import {plantNeeds} from './plant-care';
import {googleSignIn, auth, CloudFarm, type Friend, type Listing } from './cloud';

import { hasPests, remaining, CROPS, type Crop } from './farm';
import { ECONOMY, levelOf, type OnlineFarm } from './online-rules';
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const esc=(s:string)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function setupOnlineUI(cloud:CloudFarm,open:(title:string,html:string)=>void,close:()=>void,toast:(s:string)=>void,getFarm:()=>OnlineFarm,onOffline:()=>void,onNewProfile?:()=>void,onVisit?:(code:string,data:any)=>void) {
  const status=(message:string)=>{const el=$('online-feedback');if(el)el.textContent=message;else toast(message);};
  const run=async(button:HTMLButtonElement,work:()=>Promise<unknown>)=>{button.disabled=true;try{await work();}catch(e){status(e instanceof Error?e.message:'Não foi possível concluir.');}finally{button.disabled=false;}};
  let stopChat:(()=>void)|undefined;let communityTimer:ReturnType<typeof setTimeout>|undefined;
  const panel=document.getElementById('panel') as HTMLDialogElement;panel.addEventListener('close',()=>{stopChat?.();stopChat=undefined;if(communityTimer)clearTimeout(communityTimer);});
  const google=googleSignIn;
  function account() {
    if(cloud.active) {
      open('Sua fazenda online',`<p>Bem-vindo, <b>${esc(cloud.name)}</b>. Use a mesma conta no celular e no PC para continuar sua fazenda.</p><p id="account-details"></p><p>Seu código de amigo: <strong class="friend-code">${esc(cloud.code)}</strong></p><p class="quiet-note">A fazenda de teste deste aparelho continua guardada separadamente. A fazenda online começa com uma economia nova e protegida.</p><p id="online-feedback" role="status"></p><button class="secondary google-login" id="link-google">Vincular minha conta Google</button><p class="quiet-note">Você autoriza apenas o acesso ao jogo. Não lemos mensagens do Gmail. Na beta, a autorização mostra o nome Neon.</p><button class="primary" id="sync-now">Sincronizar agora</button><button class="secondary" id="logout">Sair da conta e voltar ao teste local</button>`);
      void auth().then(async a=>{const [session,accounts]=await Promise.all([a.getSession(),a.listAccounts()]);const details=document.getElementById('account-details');if(!details)return;const email=session.data?.user?.email??'';details.textContent=email+(accounts.data?.some((a:any)=>a.providerId==='google')?' · Google vinculado':'');}).catch(()=>{});
      $('link-google').onclick=()=>run($<HTMLButtonElement>('link-google'),()=>google(true));
      $('sync-now').onclick=()=>run($<HTMLButtonElement>('sync-now'),async()=>{await cloud.retryPending();await cloud.refresh();status('Fazenda sincronizada.');});
      $('logout').onclick=()=>run($<HTMLButtonElement>('logout'),async()=>{await cloud.disconnect();onOffline();close();});
      return;
    }
    open('Seu cantinho em qualquer tela',`<button class="secondary" id="new-profile">Escolher nome e personagem</button><p>Entre ou crie sua conta para salvar a fazenda online. Seu teste local permanece guardado neste aparelho.</p><button class="secondary google-login" id="google-login">Continuar com Google / Gmail</button><p class="quiet-note">Na beta, o Google mostra Neon como provedor de acesso. Não pedimos acesso às suas mensagens.</p><form id="auth-form" class="farm-form"><label>Seu nome<input name="name" autocomplete="nickname" maxlength="40" placeholder="Como quer ser chamado?" /></label><label>E-mail<input name="email" type="email" autocomplete="email" required /></label><label>Senha<input name="password" type="password" autocomplete="current-password" minlength="8" maxlength="128" required /></label><p id="online-feedback" role="status" aria-live="polite"></p><button class="primary" type="submit" id="login">Entrar</button><button class="secondary" type="button" id="signup">Criar conta</button><button class="secondary" type="button" id="recover">Entrar com código por e-mail</button></form><p class="quiet-note">Na versão online de testes, tempos e preços ainda podem ser ajustados. Para jogar sem conta, feche esta janela.</p>`);
    $('new-profile').onclick=()=>{close();onNewProfile?.();};
    $('google-login').onclick=()=>run($<HTMLButtonElement>('google-login'),()=>google());
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
    open('Sua fazenda crescendo',`<p><b>Nível ${level}</b> · ${f.xp} XP · próximo nível em ${level*level*20} XP</p><p>Jogue no seu ritmo: as ferramentas não exigem energia nem pausas para descansar.</p><p>${f.unlockedPlots} canteiros liberados. Cada colheita rende 20 XP.</p>${UNLOCKS.map(u=>`<div class="item-row"><div class="item-info"><strong>Nível ${u.level} ${level>=u.level?'✓':'🔒'}</strong><small>${u.label}</small></div></div>`).join('')}${f.progressionVersion!==1?'<p class="quiet-note">Seu progresso anterior e seus acessos foram preservados.</p>':''}<p id="online-feedback" role="status"></p>${next?`<button class="primary" id="expand" ${level<next.level||f.coins<next.price?'disabled':''}>Liberar mais 6 canteiros · nível ${next.level} · ${next.price} moedas</button>`:'<p>Todos os canteiros liberados!</p>'}`);
    if(next)$('expand').onclick=()=>run($<HTMLButtonElement>('expand'),async()=>{const r=await cloud.command({type:'expand'});toast(r.message!);progression();});
  }

  async function community(message='',preserveScroll=false){
    stopChat?.();if(communityTimer)clearTimeout(communityTimer);
    const panel=$<HTMLDialogElement>('panel');const scroll=preserveScroll?panel?.scrollTop??0:0;
    if(!preserveScroll)open('Amigos',`<p id="online-feedback" role="status">Abrindo a porteira dos vizinhos…</p>`);
    try{
      const data=await cloud.request('?community=1&friendsOnly=1') as {friends:Friend[];blocked:{code:string;name:string}[];market:Listing[];referrals?:{completed:number;pending:number;earned:number;verificationPending:boolean}};
      open('Amigos',`<section class="invitation-card"><img src="/assets/v29/invite.png" alt="Um convite ao vale" style="width:100%;border-radius:16px"/><h3>Venha conhecer minha fazenda!</h3><p>Um convite de <b>${esc(cloud.name)}</b> · Fazendinha WJ</p><p>Ganhe <b>${REFERRAL_REWARD.toLocaleString('pt-BR')} moedas</b> por novo cadastro concluído com e-mail confirmado pelo seu convite.</p><label class="farm-form">Seu convite<input id="invite-link" readonly value="${esc(location.origin+'/convite/'+cloud.code)}" /></label><button id="share-invite" class="primary">Compartilhar convite</button><button class="secondary" id="copy-invite">Copiar convite</button><p class="quiet-note">${data.referrals?.completed??0} cadastros confirmados · ${data.referrals?.earned??0} moedas recebidas${data.referrals?.pending?' · '+data.referrals.pending+' aguardando confirmação':''}</p>${data.referrals?.verificationPending?'<p>Seu convite está registrado. Entre com Google ou confirme o e-mail para liberar a recompensa do seu amigo.</p><button id="verify-invite-email" class="secondary">Confirmar meu e-mail</button>':''}</section><button class="secondary" id="refresh-friends">Atualizar amigos</button><p>Seu código: <strong class="friend-code">${esc(cloud.code)}</strong></p><form id="friend-form" class="farm-form inline-form"><label>Código de um amigo<input name="code" minlength="10" maxlength="10" required autocapitalize="characters" /></label><button class="secondary">Adicionar</button></form><p id="online-feedback" role="status" aria-live="polite"></p><h3>Seus vizinhos</h3>${data.friends.length?data.friends.map(f=>`<div class="item-row"><div class="item-info"><strong>${esc(f.name)}</strong><small>${esc(f.code)} · ${f.accepted?'Amigos':f.incoming?'Quer ser seu amigo':'Pedido enviado'}</small></div>${f.accepted?`<button data-visit="${f.code}">Visitar</button><button data-chat="${f.code}">Conversar</button><details class="friend-options"><summary>Opções</summary><button data-friend-action="unfriend" data-code="${f.code}">Remover amizade</button><button data-friend-action="block" data-code="${f.code}">Bloquear</button></details>`:f.incoming?`<button data-accept="${f.code}">Aceitar</button><button data-friend-action="decline" data-code="${f.code}">Recusar</button>`:`<button data-friend-action="cancel-friend" data-code="${f.code}">Cancelar pedido</button>`}</div>`).join(''):'<p>Convide alguém pelo código para visitar sua fazenda.</p>'}${data.blocked?.length?`<details><summary>Contatos bloqueados</summary>${data.blocked.map(f=>`<div class="item-row"><span>${esc(f.name)}</span><button data-friend-action="unblock" data-code="${f.code}">Desbloquear</button></div>`).join('')}</details>`:''}`);
      $<HTMLFormElement>('friend-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget as HTMLFormElement;void run(form.querySelector('button')!,async()=>{const r=await cloud.command({type:'friend',code:String(new FormData(form).get('code')).trim().toUpperCase()});await community();status(r.message!);});};
      document.querySelectorAll<HTMLButtonElement>('[data-accept]').forEach(b=>b.onclick=()=>run(b,async()=>{await cloud.command({type:'accept',code:b.dataset.accept});await community();}));
      document.querySelectorAll<HTMLButtonElement>('[data-visit]').forEach(b=>b.onclick=()=>void visit(b.dataset.visit!));
      document.querySelectorAll<HTMLButtonElement>('[data-chat]').forEach(b=>b.onclick=()=>void chat(b.dataset.chat!));
      document.querySelectorAll<HTMLButtonElement>('[data-friend-action]').forEach(b=>b.onclick=()=>run(b,async()=>{if(['block','unfriend'].includes(b.dataset.friendAction!)&&!confirm(b.dataset.friendAction==='block'?'Bloquear este contato e encerrar a amizade?':'Remover esta amizade?'))return;const r=await cloud.command({type:b.dataset.friendAction,code:b.dataset.code});await community(r.message??'Concluído.');}));
      $('share-invite').onclick=()=>{const url=$<HTMLInputElement>('invite-link').value;if(navigator.share)void navigator.share({title:'Fazendinha WJ',text:cloud.name+' convida: venha conhecer minha fazenda!',url}).catch(e=>{if(e.name!=='AbortError')status('Use Copiar convite para compartilhar.');});else $('copy-invite').click();};
      $('copy-invite').onclick=()=>void run($<HTMLButtonElement>('copy-invite'),async()=>{const input=$<HTMLInputElement>('invite-link');try{await navigator.clipboard.writeText(input.value);status('Convite copiado!');}catch{input.select();status('Selecione e copie seu convite.');}});
      if($('verify-invite-email'))$('verify-invite-email').onclick=()=>void verifyReferralEmail();
      $('refresh-friends').onclick=()=>void community();
      if(message)status(message);
      communityTimer=setTimeout(()=>{if(panel.open&&document.getElementById('friend-form')&&!document.hidden){const input=document.querySelector<HTMLInputElement>('#friend-form input');if(!input?.value&&document.activeElement?.tagName!=='INPUT')void community('',true);}},15000);
      if(preserveScroll&&panel)panel.scrollTop=scroll;
    }catch(e){status(e instanceof Error?e.message:'Não foi possível abrir a comunidade.');if(preserveScroll)throw e;}
  }
  async function verifyReferralEmail(){
    const button=$<HTMLButtonElement>('verify-invite-email');await run(button,async()=>{const a=await auth(),session=await a.getSession(),email=session.data?.user?.email;if(!email)throw new Error('Entre novamente na conta.');const sent=await a.emailOtp.sendVerificationOtp({email,type:'email-verification'});if(sent.error)throw new Error(sent.error.message);open('Confirme seu e-mail',`<p>Enviamos um código para o e-mail da sua conta.</p><form id="referral-verify" class="farm-form"><label>Código<input name="otp" autocomplete="one-time-code" inputmode="numeric" required /></label><p id="online-feedback" role="status"></p><button class="primary">Confirmar</button></form>`);const form=$<HTMLFormElement>('referral-verify');form.onsubmit=e=>{e.preventDefault();void run(form.querySelector('button')!,async()=>{const r=await a.emailOtp.verifyEmail({email,otp:String(new FormData(form).get('otp'))});if(r.error)throw new Error(r.error.message);await cloud.refresh();await community('E-mail confirmado. Obrigado por chegar pelo convite!');});};});
  }
  async function chat(code:string){
    stopChat?.();if(communityTimer)clearTimeout(communityTimer);open('Conversa entre amigos','<p id="online-feedback" role="status">Abrindo conversa…</p>');
    try{const page=await cloud.chatRequest(`?code=${code}`);open(`Conversa com ${esc(page.friend.name)}`,'<section id="friend-chat"></section><button class="secondary" id="chat-back">Voltar aos amigos</button>');stopChat=mountChat($('friend-chat'),cloud,code,status);$('chat-back').onclick=()=>void community();}catch(e){status((e as Error).message);}
  }
  async function visit(code:string){
    try{
      const v=await cloud.request(`?visit=${code}`),now=v.now;if(onVisit){close();onVisit(code,v);return;}
      const own=getFarm();
      open(`Fazenda de ${esc(v.name)}`,`<p>Ajude a regar, plantar com uma semente sua ou remover pragas: cuidados em vários canteiros; +5 XP no primeiro cuidado de cada tipo por canteiro/dia.</p><label class="farm-form">Semente para ajudar<select id="visit-seed">${(Object.keys(CROPS) as Crop[]).map(c=>`<option value="${c}">${CROPS[c].name} (${own.seeds[c]})</option>`).join('')}</select></label><p class="quiet-note">${v.protected?'🐕 Fazenda protegida contra roubo.':v.socialRaids&&own.socialRaids?'A brincadeira está ativada para vocês. Só é possível pegar 1 produto maduro por dia.':'Roubo disponível apenas quando os dois amigos ativam a opção em Minha fazenda.'}</p><div class="visit-grid">${v.plots.map((p:any)=>{
       if(p.id>=(v.unlockedPlots??24))return '<button class="visit-plot" disabled><small>Bloqueado</small></button>';
       const left=remaining(p,now),pest=hasPests(p,now);let action='',mode='',label='Vazio';
       if(!p.crop){action='help';mode='plant';label='Plantar';}
       else if(pest){action='help';mode='clean';label='Tirar pragas';}
       else if(p.wateredAt===null){action='help';mode='water';label='Regar';}
       else if(left===0){label='Maduro';if(v.socialRaids&&own.socialRaids&&!v.protected&&!(p.stolen??0)){action='steal';label='Pegar 1';}}
       else label=`${Math.ceil(left!/1000)}s`;
       return `<button class="visit-plot" data-visit-action="${action}" data-mode="${mode}" data-plot="${p.id}" ${!action?'disabled':''}>${p.crop?`<img src="${['carrot','lettuce','tomato'].includes(p.crop)?`/assets/v2/${p.crop}-3.png`:`/assets/v5/${p.crop}.png`}" alt="${CROPS[p.crop as Crop].name}" />`:'🌱'}<small>${label}</small></button>`;
      }).join('')}</div><p id="online-feedback" role="status"></p><button class="secondary" id="back-community">Voltar aos amigos</button>`);
      document.querySelectorAll<HTMLButtonElement>('[data-visit-action]').forEach(b=>b.onclick=()=>run(b,async()=>{if(!b.dataset.visitAction)return;const crop=$<HTMLSelectElement>('visit-seed').value;const r=await cloud.command({type:b.dataset.visitAction,code,plot:Number(b.dataset.plot),mode:b.dataset.mode,crop});await visit(code);status(r.message!);}));
      $('back-community').onclick=()=>void community();
    }catch(e){status(e instanceof Error?e.message:'Não foi possível visitar.');}
  }
  $('account').onclick=account;$('progression').onclick=progression;$('community').onclick=()=>void community();
  return {account,progression,community,visit,chat};
}
