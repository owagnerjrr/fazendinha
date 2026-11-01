import {loginCallback} from './referral-link';
import{AuthTokenCache}from'./auth-token-cache';
import type { Farm } from './farm';
import type { OnlineFarm } from './online-rules';
import type { MarketItem } from './market';
export type Snapshot = { farm: OnlineFarm; revision: number; code?: string; name?: string; now: number; message?: string; harvest?: boolean };
export type Friend = {code:string;name:string;accepted:boolean;incoming:boolean};
export type Listing = {id:string;crop:MarketItem;quantity:number;price:number;mine:boolean;name:string;code:string};

let client: any;
export async function auth() { return client ??= (await import('@neondatabase/auth')).createAuthClient(`${location.origin}/api/auth`); }
const tokenCache=new AuthTokenCache(async()=>await(await auth()).token());
export const getAccessToken=(force=false)=>tokenCache.get(force);
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key==='wj-cloud-session')tokenCache.clear();});
export async function googleSignIn(link=false,chooseCharacter=false){
 tokenCache.clear();const status=await fetch('/api/auth-status',{cache:'no-store'});if(!status.ok||!(await status.json()).available)throw new Error('O acesso Google está indisponível agora. Tente novamente em instantes.');
 const a=await auth();localStorage.setItem('wj-cloud-session','1');const options={provider:'google',callbackURL:loginCallback(chooseCharacter),errorCallbackURL:location.origin+'/?error=google-cancelled'};
 const result=link?await a.linkSocial(options):await a.signIn.social(options);if(result.error)throw new Error(result.error.message||'Não foi possível abrir o Google. Suas escolhas foram preservadas.');return result;
}
export class CloudFarm {
  salePosition:()=>Farm['player']|undefined=()=>undefined;
  relocating=false;active=false; busy=false; revision=0; code=''; name=''; offset=0;
  private accessToken='';
  private pendingCount=0;
  private queue:Promise<unknown>=Promise.resolve();
  onConnected:()=>Promise<void>|void=()=>{};
  onSnapshot: (snapshot:Snapshot,initial:boolean)=>void = ()=>{};
  onStatus:(message:string)=>void=()=>{};
  async request(path='',body?:unknown,endpoint='/api/game',timeoutMs=15000) {
    for(let attempt=0;attempt<2;attempt++){
      const token=await getAccessToken(attempt>0);this.accessToken=token;
      const response=await fetch(`${endpoint}${path}`,{method:body?'POST':'GET',headers:{'X-Farm-Version':'18',Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(timeoutMs)});
      if(response.status===401&&attempt===0)continue;
      const result=await response.json();
      if(!response.ok){const retryAfter=Math.max(1,Number(response.headers.get('Retry-After'))||15),error=new Error(response.status===429?`Muitas consultas em sequência. Aguarde ${retryAfter} segundos; seu progresso está salvo.`:result.error??'Falha ao sincronizar.')as Error&{status:number;retryAfter:number};error.status=response.status;error.retryAfter=retryAfter;throw error;}
      return result;
    }
    throw Error('Sua sessão expirou. Entre novamente.');
  }

  accept(snapshot:Snapshot,initial=false) { if(!initial&&snapshot.revision<this.revision) return; this.revision=snapshot.revision; this.offset=snapshot.now-Date.now(); this.code=snapshot.code??this.code; this.name=snapshot.name??this.name; this.onSnapshot(snapshot,initial); this.onStatus('Progresso online sincronizado'); }
  async connect() { tokenCache.clear();const a=await auth(), session=await a.getSession(); if(session.error)throw new Error(session.error.message||'Não foi possível recuperar sua sessão.');if(!session.data?.user) return false; const result=await this.request(); this.active=true; this.accept(result,true); localStorage.setItem('wj-cloud-session','1'); await this.retryPending();await this.onConnected(); return true; }
  async refresh() { if(!this.active||this.busy||sessionStorage.getItem('wj-pending-action')) return; try { this.accept(await this.request()); } catch { this.onStatus('Sem conexão · reconecte para continuar'); } }
  async retryPending() {
    const raw=sessionStorage.getItem('wj-pending-action'); if(!raw) return null;
    let p;try{p=JSON.parse(raw);if(!p||typeof p.code!=='string'||!p.body||typeof p.body.id!=='string'||!p.body.command||typeof p.body.command!=='object')throw new Error();}catch{sessionStorage.removeItem('wj-pending-action');this.accept(await this.request());return null;}
    // Pending payloads are scoped to the public farm code, never applied to another account.
    if(p.code!==this.code) { sessionStorage.removeItem('wj-pending-action'); return null; }
    try { const snapshot=await this.request('',p.body);this.accept(snapshot);sessionStorage.removeItem('wj-pending-action');return snapshot as Snapshot; }
    catch(error) { if((error as any).status&& (error as any).status<500) {sessionStorage.removeItem('wj-pending-action');this.accept(await this.request());return null;} else throw error; }
  }
  command(command:unknown,position?:Farm['player']):Promise<Snapshot> {
    if(this.relocating)return Promise.reject(new Error('Sua posição foi corrigida pela administração. O jogo será reaberto.'));
    if((command as {type?:string})?.type==='list'){position??=this.salePosition();if(!position)return Promise.reject(new Error('Vá até a venda para anunciar produtos na feira.'));}
    this.pendingCount++;this.busy=true;
    const task=this.queue.then(async()=>{
      this.busy=true; this.onStatus('Sincronizando…');
      try {
        const rawPending=sessionStorage.getItem('wj-pending-action'),hadPending=!!rawPending;let priorCommand:any;try{priorCommand=rawPending?JSON.parse(rawPending).body?.command:undefined;}catch{}
        const recovered=await this.retryPending();
        if(hadPending&&priorCommand?.type!=='position'&&!(priorCommand?.type==='visit-animal-care'&&priorCommand?.mode==='walk-keepalive')){if(recovered&&JSON.stringify(priorCommand)===JSON.stringify(command))return recovered;throw new Error(recovered?('Ação anterior confirmada: '+(recovered.message??'progresso salvo')+' Confira antes de iniciar outra ação.'):'Fazenda atualizada. Confira o resultado antes de repetir a ação.');}
        const body={id:crypto.randomUUID(),revision:this.revision,command,position};
        sessionStorage.setItem('wj-pending-action',JSON.stringify({code:this.code,body}));
        const snapshot=await this.request('',body);sessionStorage.removeItem('wj-pending-action');this.accept(snapshot);return snapshot;
      } catch(error) {
        const status=(error as any).status;
        if(status&&status<500) {sessionStorage.removeItem('wj-pending-action');try{this.accept(await this.request());}catch{}}
        this.onStatus('Ação não confirmada · tente novamente');throw error;
      } finally {this.pendingCount--;this.busy=this.pendingCount>0;}
    }); this.queue=task.catch(()=>{}); return task;
  }
  flushPosition(position:Farm['player']) {
    if(this.relocating||!this.active||this.busy||!this.accessToken||sessionStorage.getItem('wj-pending-action'))return;
    const body={id:crypto.randomUUID(),revision:this.revision,command:{type:'position'},position};
    sessionStorage.setItem('wj-pending-action',JSON.stringify({code:this.code,body}));
    // Persist a receipt first: a new page can safely confirm the same request after closing this one.
    void fetch('/api/game',{method:'POST',headers:{'X-Farm-Version':'18',Authorization:`Bearer ${this.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).then(async response=>{
      if(!response.ok)return;
      const result=await response.json();
      const pending=sessionStorage.getItem('wj-pending-action');
      if(pending&&JSON.parse(pending).body.id===body.id){sessionStorage.removeItem('wj-pending-action');this.accept(result);}
    }).catch(()=>{});
  }
  chatRequest(path='',body?:unknown){return this.request(path,body,'/api/chat');}
  async disconnect() { if(this.busy) throw new Error('Aguarde a sincronização antes de sair.'); await this.retryPending(); await (await auth()).signOut(); this.active=false;this.accessToken='';tokenCache.clear();localStorage.removeItem('wj-cloud-session'); }
}
