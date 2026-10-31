import {invitation,clearInvitation} from './referral-link';
import {SKIN_CHOICES,HAIR_CHOICES,paletteOptions} from './avatar-options';
import {WELCOME_DONE_KEY,welcomeDestination,welcomeHTML} from './welcome';
import {googleSignIn, auth, type CloudFarm } from './cloud';
import { SHIRT_COLORS,type Avatar } from './content';
import type { Farm } from './farm';
import { CHARACTER_PRESETS,PROFILE_DRAFT_KEY,readProfileDraft,normalizePlayerName,needsInitialProfile,profileEntryAction,sameAvatar,type ProfileDraft } from './profile';
type Services={cloud:CloudFarm;farm:()=>Farm;preview:(avatar:Avatar)=>string;block:(active:boolean)=>void;entered:()=>void;toast:(s:string)=>void};
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function setupJourney(s:Services){
 invitation();const root=document.getElementById('journey')!;let draft:ProfileDraft;let busy=false,finishing=false;let editRequested=new URLSearchParams(location.search).get('setup')==='character',editReady=false;
 draft=readProfileDraft(null);
 // Old anonymous drafts must not resume registration on a later visit.
 try{localStorage.removeItem(PROFILE_DRAFT_KEY);}catch{}
 function feedback(message:string){const el=document.getElementById('journey-feedback');if(el)el.textContent=message;}
 function show(){root.classList.remove('welcome-screen');root.hidden=false;document.body.classList.add('journey-open');s.block(true);render();}
 function enter(){const ref=invitation();if(ref)sessionStorage.setItem('wj-pending-friend',ref);clearInvitation();editRequested=false;editReady=false;const url=new URL(location.href);if(url.searchParams.has('setup')){url.searchParams.delete('setup');history.replaceState(null,'',url);}root.classList.remove('welcome-screen');try{localStorage.setItem(WELCOME_DONE_KEY,'1');localStorage.removeItem(PROFILE_DRAFT_KEY);}catch{}root.hidden=true;root.replaceChildren();document.body.classList.remove('journey-open');s.block(false);s.entered();}
 function header(title:string){return `<div class="journey-brand">WJ TECNOLOGIA <span>VALE DO SOSSEGO</span></div>${s.cloud.active?`<ol class="journey-steps" aria-label="Sua chegada ao vale">${['Nome','Personagem','Confirmar'].map((n,i)=>`<li ${draft.step===i+1?'aria-current="step"':''}><span>${i+1}</span>${n}</li>`).join('')}</ol>`:''}<h1>${title}</h1>`;}
 async function run(work:()=>Promise<void>){if(busy)return;busy=true;root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);try{await work();}catch(e){feedback((e as Error).message);}finally{busy=false;root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=false);}}
 function render(){
  const start=draft.step===1?header('Como vamos chamar você?')+`<p>Seu nome vai acompanhar suas visitas e histórias no vale.</p><form id="journey-name-form" class="farm-form"><label>Nome do jogador<input name="playerName" maxlength="24" autocomplete="nickname" value="${esc(draft.name)}" placeholder="Seu nome no vale" required /></label><p id="journey-feedback" role="status" aria-live="polite"></p><button class="primary">Escolher personagem</button></form><button class="journey-link" id="returning-player">Já tenho uma fazenda · entrar na conta</button>`:
  draft.step===2?header('Escolha quem vai viver esta história')+`<p>Oi, <b>${esc(draft.name)}</b>! Escolha um personagem e ajuste sua aparência como quiser.</p><div class="character-grid" role="group" aria-label="Personagens disponíveis">${CHARACTER_PRESETS.map((p,index)=>`<button class="character-card" data-preset="${p.id}" aria-pressed="${JSON.stringify(p.avatar)===JSON.stringify(draft.avatar)}"><img src="${s.preview(p.avatar)}" alt="Personagem ${index+1}"/></button>`).join('')}</div><form id="journey-avatar-form" class="farm-form"><div class="journey-custom"><div class="avatar-stage"><img id="journey-avatar-preview" alt="Seu personagem selecionado" src="${s.preview(draft.avatar)}"/><span>SEU PERSONAGEM</span></div><div><input type="hidden" name="style" value="${draft.avatar.style}"><label>Tom de pele<select name="skin">${paletteOptions(SKIN_CHOICES,draft.avatar.skin)}</select></label></div></div><div class="form-pair"><label>Cabelo<select name="hair">${paletteOptions(HAIR_CHOICES,draft.avatar.hair)}</select></label><label>Roupa<select name="shirt">${SHIRT_COLORS.map((_,i)=>`<option value="${i}" ${draft.avatar.shirt===i?'selected':''}>${['Verde','Azul','Rosa','Mostarda','Violeta','Creme','Preto'][i]}</option>`).join('')}</select></label></div><p id="journey-feedback" role="status" aria-live="polite"></p><button class="primary">Confirmar personagem</button></form><button class="journey-link" id="journey-back">Voltar ao nome</button>`:
  header(s.cloud.active?'Confirme seu personagem':'Entre para escolher seu personagem')+`${s.cloud.active?`<div class="journey-identity"><img src="${s.preview(draft.avatar)}" alt="Personagem escolhido"/><div><strong>${esc(draft.name||'Sua fazenda salva')}</strong><p>Mesmo progresso no celular e no computador.</p></div></div>`:''}<p>${s.cloud.active?'Conta conectada. Confirme suas escolhas para entrar.':'Entre com sua conta. Depois, escolha e confirme o personagem da sua fazenda. Seu progresso existente será preservado.'}</p><p id="journey-feedback" role="status" aria-live="polite">${new URLSearchParams(location.search).has('error')?'O acesso não foi concluído. Tente novamente.':''}</p><button class="primary google-login" id="journey-google">${s.cloud.active?'Salvar escolhas e entrar na fazenda':'Vincular conta Google / Gmail'}</button><p class="quiet-note">A autorização Google desta beta usa o provedor Neon. Pedimos somente sua identidade para entrar no jogo; não acessamos suas mensagens.</p><details class="journey-email"><summary>Entrar com e-mail e senha</summary><form class="farm-form" id="journey-email-form"><label>E-mail<input name="email" type="email" autocomplete="email" required /></label><label>Senha<input name="password" type="password" minlength="8" maxlength="128" autocomplete="current-password" required /></label><button class="secondary" type="submit">Entrar na conta</button><button class="secondary" id="journey-signup" type="button">Criar conta com e-mail</button></form></details><button class="journey-link" id="journey-back">Voltar ao personagem</button>`;
  root.innerHTML=`<main class="journey-card">${start}<p class="journey-footnote">Um pedacinho de terra. Uma história com a sua cara.</p></main>`;
  const nameForm=root.querySelector<HTMLFormElement>('#journey-name-form');
  if(nameForm){nameForm.onsubmit=e=>{e.preventDefault();const name=normalizePlayerName(new FormData(nameForm).get('playerName'));if(!name){feedback('Informe um nome com até 24 letras/números. Não deixe o nome vazio.');return;}draft.name=name;draft.step=2;try{render();root.scrollTop=0;}catch(e){feedback((e as Error).message);}};root.querySelector<HTMLButtonElement>('#returning-player')!.onclick=()=>{draft.step=3;render();};}
  root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.onclick=()=>{draft.avatar={...CHARACTER_PRESETS.find(p=>p.id===b.dataset.preset)!.avatar};const top=root.scrollTop;render();root.scrollTop=top;});
  const avatarForm=root.querySelector<HTMLFormElement>('#journey-avatar-form');
  if(avatarForm){avatarForm.onchange=()=>{const d=new FormData(avatarForm);draft.avatar={style:d.get('style'),skin:Number(d.get('skin')),hair:Number(d.get('hair')),shirt:Number(d.get('shirt'))} as Avatar;root.querySelector<HTMLImageElement>('#journey-avatar-preview')!.src=s.preview(draft.avatar);root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(JSON.stringify(CHARACTER_PRESETS.find(p=>p.id===b.dataset.preset)!.avatar)===JSON.stringify(draft.avatar))));};avatarForm.onsubmit=e=>{e.preventDefault();draft.step=3;render();root.scrollTop=0;};}
  const back=root.querySelector<HTMLButtonElement>('#journey-back');if(back)back.onclick=()=>{if(!s.cloud.active){draft=readProfileDraft(null);editRequested=false;welcome();return;}draft.step=draft.step===3?(draft.name?2:1):1;render();root.scrollTop=0;};
  bindAccountControls();
 }
 function bindAccountControls(){
  const google=root.querySelector<HTMLButtonElement>('#journey-google');if(google)google.onclick=()=>void run(async()=>{
   if(s.cloud.active){await acceptAccount();return;}localStorage.setItem('wj-cloud-session','1');feedback('Abrindo o Google…');
   await googleSignIn(false,editRequested);
  });
  const emailForm=root.querySelector<HTMLFormElement>('#journey-email-form');if(emailForm){
   const login=(signup:boolean)=>run(async()=>{if(!emailForm.reportValidity())return;const d=new FormData(emailForm);const a=await auth(),credentials={email:String(d.get('email')),password:String(d.get('password'))};const r=signup?await a.signUp.email({...credentials,name:draft.name||'Fazendeiro'}):await a.signIn.email(credentials);if(r.error)throw new Error(r.error.message||'Confira seu e-mail e sua senha.');if(!await s.cloud.connect())throw new Error('Não foi possível abrir sua conta. Tente novamente.');});
   emailForm.onsubmit=e=>{e.preventDefault();void login(false);};root.querySelector<HTMLButtonElement>('#journey-signup')!.onclick=()=>void login(true);
  }
 }
 function welcome(message=''){
  root.hidden=false;root.classList.add('welcome-screen');document.body.classList.add('journey-open');s.block(true);root.innerHTML=welcomeHTML();bindAccountControls();
  root.querySelector<HTMLButtonElement>('#welcome-profile')!.onclick=()=>{editRequested=true;editReady=false;draft=readProfileDraft(null);draft.step=s.cloud.active?1:3;show();};
  if(message)feedback(message);
 }
 async function acceptAccount(){
  if(finishing||!s.cloud.active)return;finishing=true;
  try{
   const action=profileEntryAction(s.farm(),draft,editRequested,editReady);
   if(action==='enter'){enter();return;}
   if(action==='choose'){draft={version:1,name:normalizePlayerName(s.farm().playerName)||normalizePlayerName(s.cloud.name)||'Fazendeiro',avatar:{...s.farm().avatar},step:2};editReady=true;show();return;}
   if(action==='complete'){draft.step=normalizePlayerName(draft.name)?2:1;show();return;}
   show();feedback('Salvando seu personagem na conta…');
   await s.cloud.command(action==='initialize'?{type:'initialize-profile',name:draft.name,avatar:draft.avatar,referral:invitation()}:{type:'avatar',avatar:draft.avatar});
   if(needsInitialProfile(s.farm())||!sameAvatar(s.farm().avatar,draft.avatar))throw new Error('Não foi possível confirmar o personagem escolhido. Tente novamente.');
   enter();s.toast('Personagem salvo na sua conta!');
  }catch(e){show();feedback((e as Error).message);}finally{finishing=false;}
 }
 s.cloud.onConnected=acceptAccount;
 return {show,acceptAccount,async start(hasLocalFarm:boolean){
  const marker=!!localStorage.getItem('wj-cloud-session')||new URLSearchParams(location.search).has('neon_auth_session_verifier');
  root.hidden=false;document.body.classList.add('journey-open');s.block(true);root.innerHTML='<main class="journey-card welcome-loading"><span>🌱</span><h1>Abrindo as porteiras…</h1><p>Preparando seu cantinho no campo.</p></main>';
  try{if(await s.cloud.connect())return;}catch{/* Keep saved choices and account progress intact. */}
  draft=readProfileDraft(null);
  const destination=welcomeDestination({connected:false,complete:!needsInitialProfile(s.farm()),hasLocalFarm,seen:localStorage.getItem(WELCOME_DONE_KEY)==='1',marker,draftName:draft.name});
  if(destination==='farm'){enter();return;}
  if(destination==='profile'){show();if(marker)feedback('Reconecte sua conta. Seu nome e personagem continuam guardados.');return;}
  welcome(marker?'Entre novamente para recuperar sua fazenda salva.':new URLSearchParams(location.search).has('error')?'O acesso não foi concluído. Você pode tentar novamente.':'');
 }};
}
