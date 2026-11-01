import{sessionToken}from'./session-token';
type TokenResult=Parameters<typeof sessionToken>[0];
export class AuthBusyError extends Error{status=429;constructor(public retryAfter=15){super(`A conexão está ocupada. Aguarde ${retryAfter} segundos; seu progresso continua salvo.`);}}
/** Memory only; the server remains responsible for signature, identity and authorization. */
export class AuthTokenCache{
 private token='';private expires=0;private refreshAt=0;private retryAt=0;private pending?:Promise<string>;private epoch=0;
 constructor(private fetchToken:()=>Promise<TokenResult>,private now=()=>Date.now()){}
 clear(){this.epoch++;this.token='';this.expires=0;this.refreshAt=0;this.retryAt=0;this.pending=undefined;}
 async get(force=false):Promise<string>{const now=this.now();if(!force&&this.token&&now<this.refreshAt)return this.token;if(now<this.retryAt){if(this.token&&now<this.expires-5000)return this.token;throw new AuthBusyError(Math.max(1,Math.ceil((this.retryAt-now)/1000)));}if(this.pending)return this.pending;const epoch=this.epoch;
  const task=(async()=>{try{const result=await this.fetchToken();if(epoch!==this.epoch)throw Error('A sessão mudou. Entre novamente.');const token=sessionToken(result);if(!token){const error=result.error as {status?:number;message?:string}|undefined;if(error?.status===429||/too many|rate.limit|muitas consultas|muitas solicitações/i.test(error?.message??''))throw new AuthBusyError();throw Error('Sua sessão expirou. Entre novamente.');}let expires=this.now()+30000;try{const part=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),payload=JSON.parse(atob(part));if(Number.isFinite(payload.exp))expires=payload.exp*1000;}catch{/* Unknown expiry receives a short memory-only lifetime. */}if(expires<=this.now()+5000)throw Error('Sua sessão expirou. Entre novamente.');this.token=token;this.expires=expires;this.refreshAt=Math.min(this.now()+240000,expires-Math.min(60000,(expires-this.now())/3));this.retryAt=0;return token;
  }catch(error){if(epoch!==this.epoch)throw error;const e=error as Error&{status?:number};if(e.status===429||/too many|rate.limit|muitas consultas|muitas solicitações/i.test(e.message)){this.retryAt=this.now()+15000;if(this.token&&this.now()<this.expires-5000)return this.token;throw new AuthBusyError();}throw error;}})();this.pending=task;try{return await task;}finally{if(this.pending===task)this.pending=undefined;}
 }
}
