import {loginCallback} from './referral-link';
import { sessionToken } from './session-token';
import type { Farm } from './farm';
import type { OnlineFarm } from './online-rules';
import type { MarketItem } from './market';
export type Snapshot = { farm: OnlineFarm; revision: number; code?: string; name?: string; now: number; message?: string; harvest?: boolean };
export type Friend = {code:string;name:string;accepted:boolean;incoming:boolean};
export type Listing = {id:string;crop:MarketItem;quantity:number;price:number;mine:boolean;name:string;code:string};

let client: any;
export async function auth() { return client ??= (await import('@neondatabase/auth')).createAuthClient(`${location.origin}/api/auth`); }
export async function googleSignIn(link=false,chooseCharacter=false){
 const status=await fetch('/api/auth-status',{cache:'no-store'});if(!status.ok||!(await status.json()).available)throw new Error('O acesso Google está indisponível agora. Tente novamente em instantes.');
 const a=await auth();localStorage.setItem('wj-cloud-session','1');const options={provider:'google',callbackURL:loginCallback(chooseCharacter),errorCallbackURL:location.origin+'/?error=google-cancelled'};
 const result=link?await a.linkSocial(options):await a.signIn.social(options);if(result.error)throw new Error(result.error.message||'Não foi possível abrir o Google. Suas escolhas foram preservadas.');return result;
}
export class CloudFarm {
  salePosition:()=>Farm['player']|undefined=()=>undefined;
  active=false; busy=false; revision=0; code=''; name=''; offset=0;
  private accessToken='';
  private pendingCount=0;
  private queue:Promise<unknown>=Promise.resolve();
  onConnected:()=>Promise<void>|void=()=>{};
  onSnapshot: (snapshot:Snapshot,initial:boolean)=>void = ()=>{};
  onStatus:(message:string)=>void=()=>{};
  async request(path='',body?:unknown,endpoint='/api/game',timeoutMs=15000) {
    const a=await auth(), token=sessionToken(await a.token()); if(!token) throw new Error('Sua sessão expirou. Entre novamente.');
    this.accessToken=token;
    const r=await fetch(`${endpoint}${path}`,{method:body?'POST':'GET',headers:{'X-Farm-Version':'9',Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(timeoutMs)});
    const result=await r.json(); if(!r.ok) { const error=new Error(result.error??'Falha ao sincronizar.') as Error & {status:number}; error.status=r.status; throw error; } return result;
  }
  accept(snapshot:Snapshot,initial=false) { if(!initial&&snapshot.revision<this.revision) return; this.revision=snapshot.revision; this.offset=snapshot.now-Date.now(); this.code=snapshot.code??this.code; this.name=snapshot.name??this.name; this.onSnapshot(snapshot,initial); this.onStatus('Progresso online sincronizado'); }
  async connect() { const a=await auth(), session=await a.getSession(); if(session.error)throw new Error(session.error.message||'Não foi possível recuperar sua sessão.');if(!session.data?.user) return false; const result=await this.request(); this.active=true; this.accept(result,true); localStorage.setItem('wj-cloud-session','1'); await this.retryPending();await this.onConnected(); return true; }
  async refresh() { if(!this.active||this.busy||sessionStorage.getItem('wj-pending-action')) return; try { this.accept(await this.request()); } catch { this.onStatus('Sem conexão · reconecte para continuar'); } }
  async retryPending() {
    const raw=sessionStorage.getItem('wj-pending-action'); if(!raw) return null;
    const p=JSON.parse(raw);
    // Pending payloads are scoped to the public farm code, never applied to another account.
    if(p.code!==this.code) { sessionStorage.removeItem('wj-pending-action'); return null; }
    try { const snapshot=await this.request('',p.body);this.accept(snapshot);sessionStorage.removeItem('wj-pending-action');return snapshot as Snapshot; }
    catch(error) { if((error as any).status&& (error as any).status<500) {sessionStorage.removeItem('wj-pending-action');this.accept(await this.request());return null;} else throw error; }
  }
  command(command:unknown,position?:Farm['player']):Promise<Snapshot> {
    if((command as {type?:string})?.type==='list'){position??=this.salePosition();if(!position)return Promise.reject(new Error('Vá até a venda para anunciar produtos na feira.'));}
    this.pendingCount++;this.busy=true;
    const task=this.queue.then(async()=>{
      this.busy=true; this.onStatus('Sincronizando…');
      try {
        const hadPending=!!sessionStorage.getItem('wj-pending-action');
        const recovered=await this.retryPending();
        if(hadPending){if(recovered)return recovered;throw new Error('Fazenda atualizada. Confira o resultado antes de repetir a ação.');}
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
    if(!this.active||this.busy||!this.accessToken||sessionStorage.getItem('wj-pending-action'))return;
    const body={id:crypto.randomUUID(),revision:this.revision,command:{type:'position'},position};
    sessionStorage.setItem('wj-pending-action',JSON.stringify({code:this.code,body}));
    // Persist a receipt first: a new page can safely confirm the same request after closing this one.
    void fetch('/api/game',{method:'POST',headers:{'X-Farm-Version':'9',Authorization:`Bearer ${this.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).then(async response=>{
      if(!response.ok)return;
      const result=await response.json();
      const pending=sessionStorage.getItem('wj-pending-action');
      if(pending&&JSON.parse(pending).body.id===body.id){sessionStorage.removeItem('wj-pending-action');this.accept(result);}
    }).catch(()=>{});
  }
  chatRequest(path='',body?:unknown){return this.request(path,body,'/api/chat');}
  async disconnect() { if(this.busy) throw new Error('Aguarde a sincronização antes de sair.'); await this.retryPending(); await (await auth()).signOut(); this.active=false;localStorage.removeItem('wj-cloud-session'); }
}
