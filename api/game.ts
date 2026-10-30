import { identity } from '../server/auth.js';
import { requiresNewClient, CLIENT_UPDATE_MESSAGE } from '../src/client-compat.js';
import { community, ensureFarm, GameError, mutate, snapshot, visit } from '../server/game.js';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function handle(request:Request) {
  try {
    const user=await identity(request);
    await ensureFarm(user.id,user.name,['5','6'].includes(request.headers.get('X-Farm-Version')??''));
    const url=new URL(request.url);
    // Cached clients from before the new species cannot render their animal kinds safely.
    // Refuse their requests before mutating data and ask them to update the app.
    if(request.headers.get('X-Farm-Version')!=='6'){
      const existing=await snapshot(user.id);
      if(requiresNewClient(existing.farm,request.headers.get('X-Farm-Version')))return json({error:CLIENT_UPDATE_MESSAGE},409);
    }
    if(request.method==='GET') {
      if(url.searchParams.has('community')) return json(await community(user.id,url.searchParams.get('marketVersion')==='2'?2:1));
      if(url.searchParams.has('visit')) return json(await visit(user.id,url.searchParams.get('visit')!));
      return json(await snapshot(user.id));
    }
    if(request.method!=='POST') return json({error:'Método não permitido.'},405);
    if(!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Envie JSON.'},415);
    const raw=await request.text(); if(raw.length>4096) return json({error:'Pedido muito grande.'},413);
    let body; try { body=JSON.parse(raw); } catch { return json({error:'JSON inválido.'},400); }
    return json(await mutate(user.id,body,request.headers.get('X-Farm-Version')));
  } catch(error) {
    if(error instanceof Error && error.message==='UNAUTHORIZED') return json({error:'Entre na sua conta para continuar.'},401);
    if(error instanceof GameError) return json({error:error.message},error.status);
    console.error('game_request_failed',error instanceof Error ? error.name : 'unknown');
    return json({error:'Não foi possível sincronizar agora. Tente novamente.'},503);
  }
}
export const GET=handle;
export const POST=handle;
